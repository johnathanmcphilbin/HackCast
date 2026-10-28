import { fail } from '@sveltejs/kit';
import { signupsOpen, submitSignup } from '#lib/server/signup.ts';
import type { Actions, PageServerLoad } from './$types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = () => ({ signupsOpen: signupsOpen() });

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const data = await request.formData();
		const values = {
			name: String(data.get('name') ?? '').trim(),
			email: String(data.get('email') ?? '').trim(),
			slack: String(data.get('slack') ?? '').trim(),
			building: String(data.get('building') ?? '').trim()
		};

		// Honeypot: real people never see or fill this field.
		if (data.get('website')) return fail(400, { values, errors: {}, message: 'Something went wrong.' });

		const errors: Partial<Record<keyof typeof values, string>> = {};
		if (!values.name) errors.name = 'What should we call you?';
		if (values.name.length > 100) errors.name = "That's a long name! Keep it under 100 characters.";
		if (!EMAIL.test(values.email)) errors.email = 'Enter a valid email.';
		if (values.slack.length > 80) errors.slack = 'Keep this under 80 characters.';
		if (values.building.length > 1000) errors.building = 'Keep this under 1000 characters.';
		if (Object.keys(errors).length) return fail(400, { values, errors, message: null });

		const result = await submitSignup(
			{
				name: values.name,
				email: values.email,
				slack: values.slack || undefined,
				building: values.building || undefined
			},
			fetch
		);

		if (!result.ok) {
			const message =
				result.reason === 'not-configured'
					? "Signups aren't open yet. Check back soon!"
					: "We couldn't save your signup just now. Please try again in a minute.";
			return fail(result.reason === 'not-configured' ? 503 : 502, { values, errors: {}, message });
		}

		return { success: true as const, name: values.name };
	}
};
