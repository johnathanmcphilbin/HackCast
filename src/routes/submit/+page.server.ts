import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { requireSession } from '#lib/server/guards.ts';
import { fetchHackatimeProjects, formatHours } from '#lib/server/hackatime.ts';
import { parseSubmission, UUID } from '#lib/server/submission-form.ts';
import { latestForProject, submissionsFor, submitProject, SubmitError } from '#lib/server/submissions.ts';
import { hackatimeAccessToken, listHackcastProjects } from '#lib/server/users.ts';
import type { Actions, PageServerLoad } from './$types';

/** Hackatime seconds per Hackatime project name, or null when Hackatime can't be reached. */
async function hackatimeSeconds(hackclubId: string): Promise<Map<string, number> | null> {
	const token = await hackatimeAccessToken(hackclubId);
	const projects = token ? await fetchHackatimeProjects(token) : null;
	return projects ? new Map(projects.map((project) => [project.name, project.totalSeconds])) : null;
}

export const load: PageServerLoad = async (event) => {
	const session = requireSession(event, '/submit');
	try {
		const [projects, submissions, seconds] = await Promise.all([
			listHackcastProjects(session.sub),
			submissionsFor(session.sub),
			hackatimeSeconds(session.sub)
		]);
		const status = new Map(submissions.map((item) => [item.projectId, item.status]));
		const asked = event.url.searchParams.get('project');
		const previous = asked && UUID.test(asked) ? await latestForProject(session.sub, asked) : null;
		return {
			unavailable: false,
			projects: projects.map((project) => ({
				id: project.id,
				name: project.name,
				hackatimeProject: project.hackatimeProject,
				hours:
					project.hackatimeProject && seconds?.has(project.hackatimeProject)
						? formatHours(seconds.get(project.hackatimeProject)!)
						: null,
				status: status.get(project.id) ?? null
			})),
			// Resubmitting after "needs changes" starts from what they sent last time.
			previous:
				previous?.status === 'changes_requested'
					? {
							projectId: previous.projectId ?? '',
							kind: previous.kind,
							description: previous.description,
							codeUrl: previous.codeUrl,
							demoUrl: previous.demoUrl,
							screenshotUrl: previous.screenshotUrl,
							githubUsername: previous.githubUsername ?? '',
							firstName: previous.firstName,
							lastName: previous.lastName,
							birthday: previous.birthday ?? '',
							addressLine1: previous.addressLine1 ?? '',
							addressLine2: previous.addressLine2 ?? '',
							city: previous.city ?? '',
							state: previous.state ?? '',
							postalCode: previous.postalCode ?? '',
							country: previous.country,
							claimedHours: previous.kind === 'hardware' ? String(previous.trackedSeconds / 3600) : '',
							feedback: previous.feedback ?? ''
						}
					: null
		};
	} catch {
		console.error('submit load failed');
		return { unavailable: true, projects: [], previous: null };
	}
};

export const actions: Actions = {
	default: async (event) => {
		const session = requireSession(event, '/submit');
		const parsed = parseSubmission(await event.request.formData());
		if (!parsed.ok) return fail(400, { errors: parsed.errors, values: parsed.values, message: null });
		const input = parsed.value;
		try {
			let tracked = (input.claimedHours ?? 0) * 3600;
			if (input.kind === 'software') {
				const project = (await listHackcastProjects(session.sub)).find((item) => item.id === input.projectId);
				const seconds = await hackatimeSeconds(session.sub);
				if (!seconds) {
					return fail(503, {
						errors: {},
						values: parsed.values,
						message: "Couldn't reach Hackatime to read your hours. Try again in a minute."
					});
				}
				tracked = (project?.hackatimeProject && seconds.get(project.hackatimeProject)) || 0;
			}
			await submitProject(session.sub, input, tracked);
		} catch (err) {
			if (isRedirect(err)) throw err;
			if (err instanceof SubmitError) return fail(400, { errors: {}, values: parsed.values, message: err.message });
			console.error('submit failed');
			return fail(500, { errors: {}, values: parsed.values, message: "Couldn't send that in. Try again." });
		}
		redirect(303, '/dashboard?submitted=1');
	}
};
