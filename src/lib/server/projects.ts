/** A Hackatime project name safe to store as the HackCast link. */
export function cleanProjectName(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const name = value.trim();
	if (!name || name.length > 200) return null;
	if (/[\u0000-\u001f\u007f]/.test(name)) return null;
	return name;
}

/** How many Hackatime projects the link popup offers. */
export const RECENT_PROJECTS = 5;

/** The projects worked on most recently, newest first. Never-touched ones go last. */
export function recentProjects<T extends { lastHeartbeat: Date | null }>(projects: T[], count = RECENT_PROJECTS): T[] {
	const time = (project: T) => project.lastHeartbeat?.getTime() ?? -Infinity;
	return [...projects].sort((a, b) => time(b) - time(a)).slice(0, count);
}

/** "Ada Lovelace" → "Ada L." for the public hours race. */
export function raceName(name: string): string {
	const [first, ...rest] = name.trim().split(/\s+/);
	const last = rest.at(-1);
	return last ? `${first} ${last[0].toUpperCase()}.` : first || 'someone';
}
