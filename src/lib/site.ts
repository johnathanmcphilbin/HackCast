// Site-wide constants: metadata, navigation and route map.

export const site = {
	name: 'Hackcast',
	tagline: 'Build stuff, log hours, get on a teen podcast.',
	description:
		'Hackcast is a podcast made by teens in Hack Club. Build a project, log your hours, and spend them on shop prizes and time on the show.',
	// Bump ?v= when the image changes so Slack, Discord and iMessage refetch it.
	ogImage: '/og.png?v=3',
	hackClubUrl: 'https://hackclub.com',
	hackClubSignupUrl: 'https://auth.hackclub.com/signup',
	youtubeUrl: 'https://www.youtube.com/@HackClubHQ',
	hackClubFlag: 'https://assets.hackclub.com/flag-orpheus-top.svg'
} as const;

/** Start Now begins Hack Club Auth, then Hackatime and a HackCast project. */
export const START_HREF = '/auth/login?next=/dashboard';

export const navLinks = [
	{ href: '/#how', label: 'how it works' },
	{ href: '/#show', label: 'the show' },
	{ href: '/faq', label: 'faq' }
] as const;

/**
 * Still to build. `/dashboard` and `/submit` are live and gated in
 * `src/hooks.server.ts`.
 */
export const plannedRoutes = ['/shop', '/leaderboard'] as const;

/**
 * Embed URL for the latest episode (e.g. a YouTube or Spotify embed link).
 * Leave as null until the first episode is out; the player shows standby.
 */
export const latestEpisodeEmbed: string | null = null;
