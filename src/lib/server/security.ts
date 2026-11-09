/** Response headers and small request checks that do not touch the database. */

export const FRAME_OPTIONS = 'DENY';
export const FRAME_ANCESTORS = "frame-ancestors 'none'";

/** Stop other sites from framing HackCast and clicking through redeem or review. */
export function applySecurityHeaders(headers: Headers): void {
	headers.set('x-frame-options', FRAME_OPTIONS);
	headers.set('content-security-policy', FRAME_ANCESTORS);
}

/**
 * A browser form post from this site sends `Origin` equal to the page origin.
 * Missing or foreign origins are rejected. Image and cross-site GETs never get here.
 */
export function requestOriginAllowed(originHeader: string | null, pageOrigin: string): boolean {
	return typeof originHeader === 'string' && originHeader.length > 0 && originHeader === pageOrigin;
}

/** Cap on questions one person can file for one guest. The hat picks the person, then one question. */
export const MAX_QUESTIONS_PER_GUEST = 30;

export function canAskAnother(existing: number): boolean {
	return Number.isInteger(existing) && existing >= 0 && existing < MAX_QUESTIONS_PER_GUEST;
}
