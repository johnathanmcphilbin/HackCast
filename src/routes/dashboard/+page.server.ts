import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { guestVoteEpisode, nextGuest } from '#lib/content.ts';
import { hackatimeCallback, hackatimeClient } from '#lib/server/config.ts';
import { requireSession } from '#lib/server/guards.ts';
import { fetchHackatimeProjects, formatHours, type HackatimeProject } from '#lib/server/hackatime.ts';
import { cleanProjectName, hatEntries, raceName, recentProjects } from '#lib/server/projects.ts';
import {
	askQuestion,
	cleanGuestRequest,
	cleanQuestion,
	guestVotesFrom,
	questionsFrom,
	voteGuest,
} from '#lib/server/questions.ts';
import { ShopError, placeRedemption, redemptionsFor, shippingAddressFor, spentSecondsFor } from '#lib/server/shop.ts';
import { UUID } from '#lib/server/submission-form.ts';
import { approvedSecondsFor, submissionsFor, type SubmissionStatus } from '#lib/server/submissions.ts';
import {
	addHackcastProject,
	hackatimeAccessToken,
	hackatimeStatus,
	hoursRace,
	linkHackatimeProject,
	listHackcastProjects,
	saveProjectSeconds,
	upsertUser
} from '#lib/server/users.ts';
import type { Actions, PageServerLoad } from './$types';

const NOTICES = ['connected', 'denied', 'failed', 'taken', 'soon'] as const;
type Notice = (typeof NOTICES)[number];

/** Hours on the dashboard are re-read from Hackatime when they're older than this. */
const STALE_MS = 10 * 60_000;
/** How many names the hours race shows before "… You". */
const RACE_TOP = 10;

function noticeFrom(value: string | null): Notice | null {
	return NOTICES.find((item) => item === value) ?? null;
}

async function remoteProjects(hackclubId: string): Promise<HackatimeProject[] | null> {
	const token = await hackatimeAccessToken(hackclubId);
	return token ? fetchHackatimeProjects(token) : null;
}

/** Read the project's hours from Hackatime and keep them for the race. */
async function refreshSeconds(
	project: { id: string; hackatimeProject: string | null },
	remote: HackatimeProject[] | null
): Promise<number | null> {
	if (!project.hackatimeProject || !remote) return null;
	const seconds = remote.find((item) => item.name === project.hackatimeProject)?.totalSeconds ?? 0;
	await saveProjectSeconds(project.id, seconds);
	return seconds;
}

