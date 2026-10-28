// Site-wide constants: metadata, navigation and route map.

export const site = {
	name: 'Hackcast',
	tagline: 'Build stuff. Get rewarded. Run the show.',
	description:
		'Hackcast is a weekly podcast by teenagers in Hack Club. Build a project, log your hours, and spend them on shop prizes and time on the show.',
	ogImage: '/og.png',
	hackClubUrl: 'https://hackclub.com',
	hackClubFlag: 'https://assets.hackclub.com/flag-orpheus-top.svg'
} as const;

/** Every link that starts a signup points here. */
export const JOIN_HREF = '/join';

export const navLinks = [
	{ href: '/#how', label: 'how it works' },
	{ href: '/#rewards', label: 'rewards' },
	{ href: '/#show', label: 'the show' },
	{ href: '/faq', label: 'faq' }
] as const;

/**
 * Routes planned for after launch. They are not built yet; when one is added,
 * create `src/routes/<name>/+page.svelte` and (if it needs a signed-in user)
 * gate it in `src/hooks.server.ts`.
 */
export const plannedRoutes = ['/dashboard', '/shop', '/leaderboard'] as const;

/**
 * Embed URL for the latest episode (e.g. a YouTube or Spotify embed link).
 * Leave as null until the first episode is out; the player shows standby.
 */
export const latestEpisodeEmbed: string | null = null;
