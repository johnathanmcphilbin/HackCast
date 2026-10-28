import { redirect } from '@sveltejs/kit';
import { getRedirectUri, hcaClient, isAuthReady, secureCookies, sessionSecret } from '#lib/server/config.ts';
import { authorizeUrl, createOidcTxn } from '#lib/server/hca.ts';
import { safeNext } from '#lib/server/auth-config.ts';
import { signTxn, TXN_COOKIE } from '#lib/server/session.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url, cookies, locals }) => {
	const next = safeNext(url.searchParams.get('next'));
	if (!isAuthReady()) redirect(303, '/join');
	if (locals.session) redirect(303, next);

	const secret = sessionSecret();
	const client = hcaClient();
	const redirectUri = getRedirectUri();
	if (!secret || !client || !redirectUri) redirect(303, '/join');

	const txn = createOidcTxn();
	cookies.set(TXN_COOKIE, signTxn({ state: txn.state, nonce: txn.nonce, verifier: txn.verifier, next }, secret), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: secureCookies(),
		maxAge: 600
	});

	redirect(302, authorizeUrl({ clientId: client.id, redirectUri, txn }));
};
