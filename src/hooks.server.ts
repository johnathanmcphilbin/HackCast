import { readSession, SESSION_COOKIE } from '#lib/server/session.ts';
import { sessionSecret } from '#lib/server/config.ts';
import type { Handle } from '@sveltejs/kit/hooks';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = readSession(event.cookies.get(SESSION_COOKIE), sessionSecret());
	return resolve(event);
};
