import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	SIGNUP_WEBHOOK_URL: {
		schema: optional,
		description:
			'Where /join POSTs new signups as JSON (e.g. an Airtable automation, Zapier hook or your own API). Signups stay closed until this is set.'
	},
	SIGNUP_WEBHOOK_SECRET: {
		schema: optional,
		description: 'Optional. Sent as `Authorization: Bearer <secret>` with each signup request.'
	}
});
