/**
 * Test-only stand-in for Hack Club Auth's token and JWKS endpoints.
 * Loaded with `node --import` in the rsvp flow test. The app never imports this.
 * Sign-in still uses the real callback: state, PKCE cookie, and nonce are checked there.
 * This file only replaces the HTTPS calls to auth.hackclub.com that the callback would make.
 */
import { exportJWK, generateKeyPair, SignJWT } from 'jose';

if (process.env.HCA_MOCK !== '1') {
	throw new Error('hca-mock-preload is test-only');
}

const originalFetch = globalThis.fetch.bind(globalThis);
const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
const jwk = await exportJWK(publicKey);
jwk.kid = 'hackcast-e2e';
jwk.alg = 'RS256';
jwk.use = 'sig';

const PEOPLE = {
	member: {
		sub: 'ident!ada',
		email: 'ada@hackclub.com',
		name: 'Ada',
		slack_id: 'UADA'
	},
	'member-again': {
		sub: 'ident!ada',
		email: 'ada@hackclub.com',
		name: 'Ada Lovelace',
		slack_id: 'UADA'
	},
	admin: {
		sub: 'ident!sam',
		email: 'sam@hackclub.com',
		name: 'Sam',
		slack_id: 'UADMIN'
	},
	quiet: {
		sub: 'ident!quiet',
		email: 'quiet@hackclub.com',
		name: 'Quiet',
		slack_id: 'UQUIET'
	}
};

function adminSlack() {
	const first = (process.env.ADMIN_SLACK_IDS ?? 'UADMIN').split(',')[0]?.trim();
	return first || 'UADMIN';
}

async function readBody(body) {
	if (body == null) return '';
	if (typeof body === 'string') return body;
	if (body instanceof URLSearchParams) return body.toString();
	if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) return body.toString('utf8');
	if (body instanceof Uint8Array) return new TextDecoder().decode(body);
	if (typeof body.text === 'function') return body.text();
	if (typeof body.getReader === 'function') return new Response(body).text();
	return String(body);
}

globalThis.fetch = async (input, init) => {
	const href = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
	const url = new URL(href);
	if (url.origin !== 'https://auth.hackclub.com') return originalFetch(input, init);

	if (url.pathname === '/oauth/discovery/keys') {
		return Response.json({ keys: [jwk] });
	}

	if (url.pathname === '/oauth/token') {
		const params = new URLSearchParams(await readBody(init?.body));
		const code = params.get('code') ?? '';
		const dot = code.indexOf('.');
		const who = dot === -1 ? '' : code.slice(0, dot);
		const nonce = dot === -1 ? '' : code.slice(dot + 1);
		const person = PEOPLE[who];
		if (!person) {
			console.error(`[hca-mock] unknown code prefix ${who || '(none)'}`);
			return Response.json({ error: 'unknown_code' }, { status: 400 });
		}
		const token = await new SignJWT({
			email: person.email,
			name: person.name,
			slack_id: who === 'admin' ? adminSlack() : person.slack_id,
			verification_status: 'verified',
			ysws_eligible: true,
			nonce
		})
			.setProtectedHeader({ alg: 'RS256', kid: 'hackcast-e2e' })
			.setIssuer('https://auth.hackclub.com')
			.setSubject(person.sub)
			.setAudience(process.env.HCA_CLIENT_ID || 'test-client')
			.setIssuedAt()
			.setExpirationTime('5m')
			.sign(privateKey);
		console.error(`[hca-mock] token for ${who}`);
		return Response.json({ id_token: token, access_token: 'atk', token_type: 'Bearer' });
	}

	return originalFetch(input, init);
};
