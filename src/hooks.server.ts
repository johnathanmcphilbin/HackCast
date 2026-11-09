import { redirect } from '@sveltejs/kit';
import { sessionGate } from '#lib/server/auth-config.ts';
import { sessionSecret } from '#lib/server/config.ts';
import { applySecurityHeaders } from '#lib/server/security.ts';
import { readSession, SESSION_COOKIE } from '#lib/server/session.ts';
import type { Handle } from '@sveltejs/kit/hooks';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = readSession(event.cookies.get(SESSION_COOKIE), sessionSecret());
	if (!event.locals.session) {
		const gate = sessionGate(event.url.pathname);
		if (gate) redirect(303, gate);
	}
	const response = await resolve(event);
	applySecurityHeaders(response.headers);
	return response;
};
