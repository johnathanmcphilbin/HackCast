// Pure auth settings. No SvelteKit imports, so tests can call these directly.

export type AuthEnv = {
	HCA_CLIENT_ID?: string;
	HCA_CLIENT_SECRET?: string;
	HCA_REDIRECT_URI?: string;
	PUBLIC_BASE_URL?: string;
	SESSION_SECRET?: string;
	DATABASE_URL?: string;
	ADMIN_SLACK_IDS?: string;
};

export const HCA_ISSUER = 'https://auth.hackclub.com';
export const HCA_AUTHORIZE = 'https://auth.hackclub.com/oauth/authorize';
export const HCA_TOKEN = 'https://auth.hackclub.com/oauth/token';
export const HCA_JWKS = 'https://auth.hackclub.com/oauth/discovery/keys';

/**
 * Community-app scopes. `profile` is included because Hack Club Auth puts the
 * `name` claim on that scope; `name` is the REST/OIDC scope Johnny asked for.
 */
export const HCA_SCOPES = 'openid profile email name slack_id verification_status';

const NEXT_PATHS = new Set(['/', '/admin/rsvps', '/dashboard', '/submit', '/auth/hackatime']);

/** Pages and the Hackatime connect route. Callback is not listed — it has its own checks. */
const SESSION_GATES = new Set(['/dashboard', '/submit', '/auth/hackatime']);

export function sessionGate(pathname: string): string | null {
	if (!SESSION_GATES.has(pathname)) return null;
	return `/auth/login?next=${encodeURIComponent(safeNext(pathname))}`;
}

export function redirectUri(env: AuthEnv): string | undefined {
	const explicit = env.HCA_REDIRECT_URI?.trim();
	if (explicit) return explicit;
	const base = env.PUBLIC_BASE_URL?.trim().replace(/\/+$/, '');
	if (!base) return undefined;
	return `${base}/auth/callback`;
}

/** Signups leave "opening soon" only when we can both talk to HCA and store a row. */
export function authReady(env: AuthEnv): boolean {
	return Boolean(
		env.HCA_CLIENT_ID?.trim() &&
			env.HCA_CLIENT_SECRET?.trim() &&
			env.SESSION_SECRET?.trim() &&
			env.DATABASE_URL?.trim() &&
			redirectUri(env)
	);
}

export function cookieSecure(env: AuthEnv): boolean {
	return (env.PUBLIC_BASE_URL ?? env.HCA_REDIRECT_URI ?? '').startsWith('https://');
}

export function adminSlackIds(raw: string | undefined): Set<string> {
	if (!raw) return new Set();
	return new Set(
		raw
			.split(',')
			.map((id) => id.trim())
			.filter(Boolean)
	);
}

export function isAdminSlack(slackId: string | null | undefined, raw: string | undefined): boolean {
	if (!slackId) return false;
	return adminSlackIds(raw).has(slackId);
}

/** Only same-origin paths we actually have. Blocks open redirects. */
export function safeNext(value: string | null | undefined): string {
	if (value && NEXT_PATHS.has(value)) return value;
	return '/';
}

/** Where a finished sign-in lands. The home page shows the "you're on the list" popup. */
export function afterSignIn(next: string): string {
	return next === '/' ? '/?rsvp=done' : next;
}

export function visibleRsvpCount(count: number | null | undefined): number | null {
	if (count == null || !Number.isFinite(count) || count <= 0) return null;
	return count;
}

