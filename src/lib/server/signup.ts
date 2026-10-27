// The only place signups leave the app. Swap this out when a real auth/backend is chosen.
//
// TODO(integration): Hackcast has no signup backend yet. Set SIGNUP_WEBHOOK_URL (see .env.example)
// to an endpoint that stores signups. Until then, signupsOpen() is false and the /join form is disabled.
import { SIGNUP_WEBHOOK_URL, SIGNUP_WEBHOOK_SECRET } from '$app/env/private';

export type Signup = {
	name: string;
	email: string;
	slack?: string;
	building?: string;
};

export type SignupResult = { ok: true } | { ok: false; reason: 'not-configured' | 'upstream-error' };

export function signupsOpen(): boolean {
	return Boolean(SIGNUP_WEBHOOK_URL);
}

export async function submitSignup(signup: Signup, fetchFn: typeof fetch = fetch): Promise<SignupResult> {
	if (!SIGNUP_WEBHOOK_URL) return { ok: false, reason: 'not-configured' };

	try {
		const res = await fetchFn(SIGNUP_WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				...(SIGNUP_WEBHOOK_SECRET && { authorization: `Bearer ${SIGNUP_WEBHOOK_SECRET}` })
			},
			body: JSON.stringify({ ...signup, source: 'hackcast-landing', submittedAt: new Date().toISOString() })
		});
		if (!res.ok) {
			console.error(`Signup webhook responded ${res.status}`);
			return { ok: false, reason: 'upstream-error' };
		}
		return { ok: true };
	} catch (err) {
		console.error('Signup webhook request failed', err);
		return { ok: false, reason: 'upstream-error' };
	}
}
