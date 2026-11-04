import type { LayoutServerLoad } from './$types';

/** Signed-in Hack Clubbers get greeted by first name in the nav and on the home page. */
export const load: LayoutServerLoad = ({ locals }) => ({
	firstName: locals.session ? locals.session.name.trim().split(/\s+/)[0] || 'there' : null
});
