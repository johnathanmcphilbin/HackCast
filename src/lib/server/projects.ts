/** A Hackatime project name safe to store as the HackCast link. */
export function cleanProjectName(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const name = value.trim();
	if (!name || name.length > 200) return null;
	if (/[\u0000-\u001f\u007f]/.test(name)) return null;
	return name;
}
