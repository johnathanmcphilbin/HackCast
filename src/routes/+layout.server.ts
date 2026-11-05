import { staffRole } from '#lib/server/staff.ts';
import type { LayoutServerLoad } from './$types';

/** Signed-in Hack Clubbers get greeted by first name; staff get an admin link in the nav. */
export const load: LayoutServerLoad = async ({ locals }) => ({
	firstName: locals.session ? locals.session.name.trim().split(/\s+/)[0] || 'there' : null,
	staff: await staffRole(locals.session)
});
