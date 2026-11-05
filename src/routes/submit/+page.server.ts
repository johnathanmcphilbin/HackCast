import { requireSession } from '#lib/server/guards.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	requireSession(event, '/submit');
	return {};
};
