import { nextGuest } from '#lib/content.ts';
import { formatHours } from '#lib/server/hackatime.ts';
import { raceName } from '#lib/server/projects.ts';
import { questionPool } from '#lib/server/questions.ts';
import { requireStaff } from '#lib/server/staff.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await requireStaff(event, 'reviewer', '/admin/questions');
	try {
		const pool = await questionPool(nextGuest.slug);
		return {
			guest: nextGuest.name,
			unavailable: false,
			questions: pool.map((item) => ({
				body: item.body,
				asker: raceName(item.asker),
				hours: formatHours(item.askerSeconds),
				askedAt: item.createdAt.toISOString()
			}))
		};
	} catch {
		console.error('question pool failed');
		return { guest: nextGuest.name, unavailable: true, questions: [] };
	}
};
