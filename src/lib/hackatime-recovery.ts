/** Permanent Hackatime failures. Retrying OAuth sends the user back to the same error. */
const BLOCKED = new Set(['taken', 'soon']);

export function hackatimeConnectBlocked(notice: string | null | undefined): boolean {
	return notice != null && BLOCKED.has(notice);
}

/**
 * Href for another Hackatime connect attempt.
 * `taken` and `soon` return null so Continue cannot loop through `/auth/hackatime`.
 */
export function hackatimeContinueHref(notice: string | null | undefined, ready = true): string | null {
	if (!ready || hackatimeConnectBlocked(notice)) return null;
	return '/auth/hackatime?next=/dashboard';
}

export function hackatimeStatusCopy(notice: string, where: 'onboarding' | 'dashboard' = 'onboarding'): string {
	switch (notice) {
		case 'taken':
			return 'That Hackatime account is already connected to another Hackcast login. Sign out and sign in with the Hack Club account that owns it, or start a HackCast project without linking.';
		case 'soon':
			return "Hackatime sign-in isn't set up on this server. Start a HackCast project now and connect Hackatime later.";
		case 'denied':
			return "Hackatime wasn't connected. Try again, or start a HackCast project without linking.";
		case 'failed':
			return "That connection didn't land. Try again, or start a HackCast project without linking.";
		case 'connected':
			return where === 'dashboard'
				? 'Hackatime is connected.'
				: 'Hackatime is connected. Link the project you are building for HackCast.';
		default:
			return "Hackatime didn't connect. Start a HackCast project without linking, or try again.";
	}
}
