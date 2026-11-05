import { redirect } from '@sveltejs/kit';
import { safeNext } from '#lib/server/auth-config.ts';
import { hackatimeCallback, hackatimeClient, secureCookies, sessionSecret } from '#lib/server/config.ts';
import { requireSession } from '#lib/server/guards.ts';
import { authorizeUrl, createHackatimeState } from '#lib/server/hackatime.ts';
import { HT_COOKIE, signHt } from '#lib/server/session.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url, cookies, locals }) => {
	requireSession({ locals }, '/auth/hackatime');

	const secret = sessionSecret();
	const client = hackatimeClient();
	const redirectUri = hackatimeCallback(url.origin);
	if (!secret || !client || !redirectUri) redirect(303, '/dashboard?hackatime=soon');

	const requested = url.searchParams.get('next');
	const next = requested ? safeNext(requested) : '/dashboard';
	const state = createHackatimeState();
	cookies.set(HT_COOKIE, signHt({ state, next }, secret), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: secureCookies(),
		maxAge: 600
	});

	// Kit's redirect() refuses external URLs. cookies.set() is still applied.
	return new Response(null, {
		status: 302,
		headers: { Location: authorizeUrl({ clientId: client.id, redirectUri, state }) }
	});
};
