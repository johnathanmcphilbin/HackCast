import { error, redirect } from '@sveltejs/kit';
import { adminEmails, isAuthReady, slackIsAdmin } from './config.ts';
import { roleFor } from './roles.ts';
import { userAccess, type StaffRole } from './users.ts';

type SignedIn = NonNullable<App.Locals['session']>;

const CACHE_MS = 60_000;
const cache = new Map<string, { at: number; role: StaffRole | null }>();

/** Admin or reviewer for this session, or null. Database trouble counts as null. Kept a minute per person. */
export async function staffRole(session: SignedIn | null): Promise<StaffRole | null> {
	if (!session) return null;
	const hit = cache.get(session.sub);
	if (hit && Date.now() - hit.at < CACHE_MS) return hit.role;
	const role = await lookup(session);
	cache.set(session.sub, { at: Date.now(), role });
	return role;
}

async function lookup(session: SignedIn): Promise<StaffRole | null> {
	let access: Awaited<ReturnType<typeof userAccess>> = null;
	try {
		access = await userAccess(session.sub);
	} catch {
		console.error('staff role lookup failed');
	}
	return roleFor({
		email: access?.email ?? null,
		storedRole: access?.role ?? null,
		slackAdmin: slackIsAdmin(session.slackId),
		adminEmails: adminEmails()
	});
}

/**
 * Staff-only pages. Signed out goes through Hack Club Auth; signed in without
 * the role gets a 404 so the admin area doesn't announce itself.
 */
export async function requireStaff(
	event: { locals: App.Locals },
	need: StaffRole,
	next: string
): Promise<{ session: SignedIn; role: StaffRole }> {
	if (!isAuthReady()) error(404);
	const session = event.locals.session;
	if (!session) redirect(303, `/auth/login?next=${encodeURIComponent(next)}`);
	const role = await staffRole(session);
	if (!role || (need === 'admin' && role !== 'admin')) error(404);
	return { session, role };
}
