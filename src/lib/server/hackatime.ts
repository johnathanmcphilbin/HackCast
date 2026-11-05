import { randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Hackatime OAuth and read API. Evidence of tracked time, not an awarder of hours.
 * No database and no SvelteKit env imports — callers pass credentials in.
 * Tokens stay on the server. Never request the admin scope.
 */

export const HACKATIME_AUTHORIZE = 'https://hackatime.hackclub.com/oauth/authorize';
export const HACKATIME_TOKEN = 'https://hackatime.hackclub.com/oauth/token';
export const HACKATIME_API = 'https://hackatime.hackclub.com/api/v1';

/**
 * Hackatime's callback. Not Hack Club Auth's `/auth/callback`.
 * Register this exact path on the Hackatime OAuth app:
 * `https://hackcast.hackclub.com/auth/hackatime/callback`
 */
export const HACKATIME_CALLBACK_PATH = '/auth/hackatime/callback';

/** Space-separated. `profile` is the person; `read` is their project hours. */
export const HACKATIME_SCOPES = 'profile read';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export type HackatimeEnv = {
	HACKATIME_CLIENT_ID?: string;
	HACKATIME_CLIENT_SECRET?: string;
	PUBLIC_HACKATIME_OAUTH_UID?: string;
	PUBLIC_BASE_URL?: string;
};

export type HackatimeTokens = {
	accessToken: string;
	refreshToken: string | null;
	expiresIn: number | null;
	scope: string | null;
};

export type HackatimeProfile = {
	id: string;
	email: string | null;
	githubUsername: string | null;
	slackId: string | null;
};

export type HackatimeProject = {
	name: string;
	totalSeconds: number;
	languages: string[];
};

export function hackatimeClientId(env: HackatimeEnv): string | undefined {
	const id = env.HACKATIME_CLIENT_ID?.trim() || env.PUBLIC_HACKATIME_OAUTH_UID?.trim();
	return id || undefined;
}

export function hackatimeCredentials(env: HackatimeEnv): { id: string; secret: string } | undefined {
	const id = hackatimeClientId(env);
	const secret = env.HACKATIME_CLIENT_SECRET?.trim();
	if (!id || !secret) return undefined;
	return { id, secret };
}

function localCallback(requestOrigin: string | undefined): string | undefined {
	if (!requestOrigin) return undefined;
	let url: URL;
	try {
		url = new URL(requestOrigin);
	} catch {
		return undefined;
	}
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
	if (!LOCAL_HOSTS.has(url.hostname)) return undefined;
	return `${url.origin}${HACKATIME_CALLBACK_PATH}`;
}

/** Origin only. A PUBLIC_BASE_URL pasted as the HCA callback still yields the site origin. */
function publicOrigin(base: string): string | undefined {
	try {
		const url = new URL(base);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
		return url.origin;
	} catch {
		const stripped = base.replace(/\/+$/, '').replace(/\/auth\/callback$/, '');
		return stripped || undefined;
	}
}

/**
 * Production is pinned to PUBLIC_BASE_URL. The Node server's request origin
 * defaults to https and can be an internal host, so it must not override that.
 * With PUBLIC_BASE_URL unset, a localhost origin is used — that is Vite dev
 * (`http://localhost:5173/auth/hackatime/callback`).
 *
 * The path is always `/auth/hackatime/callback`. Never `/auth/callback`
 * (that path belongs to Hack Club Auth).
 */
export function hackatimeRedirectUri(env: HackatimeEnv, requestOrigin?: string): string | undefined {
	const base = env.PUBLIC_BASE_URL?.trim();
	if (base) {
		const origin = publicOrigin(base);
		if (!origin) return undefined;
		const uri = `${origin}${HACKATIME_CALLBACK_PATH}`;
		try {
			if (new URL(uri).pathname !== HACKATIME_CALLBACK_PATH) return undefined;
		} catch {
			return undefined;
		}
		return uri;
	}
	return localCallback(requestOrigin);
}

export function createHackatimeState(): string {
	return randomBytes(24).toString('base64url');
}

export function statesMatch(a: string, b: string): boolean {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
}

export function authorizeUrl(input: { clientId: string; redirectUri: string; state: string }): string {
	const url = new URL(HACKATIME_AUTHORIZE);
	url.searchParams.set('client_id', input.clientId);
	url.searchParams.set('redirect_uri', input.redirectUri);
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('scope', HACKATIME_SCOPES);
	url.searchParams.set('state', input.state);
	return url.toString();
}

export async function exchangeCode(input: {
	code: string;
	redirectUri: string;
	clientId: string;
	clientSecret: string;
	fetchImpl?: typeof fetch;
}): Promise<HackatimeTokens> {
	const fetchImpl = input.fetchImpl ?? fetch;
	const body = new URLSearchParams({
		grant_type: 'authorization_code',
		code: input.code,
		redirect_uri: input.redirectUri,
		client_id: input.clientId,
		client_secret: input.clientSecret
	});
	const response = await fetchImpl(HACKATIME_TOKEN, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
		body
	});
	if (!response.ok) throw new Error('token');
	const json = (await response.json()) as {
		access_token?: unknown;
		refresh_token?: unknown;
		expires_in?: unknown;
		scope?: unknown;
	};
	if (typeof json.access_token !== 'string' || !json.access_token) throw new Error('token');
	return {
		accessToken: json.access_token,
		refreshToken: typeof json.refresh_token === 'string' && json.refresh_token ? json.refresh_token : null,
		expiresIn: typeof json.expires_in === 'number' && Number.isFinite(json.expires_in) ? json.expires_in : null,
		scope: typeof json.scope === 'string' && json.scope ? json.scope : null
	};
}

