export type Role = 'admin' | 'reviewer';

/** Always admins, whatever the environment says. */
export const OWNER_EMAILS = ['johnny@hackclub.com'];

function emails(raw: string | undefined): Set<string> {
	return new Set(
		[...OWNER_EMAILS, ...(raw ?? '').split(',')].map((email) => email.trim().toLowerCase()).filter(Boolean)
	);
}

/** Admin beats reviewer. Owners, ADMIN_EMAILS and ADMIN_SLACK_IDS are admins; /admin/team sets the rest. */
export function roleFor(input: {
	email: string | null;
	storedRole: Role | null;
	slackAdmin: boolean;
	adminEmails: string | undefined;
}): Role | null {
	if (input.slackAdmin) return 'admin';
	const email = input.email?.trim().toLowerCase();
	if (email && emails(input.adminEmails).has(email)) return 'admin';
	return input.storedRole;
}

export function cleanEmail(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const email = value.trim().toLowerCase();
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : null;
}
