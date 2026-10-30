import { createRemoteJWKSet } from 'jose';
import { isRedirect, redirect } from '@sveltejs/kit';
import { HCA_JWKS, safeNext } from '#lib/server/auth-config.ts';
import { getRedirectUri, hcaClient, isAuthReady, secureCookies, sessionSecret } from '#lib/server/config.ts';
import { redeemCode } from '#lib/server/hca.ts';
import { upsertRsvp } from '#lib/server/rsvps.ts';
import { readTxn, SESSION_COOKIE, signSession, TXN_COOKIE } from '#lib/server/session.ts';
import type { RequestHandler } from './$types';

const jwks = createRemoteJWKSet(new URL(HCA_JWKS));

function fail(cookies: Parameters<RequestHandler>[0]['cookies']): never {
	cookies.delete(TXN_COOKIE, { path: '/' });
	redirect(303, '/join?error=auth');
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	if (!isAuthReady()) redirect(303, '/join');

	const secret = sessionSecret();
	const client = hcaClient();
	const redirectUri = getRedirectUri();
	const txn = secret ? readTxn(cookies.get(TXN_COOKIE), secret) : null;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	if (!secret || !client || !redirectUri || !txn || !code || !state || url.searchParams.get('error')) {
		fail(cookies);
	}

	try {
		const claims = await redeemCode({
			code: code!,
			state: state!,
			expectedState: txn!.state,
			verifier: txn!.verifier,
			nonce: txn!.nonce,
			clientId: client!.id,
			clientSecret: client!.secret,
			redirectUri: redirectUri!,
			jwks
		});
		await upsertRsvp({
			sub: claims.sub,
			name: claims.name,
			email: claims.email,
			slackId: claims.slackId,
			verificationStatus: claims.verificationStatus,
			yswsEligible: claims.yswsEligible
		});
		cookies.set(
			SESSION_COOKIE,
			signSession({ sub: claims.sub, name: claims.name, slackId: claims.slackId }, secret!),
			{
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: secureCookies(),
				maxAge: 60 * 60 * 24 * 30
			}
		);
		cookies.delete(TXN_COOKIE, { path: '/' });
		redirect(303, safeNext(txn!.next));
	} catch (err) {
		if (isRedirect(err)) throw err;
		console.error('Hack Club Auth callback failed');
		fail(cookies);
	}
};
