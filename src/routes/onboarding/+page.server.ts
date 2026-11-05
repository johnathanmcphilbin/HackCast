import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { hackatimeCallback, hackatimeClient } from '#lib/server/config.ts';
import { requireSession } from '#lib/server/guards.ts';
import { fetchHackatimeProjects, formatHours } from '#lib/server/hackatime.ts';
import { cleanProjectName } from '#lib/server/projects.ts';
import {
	hackatimeAccessToken,
	hackatimeStatus,
	linkHackcastProject,
	listHackcastProjects,
	upsertUser
} from '#lib/server/users.ts';
import type { Actions, PageServerLoad } from './$types';

const NOTICES = ['connected', 'denied', 'failed', 'taken', 'soon'] as const;
type Notice = (typeof NOTICES)[number];

function firstName(name: string): string {
	return name.trim().split(/\s+/)[0] || 'there';
}

function noticeFrom(value: string | null): Notice | null {
	return NOTICES.find((item) => item === value) ?? null;
}

export const load: PageServerLoad = async (event) => {
	const session = requireSession(event, '/onboarding');
	const ready = Boolean(hackatimeClient() && hackatimeCallback(event.url.origin));
	const notice = noticeFrom(event.url.searchParams.get('hackatime'));
	const adding = event.url.searchParams.get('add') === '1';
	const base = {
		firstName: firstName(session.name),
		ready,
		notice,
		connected: false,
		unavailable: false,
		linked: [] as string[],
		projects: [] as { name: string; hours: string }[]
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
		if (!status.connected) {
			if (ready && !notice) redirect(303, '/auth/hackatime?next=/onboarding');
			return { ...base, linked };
		}
		if (linked.length > 0 && !adding) redirect(303, '/dashboard');

		const token = await hackatimeAccessToken(session.sub);
		const remote = token ? await fetchHackatimeProjects(token) : null;
		return {
			...base,
			connected: true,
			linked,
			projects: (remote ?? []).map((project) => ({
				name: project.name,
				hours: formatHours(project.totalSeconds)
			}))
		};
	} catch (err) {
		if (isRedirect(err)) throw err;
		console.error('onboarding load failed');
		return { ...base, unavailable: true };
	}
};

export const actions: Actions = {
	default: async (event) => {
		const session = requireSession(event, '/onboarding');
		const form = await event.request.formData();
		const typed = cleanProjectName(form.get('projectName'));
		const picked = cleanProjectName(form.get('project'));
		const name = typed ?? picked;
		if (!name) return fail(400, { message: 'Name the HackCast project. Use the Hackatime project name.' });

		try {
			await upsertUser({
				hackclubId: session.sub,
				displayName: session.name,
				email: '',
				slackId: session.slackId
			});
			const status = await hackatimeStatus(session.sub);
			if (!status.connected) redirect(303, '/auth/hackatime?next=/onboarding');
			await linkHackcastProject(session.sub, name);
		} catch (err) {
			if (isRedirect(err)) throw err;
			console.error('link HackCast project failed');
			return fail(500, { message: "Couldn't add that HackCast project. Try again." });
		}
		redirect(303, '/dashboard');
	}
};
