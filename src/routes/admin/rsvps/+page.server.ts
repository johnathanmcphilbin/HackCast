import { fail } from '@sveltejs/kit';
import { assertAdmin } from '#lib/server/admin.ts';
import { drawQuestion, getQuestionPick, listRsvps } from '#lib/server/rsvps.ts';
import type { Actions, PageServerLoad } from './$types';

function stamp(date: Date): string {
	return date.toISOString().replace('T', ' ').slice(0, 19) + ' utc';
}

export const load: PageServerLoad = async (event) => {
	assertAdmin(event);
	try {
		const [rows, pick] = await Promise.all([listRsvps(), getQuestionPick()]);
		return {
			unavailable: false as const,
			rows: rows.map((row) => ({
				name: row.name,
				email: row.email,
				slackId: row.slackId,
				verificationStatus: row.verificationStatus,
				yswsEligible: row.yswsEligible,
				question: row.question,
				createdAt: stamp(row.createdAt)
			})),
			pick: pick
				? {
						name: pick.name,
						email: pick.email,
						question: pick.question,
						pickedAt: stamp(pick.pickedAt)
					}
				: null
		};
	} catch {
		console.error('admin rsvp list failed');
		return { rows: [], pick: null, unavailable: true as const };
	}
};

export const actions: Actions = {
	pick: async (event) => {
		assertAdmin(event);
		try {
			const pick = await drawQuestion();
			if (!pick) return fail(400, { pickError: 'no questions in the hat yet.' });
			return { picked: true };
		} catch {
			console.error('question draw failed');
			return fail(503, { pickError: 'could not draw just now. try again.' });
		}
	}
};
