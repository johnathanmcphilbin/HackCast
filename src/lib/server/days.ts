/** The last `days` UTC dates as YYYY-MM-DD, oldest first. */
export function lastDays(days: number, now = new Date()): string[] {
	const out: string[] = [];
	for (let i = days - 1; i >= 0; i--) {
		out.push(new Date(now.getTime() - i * 86_400_000).toISOString().slice(0, 10));
	}
	return out;
}

/** Middle value of a sorted copy. */
export function median(values: number[]): number | null {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
