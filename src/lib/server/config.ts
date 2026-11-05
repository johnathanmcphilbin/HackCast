import {
	ADMIN_EMAILS,
	ADMIN_SLACK_IDS,
	AIRTABLE_API_KEY,
	AIRTABLE_BASE_ID,
	AIRTABLE_TABLE,
	DATABASE_URL,
	HACKATIME_CLIENT_ID,
	HACKATIME_CLIENT_SECRET,
	HCA_CLIENT_ID,
	HCA_CLIENT_SECRET,
	HCA_REDIRECT_URI,
	PUBLIC_BASE_URL,
	PUBLIC_HACKATIME_OAUTH_UID,
	SESSION_SECRET
} from '$app/env/private';
import { authReady, cookieSecure, isAdminSlack, redirectUri, type AuthEnv } from './auth-config.ts';
import { hackatimeCredentials, hackatimeRedirectUri, type HackatimeEnv } from './hackatime.ts';

export function authEnv(): AuthEnv {
	return {
		HCA_CLIENT_ID: HCA_CLIENT_ID || undefined,
		HCA_CLIENT_SECRET: HCA_CLIENT_SECRET || undefined,
		HCA_REDIRECT_URI: HCA_REDIRECT_URI || undefined,
		PUBLIC_BASE_URL: PUBLIC_BASE_URL || undefined,
		SESSION_SECRET: SESSION_SECRET || undefined,
		DATABASE_URL: DATABASE_URL || undefined,
		ADMIN_SLACK_IDS: ADMIN_SLACK_IDS || undefined
	};
}

export function isAuthReady(): boolean {
	return authReady(authEnv());
}

export function getRedirectUri(): string | undefined {
	return redirectUri(authEnv());
}

export function sessionSecret(): string | undefined {
	return authEnv().SESSION_SECRET;
}

export function databaseUrl(): string | undefined {
	return authEnv().DATABASE_URL;
}

export function hcaClient(): { id: string; secret: string } | undefined {
	const env = authEnv();
	if (!env.HCA_CLIENT_ID || !env.HCA_CLIENT_SECRET) return undefined;
	return { id: env.HCA_CLIENT_ID, secret: env.HCA_CLIENT_SECRET };
}

export function secureCookies(): boolean {
	return cookieSecure(authEnv());
}

export function slackIsAdmin(slackId: string | null | undefined): boolean {
	return isAdminSlack(slackId, authEnv().ADMIN_SLACK_IDS);
}

export function hackatimeEnv(): HackatimeEnv {
	return {
		HACKATIME_CLIENT_ID: HACKATIME_CLIENT_ID || undefined,
		HACKATIME_CLIENT_SECRET: HACKATIME_CLIENT_SECRET || undefined,
		PUBLIC_HACKATIME_OAUTH_UID: PUBLIC_HACKATIME_OAUTH_UID || undefined,
		PUBLIC_BASE_URL: PUBLIC_BASE_URL || undefined
	};
}

export function hackatimeClient(): { id: string; secret: string } | undefined {
	return hackatimeCredentials(hackatimeEnv());
}

export function hackatimeCallback(origin: string): string | undefined {
	return hackatimeRedirectUri(hackatimeEnv(), origin);
}

export function adminEmails(): string | undefined {
	return ADMIN_EMAILS || undefined;
}

/** Where approved submissions go. Unset means approvals wait in the queue with a "send" button. */
export function airtableTarget(): { apiKey: string; baseId: string; table: string } | undefined {
	if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE) return undefined;
	return { apiKey: AIRTABLE_API_KEY, baseId: AIRTABLE_BASE_ID, table: AIRTABLE_TABLE };
}
