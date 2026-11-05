/** A Hackatime project name safe to store as the HackCast link. */
export function cleanProjectName(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const name = value.trim();
	if (!name || name.length > 200) return null;
	if (/[\u0000-\u001f\u007f]/.test(name)) return null;
	return name;
}

/** How many Hackatime projects onboarding offers to pick from. */
export const TOP_PROJECTS = 5;

/** The projects with the most hours, most first. */
export function topProjects<T extends { totalSeconds: number }>(projects: T[], count = TOP_PROJECTS): T[] {
	return [...projects].sort((a, b) => b.totalSeconds - a.totalSeconds).slice(0, count);
}
