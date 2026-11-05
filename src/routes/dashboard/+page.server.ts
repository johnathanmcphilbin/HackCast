import { hackatimeCallback, hackatimeClient } from '#lib/server/config.ts';
import { requireSession } from '#lib/server/guards.ts';
import { fetchHackatimeProfile, fetchHackatimeProjects, formatHours } from '#lib/server/hackatime.ts';
import { hackatimeAccessToken, hackatimeStatus, upsertUser } from '#lib/server/users.ts';
import type { PageServerLoad } from './$types';

const NOTICES = ['connected', 'denied', 'failed', 'taken', 'soon'] as const;
type Notice = (typeof NOTICES)[number];

function firstName(name: string): string {
	return name.trim().split(/\s+/)[0] || 'there';
}

function noticeFrom(value: string | null): Notice | null {
	return NOTICES.find((item) => item === value) ?? null;
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
		totalHours: null as string | null
	};

	try {
		await upsertUser({
			hackclubId: session.sub,
			displayName: session.name,
			email: '',
			slackId: session.slackId
		});
		const status = await hackatimeStatus(session.sub);
		if (!status.connected) return base;

		const token = await hackatimeAccessToken(session.sub);
		if (!token) {
			return { ...base, connected: true, hackatimeUserId: status.hackatimeUserId };
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
				? projects.map((project) => ({
						name: project.name,
						hours: formatHours(project.totalSeconds),
						languages: project.languages.join(', ')
					}))
				: null,
			totalHours: total == null ? null : formatHours(total)
		};
	} catch {
		console.error('dashboard load failed');
		return { ...base, unavailable: true };
	}
};