export function profileFromPayload(json: unknown): HackatimeProfile | null {
	if (!json || typeof json !== 'object') return null;
	const me = json as { id?: unknown; emails?: unknown; github_username?: unknown; slack_id?: unknown };
	if (me.id == null || me.id === '') return null;
	const emails = Array.isArray(me.emails) ? me.emails.filter((item): item is string => typeof item === 'string' && !!item.trim()) : [];
	return {
		id: String(me.id),
		email: emails[0] ?? null,
		githubUsername: typeof me.github_username === 'string' && me.github_username.trim() ? me.github_username.trim() : null,
		slackId: typeof me.slack_id === 'string' && me.slack_id.trim() ? me.slack_id.trim() : null
	};
}

export function projectsFromPayload(json: unknown): HackatimeProject[] | null {
	if (!json || typeof json !== 'object') return null;
	const list = (json as { projects?: unknown }).projects;
	if (!Array.isArray(list)) return null;
	return list
		.map((item) => {
			if (!item || typeof item !== 'object') return null;
			const project = item as { name?: unknown; total_seconds?: unknown; languages?: unknown };
			if (typeof project.name !== 'string' || !project.name.trim()) return null;
			const seconds = Number(project.total_seconds ?? 0);
			const languages = Array.isArray(project.languages)
				? project.languages.filter((lang): lang is string => typeof lang === 'string' && !!lang.trim())
				: [];
			return {
				name: project.name.trim(),
				totalSeconds: Number.isFinite(seconds) ? seconds : 0,
				languages
			};
		})
		.filter((project): project is HackatimeProject => project !== null)
		.sort((a, b) => b.totalSeconds - a.totalSeconds);
}

export function formatHours(totalSeconds: number): string {
	const safe = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
	const h = Math.floor(safe / 3600);
	const m = Math.round((safe % 3600) / 60);
	return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

async function authedJson(path: string, accessToken: string, fetchImpl: typeof fetch): Promise<unknown | null> {
	const response = await fetchImpl(`${HACKATIME_API}${path}`, {
		headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' },
		signal: AbortSignal.timeout(8000)
	});
	if (!response.ok) return null;
	return response.json();
}

export async function fetchHackatimeProfile(
	accessToken: string,
	fetchImpl: typeof fetch = fetch
): Promise<HackatimeProfile | null> {
	try {
		const json = await authedJson('/authenticated/me', accessToken, fetchImpl);
		if (!json) return null;
		return profileFromPayload(json);
	} catch {
		return null;
	}
}

export async function fetchHackatimeProjects(
	accessToken: string,
	fetchImpl: typeof fetch = fetch
): Promise<HackatimeProject[] | null> {
	try {
		const json = await authedJson('/authenticated/projects', accessToken, fetchImpl);
		if (!json) return null;
		return projectsFromPayload(json);
	} catch {
		return null;
	}
}
