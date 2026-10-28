import {
	ADMIN_SLACK_IDS,
	DATABASE_URL,
	HCA_CLIENT_ID,
	HCA_CLIENT_SECRET,
	HCA_REDIRECT_URI,
	PUBLIC_BASE_URL,
	SESSION_SECRET
} from '$app/env/private';
import { authReady, cookieSecure, isAdminSlack, redirectUri, type AuthEnv } from './auth-config.ts';

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