export const load: PageServerLoad = async (event) => {
	const session = requireSession(event, '/dashboard');
	const ready = Boolean(hackatimeClient() && hackatimeCallback(event.url.origin));
	const notice = noticeFrom(event.url.searchParams.get('hackatime'));
	const base = {
		firstName: session.name.trim().split(/\s+/)[0] || 'there',
		guest: nextGuest,
		ready,
		notice,
		unavailable: false,
		connected: false,
		asked: event.url.searchParams.get('asked') === '1',
		submitted: event.url.searchParams.get('submitted') === '1',
		project: null as { id: string; name: string; hackatimeProject: string | null; hours: string | null } | null,
		review: null as { status: SubmissionStatus; approvedHours: string | null; feedback: string | null } | null,
		popup: null as 'name' | 'link' | null,
		recent: [] as { name: string; hours: string }[],
		questions: [] as { id: string; body: string }[],
		voteEpisode: guestVoteEpisode,
		votes: {} as { hq?: string; outside?: string },
		voted: event.url.searchParams.get('voted') === '1',
		race: [] as { name: string; hours: string; you: boolean }[],
		you: null as { rank: number; hours: string } | null,
		first: false,
		entries: hatEntries(0),
		redeemed: event.url.searchParams.get('redeemed') === '1',
		shop: {
			approvedSeconds: 0,
			availableSeconds: 0,
			unavailable: false,
			hasAddress: false,
			redemptions: [] as {
				id: string;
				title: string;
				hours: number;
				grantLabel: string;
				status: string;
				stackable: boolean;
				createdAt: string;
			}[]
		}
	};

	try {
		await upsertUser({ hackclubId: session.sub, displayName: session.name, email: '', slackId: session.slackId });
		const [projects, status] = await Promise.all([listHackcastProjects(session.sub), hackatimeStatus(session.sub)]);
		const project = projects[0] ?? null;
		base.connected = status.connected;

		// The popup: name the project first, then link a Hackatime project to it.
		// Coming back from Hackatime (any outcome) reopens step two.
		const linking = event.url.searchParams.get('step') === 'link' || notice !== null;
		base.popup = !project ? 'name' : !project.hackatimeProject && linking ? 'link' : null;

		let seconds = project?.hackatimeSeconds ?? null;
		const stale = !project?.hoursCheckedAt || Date.now() - project.hoursCheckedAt.getTime() > STALE_MS;
		if (status.connected && (base.popup === 'link' || (project?.hackatimeProject && stale))) {
			const remote = await remoteProjects(session.sub);
			if (base.popup === 'link') {
				base.recent = recentProjects(remote ?? []).map((item) => ({
					name: item.name,
					hours: formatHours(item.totalSeconds)
				}));
			}
			if (project?.hackatimeProject && stale) seconds = (await refreshSeconds(project, remote)) ?? seconds;
		}

		if (project) {
			base.project = {
				id: project.id,
				name: project.name,
				hackatimeProject: project.hackatimeProject,
				hours: project.hackatimeProject && seconds != null ? formatHours(seconds) : null
			};
		}

		const [submissions, questions, race, votes, approved] = await Promise.all([
			submissionsFor(session.sub),
			questionsFrom(session.sub, nextGuest.slug),
			hoursRace(),
			guestVotesFrom(session.sub, guestVoteEpisode),
			approvedSecondsFor(session.sub)
		]);
		base.votes = votes;
		base.entries = hatEntries(approved);
		const latest = project ? submissions.find((item) => item.projectId === project.id) : undefined;
		if (latest) {
			base.review = {
				status: latest.status,
				approvedHours: latest.approvedSeconds == null ? null : formatHours(latest.approvedSeconds),
				feedback: latest.feedback
			};
		}
		base.questions = questions.map((item) => ({ id: item.id, body: item.body }));
		const mine = race.findIndex((entry) => entry.hackclubId === session.sub);
		base.race = race.slice(0, RACE_TOP).map((entry) => ({
			name: raceName(entry.name),
			hours: formatHours(entry.seconds),
			you: entry.hackclubId === session.sub
		}));
		if (mine >= 0) base.you = { rank: mine + 1, hours: formatHours(race[mine].seconds) };
		base.first = mine === 0;
		try {
			const [spent, mineShop, address] = await Promise.all([
				spentSecondsFor(session.sub),
				redemptionsFor(session.sub),
				shippingAddressFor(session.sub)
			]);
			base.shop = {
				approvedSeconds: approved,
				availableSeconds: Math.max(0, approved - spent),
				hasAddress: Boolean(address),
				unavailable: false,
				redemptions: mineShop.map((row) => ({
					id: row.id,
					title: row.title,
					hours: row.hours,
					grantLabel: row.grantLabel,
					status: row.status,
					stackable: row.stackable,
					createdAt: row.createdAt.toISOString()
				}))
			};
		} catch {
			console.error('shop load failed');
			base.shop = { ...base.shop, approvedSeconds: approved, unavailable: true };
		}
		return base;
	} catch (err) {
		if (isRedirect(err)) throw err;
		console.error('dashboard load failed');
		return { ...base, unavailable: true, shop: { ...base.shop, unavailable: true } };
	}
};

