import { error, redirect } from '@sveltejs/kit';
import { secureCookies } from '#lib/server/config.ts';
import { requestOriginAllowed } from '#lib/server/security.ts';
import { HT_COOKIE, SESSION_COOKIE, TXN_COOKIE } from '#lib/server/session.ts';
import type { RequestHandler } from './$types';

const CONFIRM = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign out | Hackcast</title>
</head>
<body>
<h1>Sign out of Hackcast</h1>
<p>This signs you out on this browser.</p>
<form method="post" action="/auth/logout">
<button type="submit">Sign out</button>
</form>
</body>
</html>
`;

function clearAuthCookies(cookies: Parameters<RequestHandler>[0]['cookies']) {
	// Match the flags used when the cookies were set. A Secure cookie is not
	// cleared by a Set-Cookie that omits Secure, and the reverse is also true.
	const options = { path: '/', sameSite: 'lax' as const, secure: secureCookies() };
	cookies.delete(SESSION_COOKIE, options);
	cookies.delete(TXN_COOKIE, options);
	cookies.delete(HT_COOKIE, options);
}

/** GET must not sign anyone out. An <img> or a cross-site link would otherwise do it. */
export const GET: RequestHandler = () => {
	return new Response(CONFIRM, {
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'cache-control': 'no-store'
		}
	});
};

export const POST: RequestHandler = ({ cookies, request, url }) => {
	if (!requestOriginAllowed(request.headers.get('origin'), url.origin)) error(403, 'Forbidden');
	clearAuthCookies(cookies);
	redirect(303, '/');
};
