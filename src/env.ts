import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	HCA_CLIENT_ID: {
		schema: optional,
		description: 'Hack Club Auth OAuth client id. Signups stay on "opening soon" until this, the secret, SESSION_SECRET, DATABASE_URL, and a redirect base are set.'
	},
	HCA_CLIENT_SECRET: {
		schema: optional,
		description: 'Hack Club Auth OAuth client secret. Never commit it.'
	},
	HCA_REDIRECT_URI: {
		schema: optional,
		description: 'Exact redirect URI registered on the HCA app. Defaults to ${PUBLIC_BASE_URL}/auth/callback.'
	},
	HACKATIME_CLIENT_ID: {
		schema: optional,
		description: 'Hackatime OAuth client id for the confidential server app. PUBLIC_HACKATIME_OAUTH_UID is used when this is empty.'
	},
	PUBLIC_HACKATIME_OAUTH_UID: {
		schema: optional,
		description: 'Alternate name for the Hackatime OAuth client id (the app UID). Server-only here. HACKATIME_CLIENT_ID wins when both are set.'
	},
	HACKATIME_CLIENT_SECRET: {
		schema: optional,
		description: 'Hackatime OAuth client secret. Never commit it. Scopes used: profile and read.'
	},
	PUBLIC_BASE_URL: {
		schema: optional,
		description: 'Public origin of this site, no trailing path, e.g. https://hackcast.hackclub.com. Used when HCA_REDIRECT_URI is unset.'
	},
	SESSION_SECRET: {
		schema: optional,
		description: 'HMAC secret for the signed httpOnly session cookie. Use a long random string.'
	},
	DATABASE_URL: {
		schema: optional,
		description: 'Postgres connection string (Orchard Postgres 17). RSVPs are stored here.'
	},
	ADMIN_SLACK_IDS: {
		schema: optional,
		description: 'Comma-separated Hack Club Slack member IDs allowed to open /admin/rsvps.'
	}
});
