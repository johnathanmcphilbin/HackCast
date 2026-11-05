import { error, fail, redirect } from '@sveltejs/kit';
import { fetchHackatimeProjects, formatHours } from '#lib/server/hackatime.ts';
import { sendApproved } from '#lib/server/send.ts';
import { requireStaff } from '#lib/server/staff.ts';
import { parseDecision, UUID } from '#lib/server/submission-form.ts';
import { decide, getSubmission, moveBackToQueue, reviewLog } from '#lib/server/submissions.ts';
import { hackatimeAccessToken } from '#lib/server/users.ts';
import type { Actions, PageServerLoad } from './$types';

function idFrom(params: { id: string }): string {
	if (!UUID.test(params.id)) error(404);
	return params.id;
}

export const load: PageServerLoad = async (event) => {
	const { role } = await requireStaff(event, 'reviewer', '/admin/reviews');
	const id = idFrom(event.params);
	const submission = await getSubmission(id);
	if (!submission) error(404);
	const log = await reviewLog(id);

	// Hackatime as it is now, next to what it said when they submitted.
	let liveSeconds: number | null = null;
	let languages: string[] = [];
	if (submission.kind === 'software' && submission.hackatimeProject) {
		const token = await hackatimeAccessToken(submission.builderHackclubId).catch(() => null);
		const projects = token ? await fetchHackatimeProjects(token) : null;
		const match = projects?.find((project) => project.name === submission.hackatimeProject);
		liveSeconds = match?.totalSeconds ?? null;
		languages = match?.languages ?? [];
	}

	return {
		role,
		submission: {
			...submission,
			submittedAt: submission.submittedAt.toISOString(),
			decidedAt: submission.decidedAt?.toISOString() ?? null,
			tracked: formatHours(submission.trackedSeconds),
			trackedHours: Math.round((submission.trackedSeconds / 3600) * 10) / 10,
			approved: submission.approvedSeconds == null ? null : formatHours(submission.approvedSeconds)
		},
		live: liveSeconds == null ? null : formatHours(liveSeconds),
		languages,
		log: log.map((entry) => ({
			...entry,
			decidedAt: entry.decidedAt.toISOString(),
			approved: entry.approvedSeconds == null ? null : formatHours(entry.approvedSeconds)
		}))
	};
};

export const actions: Actions = {
	decide: async (event) => {
		const { session } = await requireStaff(event, 'reviewer', '/admin/reviews');
		const id = idFrom(event.params);
		const parsed = parseDecision(await event.request.formData());
		if (!parsed.ok) return fail(400, { message: parsed.message });
		const changed = await decide({
			submissionId: id,
			reviewerHackclubId: session.sub,
			reviewerName: session.name,
			...parsed.value
		});
		if (!changed) return fail(409, { message: 'Someone else already decided this one.' });
		if (parsed.value.decision === 'approved') {
			const problem = await sendApproved(id);
			if (problem) return { message: `Approved. Not sent to Airtable yet: ${problem} Retry from the queue.` };
		}
		redirect(303, '/admin/reviews');
	},
	send: async (event) => {
		await requireStaff(event, 'reviewer', '/admin/reviews');
		const problem = await sendApproved(idFrom(event.params));
		return problem ? fail(502, { message: problem }) : { message: 'Sent to Airtable.' };
	},
	requeue: async (event) => {
		await requireStaff(event, 'admin', '/admin/reviews');
		const moved = await moveBackToQueue(idFrom(event.params));
		return moved ? { message: 'Back in the queue.' } : fail(409, { message: 'Only rejected submissions can go back.' });
	}
};
