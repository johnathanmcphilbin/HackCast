import { fail, redirect } from '@sveltejs/kit';
import { visibleRsvpCount } from '#lib/server/auth-config.ts';
import { isAuthReady } from '#lib/server/config.ts';
import { getRsvp, rsvpCount, setRsvpQuestion } from '#lib/server/rsvps.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!isAuthReady()) {
		return { mode: 'closed' as const, name: '', question: null, count: null, note: 'The form opens soon.' };
	}
	const count = visibleRsvpCount(await rsvpCount());
	if (!locals.session) {
		if (url.searchParams.get('error') === 'auth') {
			return { mode: 'auth-error' as const, name: '', question: null, count, note: "That sign-in didn't land." };
		}
		redirect(303, '/auth/login');
	}
	const row = await getRsvp(locals.session.sub);
	if (!row) redirect(303, '/auth/login');
	const eligible = row.yswsEligible === true;
	return {
		mode: eligible ? ('in' as const) : ('held' as const),
		name: row.name || locals.session.name,
		question: row.question,
		count,
		note: eligible
			? "You're on the list. Go build."
			: row.yswsEligible === false
				? 'Not YSWS-eligible yet. We kept you on file.'
				: "Eligibility isn't confirmed yet. We kept you on file."
	};
};

export const actions: Actions = {
	question: async ({ request, locals }) => {
		if (!isAuthReady() || !locals.session) redirect(303, '/auth/login');
		const data = await request.formData();
		const question = String(data.get('question') ?? '').trim().slice(0, 200);
		try {
			await setRsvpQuestion(locals.session.sub, question || null);
		} catch {
			console.error('rsvp question failed');
			return fail(503, { questionError: 'Could not save that. Try again.' });
		}
		return { questionSaved: true };
	}
};
