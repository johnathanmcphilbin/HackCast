import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { hackatimeCallback, hackatimeClient } from '#lib/server/config.ts';
import { requireSession } from '#lib/server/guards.ts';
import { fetchHackatimeProfile, fetchHackatimeProjects, formatHours } from '#lib/server/hackatime.ts';
import { cleanProjectName } from '#lib/server/projects.ts';
import { approvedSecondsFor, submissionsFor, type SubmissionStatus } from '#lib/server/submissions.ts';
import {
	hackatimeAccessToken,
	hackatimeStatus,
	linkHackatimeProject,
	listHackcastProjects,
	upsertUser,
	type HackcastProject
} from '#lib/server/users.ts';
import type { Actions, PageServerLoad } from './$types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NOTICES = ['connected', 'denied', 'failed', 'taken', 'soon'] as const;
type Notice = (typeof NOTICES)[number];

function firstName(name: string): string {
	return name.trim().split(/\s+/)[0] || 'there';
}

function noticeFrom(value: string | null): Notice | null {
	return NOTICES.find((item) => item === value) ?? null;
}

/** Where each project is in review, and the approved hours the shop spends. */
async function reviewState(hackclubId: string): Promise<Partial<{ reviews: Record<string, { status: SubmissionStatus; approvedHours: string | null; feedback: string | null }>; approvedHours: string | null }>> {
	try {
		const [submissions, approved] = await Promise.all([submissionsFor(hackclubId), approvedSecondsFor(hackclubId)]);
		const reviews: Record<string, { status: SubmissionStatus; approvedHours: string | null; feedback: string | null }> = {};
		for (const item of submissions) {
			if (!item.projectId) continue;
			reviews[item.projectId] = {
				status: item.status,
				approvedHours: item.approvedSeconds == null ? null : formatHours(item.approvedSeconds),
				feedback: item.feedback
			};
		}
		return { reviews, approvedHours: approved > 0 ? formatHours(approved) : null };
	} catch {
		console.error('review state failed');
		return {};
	}
}

export const load: PageServerLoad = async (event) => {
	const session = requireSession(event, '/dashboard');
	const ready = Boolean(hackatimeClient() && hackatimeCallback(event.url.origin));
	const base = {
		firstName: firstName(session.name),
		ready,
		notice: noticeFrom(event.url.searchParams.get('hackatime')),
		connected: false,
		unavailable: false,
		hackatimeUserId: null as string | null,
		email: null as string | null,
		githubUsername: null as string | null,
		projects: null as { name: string; hours: string; languages: string }[] | null,
		totalHours: null as string | null,
		linked: [] as HackcastProject[],
		submitted: event.url.searchParams.get('submitted') === '1',
		reviews: {} as Record<string, { status: SubmissionStatus; approvedHours: string | null; feedback: string | null }>,
		approvedHours: null as string | null
	};

	try {
		await upsertUser({
			hackclubId: session.sub,
			displayName: session.name,
			email: '',
			slackId: session.slackId
		});
		const status = await hackatimeStatus(session.sub);
		const linked = status.connected ? await listHackcastProjects(session.sub) : [];
		Object.assign(base, await reviewState(session.sub));
		if (!status.connected) {
			if (ready && !base.notice) redirect(303, '/auth/hackatime?next=/onboarding');
			return { ...base, linked };
		}

		const token = await hackatimeAccessToken(session.sub);
		if (!token) {
			return { ...base, connected: true, hackatimeUserId: status.hackatimeUserId, linked };
		}

		const [profile, projects] = await Promise.all([
			fetchHackatimeProfile(token),
			fetchHackatimeProjects(token)
		]);
		const total = projects?.reduce((sum, project) => sum + project.totalSeconds, 0);
		return {
			...base,
			connected: true,
			hackatimeUserId: profile?.id ?? status.hackatimeUserId,
			email: profile?.email ?? null,
			githubUsername: profile?.githubUsername ?? null,
			projects: projects
				? [...projects].sort((a, b) => b.totalSeconds - a.totalSeconds).map((project) => ({
						name: project.name,
						hours: formatHours(project.totalSeconds),
						languages: project.languages.join(', ')
					}))
				: null,
			totalHours: total == null ? null : formatHours(total),
			linked
		};
	} catch (err) {
		if (isRedirect(err)) throw err;
		console.error('dashboard load failed');
		return { ...base, unavailable: true };
	}
};

export const actions: Actions = {
	// Link a Hackatime project to a HackCast project that was started without one.
	link: async (event) => {
		const session = requireSession(event, '/dashboard');
		const form = await event.request.formData();
		const projectId = String(form.get('projectId') ?? '');
		const hackatimeProject = cleanProjectName(form.get('hackatimeProject'));
		if (!UUID.test(projectId) || !hackatimeProject) {
			return fail(400, { message: 'Pick a Hackatime project to link.' });
		}
		try {
			const linked = await linkHackatimeProject(session.sub, projectId, hackatimeProject);
			if (!linked) return fail(400, { message: 'That Hackatime project is already linked.' });
		} catch {
			console.error('link Hackatime project failed');
			return fail(500, { message: "Couldn't link that Hackatime project. Try again." });
		}
		redirect(303, '/dashboard');
	}
};
