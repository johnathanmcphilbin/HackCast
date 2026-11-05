import { isRedirect, redirect } from '@sveltejs/kit';
import { safeNext } from '#lib/server/auth-config.ts';
import { hackatimeCallback, hackatimeClient, sessionSecret } from '#lib/server/config.ts';
import { exchangeCode, fetchHackatimeProfile, HACKATIME_SCOPES, statesMatch } from '#lib/server/hackatime.ts';
import { HT_COOKIE, readHt } from '#lib/server/session.ts';
import { hackatimeLinkedElsewhere, isUniqueViolation, saveHackatimeConnection, upsertUser } from '#lib/server/users.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
	// The connection belongs to the signed-in Hack Club user, never a query param.
	if (!locals.session) redirect(303, '/auth/login?next=/dashboard');
	const session = locals.session;

	const secret = sessionSecret();
	const txn = secret ? readHt(cookies.get(HT_COOKIE), secret) : null;
	cookies.delete(HT_COOKIE, { path: '/' });

	const back = txn ? safeNext(txn.next) : '/dashboard';
	const dest = back === '/' || back === '/onboarding' ? '/dashboard' : back;

	if (url.searchParams.get('error')) redirect(303, `${dest}?hackatime=denied`);

	const client = hackatimeClient();
	const redirectUri = hackatimeCallback(url.origin);
	if (!client || !redirectUri) redirect(303, `${dest}?hackatime=soon`);

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	if (!secret || !txn || !code || !state || !statesMatch(state, txn.state)) {
		redirect(303, `${dest}?hackatime=failed`);
	}

	try {
		await upsertUser({
			hackclubId: session.sub,
			displayName: session.name,
			email: '',
			slackId: session.slackId
		});
		const tokens = await exchangeCode({
			code,
			redirectUri,
			clientId: client.id,
			clientSecret: client.secret
		});
		const profile = await fetchHackatimeProfile(tokens.accessToken);
		if (profile && (await hackatimeLinkedElsewhere(profile.id, session.sub))) {
			redirect(303, `${dest}?hackatime=taken`);
		}
		await saveHackatimeConnection(session.sub, {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			expiresIn: tokens.expiresIn,
			scope: tokens.scope ?? HACKATIME_SCOPES,
			hackatimeUserId: profile?.id ?? null
		});
		redirect(303, `${dest}?hackatime=connected`);
	} catch (err) {
		if (isRedirect(err)) throw err;
		if (isUniqueViolation(err)) redirect(303, `${dest}?hackatime=taken`);
		console.error('Hackatime callback failed');
		redirect(303, `${dest}?hackatime=failed`);
	}
};
