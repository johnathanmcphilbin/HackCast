// Runs in front of SvelteKit's own cross-site check (see server.js).
// Kit rejects any form POST whose Origin header isn't this site, and answers
// with a bare 403 that browsers save as a file called "dashboard". Some
// browsers, school filters and extensions drop the Origin header or send
// "null" on a real same-site submit, so a builder creating a project got a
// download instead of their dashboard.

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const FORM_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];

/**
 * Mirrors Kit's test: a mutating request with no body type or a form body type.
 * @param {string | undefined} method
 * @param {string | undefined} contentType
 */
export function isFormSubmission(method, contentType) {
	if (!method || !MUTATING.has(method)) return false;
	if (!contentType) return true;
	const type = contentType.split(';')[0].trim().toLowerCase();
	return FORM_TYPES.includes(type);
}

/** @param {string} value */
function originOf(value) {
	try {
		return new URL(value).origin;
	} catch {
		return null;
	}
}

/**
 * What to do with a form submission, given this site's origin.
 * 'ok': Origin matches. 'fill': Origin is missing or "null" but the browser
 * says it came from this site, so set Origin and let Kit through.
 * 'reject': it came from somewhere else.
 * @param {{ origin?: string; secFetchSite?: string; referer?: string }} request
 * @param {string} self
 * @returns {'ok' | 'fill' | 'reject'}
 */
export function checkOrigin({ origin, secFetchSite, referer }, self) {
	if (origin === self) return 'ok';
	if (origin && origin !== 'null') return 'reject';
	// Browsers set Sec-Fetch-Site themselves; a page can't forge it.
	if (secFetchSite) return secFetchSite === 'same-origin' ? 'fill' : 'reject';
	return referer && originOf(referer) === self ? 'fill' : 'reject';
}

export const REJECTED_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>That didn't go through | Hackcast</title>
<style>
body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #cfe8f7; color: #14223a; font: 600 1.05rem/1.5 system-ui, sans-serif; }
main { width: min(32rem, calc(100% - 2rem)); padding: 1.5rem; background: #fff; border: 3px solid #14223a; }
h1 { margin: 0 0 0.5rem; font-size: 1.6rem; }
a { display: inline-block; margin-top: 0.8rem; padding: 0.5rem 0.9rem; background: #f576c6; color: #14223a; border: 3px solid #14223a; font-weight: 800; text-decoration: none; }
</style>
</head>
<body>
<main>
<h1>That didn't go through.</h1>
<p>We couldn't tell that this form came from Hackcast, so we didn't save it. Nothing was changed.</p>
<p>Open hackcast.hackclub.com directly and try again. If it keeps happening, try another browser or turn off extensions that block headers.</p>
<a href="/dashboard">Back to your dashboard</a>
</main>
</body>
</html>
`;
