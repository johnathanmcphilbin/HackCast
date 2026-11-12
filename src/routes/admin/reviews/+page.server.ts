import { fail } from '@sveltejs/kit';
import { formatHours } from '#lib/server/hackatime.ts';
import { sendApproved } from '#lib/server/send.ts';
import { requireStaff } from '#lib/server/staff.ts';
import { UUID } from '#lib/server/submission-form.ts';
import { submissionsWithStatus, type Submission } from '#lib/server/submissions.ts';
import type { Actions, PageServerLoad } from './$types';

function row(item: Submission) {
	return {
		id: item.id,
		projectName: item.projectName,
		builder: item.builderName,
		email: item.email,
		kind: item.kind,
		status: item.status,
		tracked: formatHours(item.trackedSeconds),
		approved: item.approvedSeconds == null ? null : formatHours(item.approvedSeconds),
		reviewer: item.reviewerName,
		submittedAt: item.submittedAt.toISOString(),
		decidedAt: item.decidedAt?.toISOString() ?? null
	};
}

export const load: PageServerLoad = async (event) => {
	await requireStaff(event, 'reviewer', '/admin/reviews');
	try {
		const [pending, unsent, decided] = await Promise.all([
			submissionsWithStatus(['pending']),
			submissionsWithStatus(['approved']),
			submissionsWithStatus(['changes_requested', 'rejected', 'sent'], 40)
		]);
		return { unavailable: false, pending: pending.map(row), unsent: unsent.map(row), decided: decided.map(row) };
	} catch {
		console.error('review queue failed');
		return { unavailable: true, pending: [], unsent: [], decided: [] };
	}
};

export const actions: Actions = {
	send: async (event) => {
		await requireStaff(event, 'reviewer', '/admin/reviews');
		const id = String((await event.request.formData()).get('id') ?? '');
		if (!UUID.test(id)) return fail(400, { message: 'Pick a submission.' });
		const problem = await sendApproved(id);
		return problem ? fail(502, { message: problem }) : { message: 'Sent to Airtable.' };
	}
};
