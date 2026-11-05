import { fail } from '@sveltejs/kit';
import { nextGuest } from '#lib/content.ts';
import { formatHours } from '#lib/server/hackatime.ts';
import { hatEntries, pickWeighted, raceName } from '#lib/server/projects.ts';
import { clearPicks, markPicked, questionPool, type PoolQuestion } from '#lib/server/questions.ts';
import { requireStaff } from '#lib/server/staff.ts';
import { UUID } from '#lib/server/submission-form.ts';
import { hoursRace } from '#lib/server/users.ts';
import type { Actions, PageServerLoad } from './$types';

type Person = { askerId: string; name: string; approvedSeconds: number; questions: PoolQuestion[] };

/** Questions grouped by who asked, plus who leads the hours race (their question is guaranteed). */
async function hat() {
	const [pool, race] = await Promise.all([questionPool(nextGuest.slug), hoursRace()]);
	const leader = race[0]?.hackclubId ?? null;
	const people = new Map<string, Person>();
	for (const question of pool) {
		const person = people.get(question.askerId) ?? {
			askerId: question.askerId,
			name: question.asker,
			approvedSeconds: question.approvedSeconds,
			questions: []
		};
		person.questions.push(question);
		people.set(question.askerId, person);
	}
	// In the draw: everyone but the leader who hasn't had a question picked yet.
	const drawable = [...people.values()].filter(
		(person) => person.askerId !== leader && !person.questions.some((q) => q.pickedHow)
	);
	return { people: [...people.values()], leader, race, drawable };
}

export const load: PageServerLoad = async (event) => {
	await requireStaff(event, 'admin', '/admin/questions');
	try {
		const { people, leader, race, drawable } = await hat();
		const totalEntries = drawable.reduce((sum, person) => sum + hatEntries(person.approvedSeconds), 0);
		const inDraw = new Set(drawable.map((person) => person.askerId));
		return {
			guest: nextGuest.name,
			episode: nextGuest.episode,
			unavailable: false,
			leader: leader ? { name: raceName(race[0].name), hours: formatHours(race[0].seconds) } : null,
			people: people
				.map((person) => {
					const entries = hatEntries(person.approvedSeconds);
					return {
						askerId: person.askerId,
						name: raceName(person.name),
						approved: formatHours(person.approvedSeconds),
						guaranteed: person.askerId === leader,
						entries,
						chance: inDraw.has(person.askerId) && totalEntries ? Math.round((entries / totalEntries) * 100) : null,
						questions: person.questions.map((q) => ({ id: q.id, body: q.body, pickedHow: q.pickedHow }))
					};
				})
				.sort((a, b) => Number(b.guaranteed) - Number(a.guaranteed) || b.entries - a.entries || a.name.localeCompare(b.name))
		};
	} catch {
		console.error('question pool failed');
		return { guest: nextGuest.name, episode: nextGuest.episode, unavailable: true, leader: null, people: [] };
	}
};

export const actions: Actions = {
	// The race leader's question: an admin picks which of theirs goes on the show.
	guarantee: async (event) => {
		await requireStaff(event, 'admin', '/admin/questions');
		const id = String((await event.request.formData()).get('questionId') ?? '');
		if (!UUID.test(id)) return fail(400, { message: 'Pick one of their questions.' });
		const { leader, people } = await hat();
		const mine = people.find((person) => person.askerId === leader)?.questions.some((q) => q.id === id);
		if (!mine) return fail(400, { message: 'Only the hours race leader gets a guaranteed question.' });
		await markPicked(id, 'guaranteed');
		return { message: 'Guaranteed question set.' };
	},
	// One draw from the hat: a person by their entries, then one of their questions at random.
	draw: async (event) => {
		await requireStaff(event, 'admin', '/admin/questions');
		const { drawable } = await hat();
		const person = pickWeighted(
			drawable.map((item) => ({ item, weight: hatEntries(item.approvedSeconds) })),
			Math.random()
		);
		if (!person) return fail(400, { message: 'Nobody left in the hat.' });
		const question = person.questions[Math.floor(Math.random() * person.questions.length)];
		await markPicked(question.id, 'drawn');
		return { message: `Drawn: ${raceName(person.name)} — "${question.body}"` };
	},
	reset: async (event) => {
		await requireStaff(event, 'admin', '/admin/questions');
		await clearPicks(nextGuest.slug);
		return { message: 'Picks cleared. Everyone is back in the hat.' };
	}
};
