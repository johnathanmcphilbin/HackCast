// `npm start`. The adapter-node handler behind an origin check that fills in a
// missing Origin for real same-site form submits and answers the rest with a
// page instead of a bare 403. See origin-check.js.
import { createServer } from 'node:http';
import { handler } from './build/handler.js';
import { checkOrigin, isFormSubmission, REJECTED_PAGE } from './origin-check.js';

/** @param {import('node:http').IncomingMessage} req @param {string} name */
const header = (req, name) => {
	const value = req.headers[name];
	return Array.isArray(value) ? value[0] : value;
};

/** @param {import('node:http').IncomingMessage} req */
function selfOrigin(req) {
	if (process.env.ORIGIN) return process.env.ORIGIN;
	const protocolHeader = (process.env.PROTOCOL_HEADER ?? '').toLowerCase();
	const hostHeader = (process.env.HOST_HEADER ?? '').toLowerCase();
	const protocol = (protocolHeader && header(req, protocolHeader)?.split(',')[0].trim()) || 'https';
	const host = (hostHeader && header(req, hostHeader)?.split(',')[0].trim()) || header(req, 'host');
	return `${protocol}://${host}`;
}

const server = createServer((req, res) => {
	if (isFormSubmission(req.method, header(req, 'content-type'))) {
		const self = selfOrigin(req);
		const request = {
			origin: header(req, 'origin'),
			secFetchSite: header(req, 'sec-fetch-site'),
			referer: header(req, 'referer')
		};
		const verdict = checkOrigin(request, self);
		if (verdict === 'fill') {
			req.headers.origin = self;
		} else if (verdict === 'reject') {
			console.error('form submit rejected', JSON.stringify({ path: req.url?.split('?')[0], expected: self, ...request }));
			res.writeHead(403, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
			res.end(REJECTED_PAGE);
			return;
		}
	}
	handler(req, res, () => {
		res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
		res.end('Not found');
	});
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';
server.listen(port, host, () => console.log(`Listening on http://${host}:${port}`));

for (const signal of ['SIGTERM', 'SIGINT']) {
	process.on(signal, () => server.close(() => process.exit(0)));
}
