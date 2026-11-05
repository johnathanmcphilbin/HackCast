import { redirect } from '@sveltejs/kit';
import { safeNext } from './auth-config.ts';

type SignedIn = NonNullable<App.Locals['session']>;

/** Signed-in Hack Club session, or back through Hack Club Auth to `next`. */
export function requireSession(event: { locals: App.Locals }, next: string): SignedIn {
	const session = event.locals.session;
	if (!session) redirect(303, `/auth/login?next=${encodeURIComponent(safeNext(next))}`);
	return session;
}
