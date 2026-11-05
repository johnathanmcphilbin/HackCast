import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { hackatimeCallback, hackatimeClient } from '#lib/server/config.ts';
import { requireSession } from '#lib/server/guards.ts';
import { fetchHackatimeProjects, formatHours } from '#lib/server/hackatime.ts';
import { cleanProjectName, topProjects } from '#lib/server/projects.ts';
import {
	addHackcastProject,
	hackatimeAccessToken,
	hackatimeStatus,
	listHackcastProjects,
	upsertUser,
	type HackcastProject
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
		linked: [] as HackcastProject[],
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
		const linked = await listHackcastProjects(session.sub);
		// Stay on this page when Hackatime is missing. Bouncing into OAuth loops on `taken`.
		if (!status.connected) return { ...base, linked };
		if (linked.length > 0 && !adding) redirect(303, '/dashboard');

		const token = await hackatimeAccessToken(session.sub);
		const remote = token ? await fetchHackatimeProjects(token) : null;
		return {
			...base,
			connected: true,
			linked,
			projects: topProjects(remote ?? []).map((project) => ({
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

async function add(event: Parameters<Actions[string]>[0], name: string, hackatimeProject: string | null) {
	const session = requireSession(event, '/onboarding');
	try {
		await upsertUser({
			hackclubId: session.sub,
			displayName: session.name,
			email: '',
			slackId: session.slackId
		});
		if (hackatimeProject) {
			const status = await hackatimeStatus(session.sub);
			if (!status.connected) {
				return fail(400, { message: 'Connect Hackatime before linking one of its projects.' });
			}
		}
		await addHackcastProject(session.sub, name, hackatimeProject);
	} catch (err) {
		if (isRedirect(err)) throw err;
		console.error('add HackCast project failed');
		return fail(500, { message: "Couldn't add that HackCast project. Try again." });
	}
	redirect(303, '/dashboard');
}

export const actions: Actions = {
	// Track one of the Hackatime projects listed on the page.
	pick: async (event) => {
		const picked = cleanProjectName((await event.request.formData()).get('project'));
		if (!picked) return fail(400, { message: 'Pick one of your Hackatime projects.' });
		return add(event, picked, picked);
	},
	// Start a new HackCast project; a Hackatime project gets linked from the dashboard later.
	create: async (event) => {
		const name = cleanProjectName((await event.request.formData()).get('projectName'));
		if (!name) return fail(400, { message: 'Give the new HackCast project a name.' });
		return add(event, name, null);
	}
};