export const actions: Actions = {
	// Popup step one: name the HackCast project.
	create: async (event) => {
		const session = requireSession(event, '/dashboard');
		const name = cleanProjectName((await event.request.formData()).get('projectName'));
		if (!name) return fail(400, { message: 'Give your HackCast project a name.' });
		try {
			await upsertUser({ hackclubId: session.sub, displayName: session.name, email: '', slackId: session.slackId });
			if ((await listHackcastProjects(session.sub)).length === 0) {
				await addHackcastProject(session.sub, name, null);
			}
		} catch {
			console.error('create HackCast project failed');
			return fail(500, { message: "Couldn't create that project. Try again." });
		}
		redirect(303, '/dashboard?step=link');
	},
	// Popup step two: link one of the Hackatime projects they worked on lately.
	link: async (event) => {
		const session = requireSession(event, '/dashboard');
		const form = await event.request.formData();
		const projectId = String(form.get('projectId') ?? '');
		const hackatimeProject = cleanProjectName(form.get('hackatimeProject'));
		if (!UUID.test(projectId) || !hackatimeProject) {
			return fail(400, { message: 'Pick the Hackatime project you are building.' });
		}
		try {
			const linked = await linkHackatimeProject(session.sub, projectId, hackatimeProject);
			if (!linked) return fail(400, { message: 'That Hackatime project is already linked.' });
			await refreshSeconds({ id: projectId, hackatimeProject }, await remoteProjects(session.sub));
		} catch {
			console.error('link Hackatime project failed');
			return fail(500, { message: "Couldn't link that Hackatime project. Try again." });
		}
		redirect(303, '/dashboard');
	},
	refresh: async (event) => {
		const session = requireSession(event, '/dashboard');
		try {
			const project = (await listHackcastProjects(session.sub))[0];
			if (project?.hackatimeProject) {
				const remote = await remoteProjects(session.sub);
				if (!remote) return fail(503, { message: "Couldn't reach Hackatime. Try again in a minute." });
				await refreshSeconds(project, remote);
			}
		} catch {
			console.error('refresh hours failed');
			return fail(500, { message: "Couldn't refresh your hours. Try again." });
		}
		redirect(303, '/dashboard');
	},
	ask: async (event) => {
		const session = requireSession(event, '/dashboard');
		const body = cleanQuestion((await event.request.formData()).get('question'));
		if (!body) return fail(400, { message: 'Write a question, up to 500 characters.' });
		try {
			await askQuestion(session.sub, nextGuest.slug, body);
		} catch {
			console.error('ask question failed');
			return fail(500, { message: "Couldn't send that question. Try again." });
		}
		redirect(303, '/dashboard?asked=1');
	},
	// One vote per category per episode. Voting again changes it.
	vote: async (event) => {
		const session = requireSession(event, '/dashboard');
		const form = await event.request.formData();
		const vote = cleanGuestRequest(form.get('category'), form.get('guestName'));
		if (!vote) return fail(400, { message: 'Type who you want on the show.' });
		try {
			await voteGuest(session.sub, guestVoteEpisode, vote.category, vote.name);
		} catch {
			console.error('guest vote failed');
			return fail(500, { message: "Couldn't save that vote. Try again." });
		}
		redirect(303, '/dashboard?voted=1');
	},
	redeem: async (event) => {
		const session = requireSession(event, '/dashboard');
		const form = await event.request.formData();
		const sku = String(form.get('sku') ?? '');
		try {
			await upsertUser({ hackclubId: session.sub, displayName: session.name, email: '', slackId: session.slackId });
			await placeRedemption(session.sub, form);
		} catch (err) {
			if (isRedirect(err)) throw err;
			const message = err instanceof ShopError ? err.message : null;
			if (message) return fail(400, { area: 'shop', sku, message });
			console.error('redeem failed');
			return fail(500, { area: 'shop', sku, message: 'Could not save that redemption. Try again.' });
		}
		redirect(303, '/dashboard?redeemed=1#shop');
	}
};
