import { error, redirect } from '@sveltejs/kit';
import { isAuthReady, slackIsAdmin } from './config.ts';
import type { RequestEvent } from '@sveltejs/kit';

export function assertAdmin(event: RequestEvent): { sub: string; name: string; slackId: string | null } {
	if (!isAuthReady()) error(404);
	const session = event.locals.session;
	if (!session) redirect(303, '/auth/login?next=/admin/rsvps');
	if (!slackIsAdmin(session.slackId)) error(404);
	return session;
}
