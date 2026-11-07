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

/** Who builders want on the show: someone at Hack Club HQ, or a guest from outside. */
export type GuestCategory = 'hq' | 'outside';

export function cleanGuestRequest(
	category: unknown,
	name: unknown
): { category: GuestCategory; name: string } | null {
	if (category !== 'hq' && category !== 'outside') return null;
	if (typeof name !== 'string') return null;
	const clean = name.replace(/\s+/g, ' ').trim();
	return clean && clean.length <= 120 ? { category, name: clean } : null;
}

/** "  Zach  Latta. " and "zach latta" are the same vote: lower case, no accents or punctuation. */
export function guestKey(name: string): string {
	return name
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9 ]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Edit distance, capped: returns cap + 1 once it's clearly further than cap. */
function distance(a: string, b: string, cap: number): number {
	if (Math.abs(a.length - b.length) > cap) return cap + 1;
	let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		const row = [i];
		for (let j = 1; j <= b.length; j++) {
			row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
		}
		if (Math.min(...row) > cap) return cap + 1;
		prev = row;
	}
	return prev[b.length];
}

/** Names close enough to be the same person typed with a slip: one typo, or two in longer names. */
export function sameGuest(a: string, b: string): boolean {
	if (a === b) return true;
	const shorter = Math.min(a.length, b.length);
	if (shorter < 5) return false;
	return distance(a, b, shorter >= 10 ? 2 : 1) <= (shorter >= 10 ? 2 : 1);
}

export type GuestVote = { id: string; category: GuestCategory; name: string; voter: string; status: string; at: Date };

export type GuestGroup = {
	category: GuestCategory;
	/** The spelling most people used. */
	name: string;
	/** Every other spelling counted with it. */
	spellings: string[];
	votes: number;
	voters: string[];
	ids: string[];
	status: string;
	lastAt: Date;
};

/** Count requests per guest within each category, matching spellings of the same name, most votes first. */
export function groupGuestVotes(votes: GuestVote[]): GuestGroup[] {
	const groups: { category: GuestCategory; keys: string[]; votes: GuestVote[] }[] = [];
	for (const vote of votes) {
		const key = guestKey(vote.name);
		if (!key) continue;
		const group = groups.find((g) => g.category === vote.category && g.keys.some((k) => sameGuest(k, key)));
		if (group) {
			group.votes.push(vote);
			if (!group.keys.includes(key)) group.keys.push(key);
		} else {
			groups.push({ category: vote.category, keys: [key], votes: [vote] });
		}
	}
	return groups
		.map((group) => {
			// One spelling per distinct key: the most typed, then the one with capitals ("Zach Latta" over "zach latta").
			const capitals = (name: string) => (name.match(/[A-Z]/g) ?? []).length;
			const byKey = new Map<string, Map<string, number>>();
			for (const vote of group.votes) {
				const forms = byKey.get(guestKey(vote.name)) ?? new Map<string, number>();
				forms.set(vote.name, (forms.get(vote.name) ?? 0) + 1);
				byKey.set(guestKey(vote.name), forms);
			}
			const spellings = [...byKey.values()]
				.map((forms) => {
					const total = [...forms.values()].reduce((sum, n) => sum + n, 0);
					const best = [...forms.entries()].sort((a, b) => b[1] - a[1] || capitals(b[0]) - capitals(a[0]))[0][0];
					return { best, total };
				})
				.sort((a, b) => b.total - a.total || capitals(b.best) - capitals(a.best) || a.best.localeCompare(b.best))
				.map((item) => item.best);
			// A name keeps a reviewed status unless someone new asked for it since.
			const reviewed = group.votes.find((vote) => vote.status !== 'new');
			return {
				category: group.category,
				name: spellings[0],
				spellings: spellings.slice(1),
				votes: new Set(group.votes.map((vote) => vote.voter)).size,
				voters: [...new Set(group.votes.map((vote) => vote.voter))],
				ids: group.votes.map((vote) => vote.id),
				status: reviewed && group.votes.every((vote) => vote.status !== 'new') ? reviewed.status : 'new',
				lastAt: new Date(Math.max(...group.votes.map((vote) => vote.at.getTime())))
			};
		})
		.sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));
}

/** Everyone who asks gets this many entries in the question hat for free. */
export const FREE_ENTRIES = 5;
/** Questions asked in each hour-long episode. Every one comes from the community. */
export const QUESTIONS_PER_EPISODE = 50;

/** Entries in the question hat: five free, plus one per whole approved hour. */
export function hatEntries(approvedSeconds: number): number {
	return FREE_ENTRIES + Math.max(0, Math.floor(approvedSeconds / 3600));
}

/** Pick one item, each as likely as its weight. `roll` is in [0, 1). */
export function pickWeighted<T>(items: { item: T; weight: number }[], roll: number): T | null {
	const total = items.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
	if (total <= 0) return null;
	let target = roll * total;
	for (const entry of items) {
		target -= Math.max(0, entry.weight);
		if (target < 0) return entry.item;
	}
	return items.at(-1)?.item ?? null;
}
