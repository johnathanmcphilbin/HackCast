import { visibleRsvpCount } from '#lib/server/auth-config.ts';
import { rsvpCount } from '#lib/server/rsvps.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	count: visibleRsvpCount(await rsvpCount())
});
