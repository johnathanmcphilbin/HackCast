import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateKeyPair, exportJWK, SignJWT, importJWK, type JWK } from 'jose';
import {
	authReady,
	HCA_SCOPES,
	isAdminSlack,
	redirectUri,
	safeNext,
	visibleRsvpCount
} from './auth-config.ts';
import { csvCell } from './csv.ts';
import { authorizeUrl, createOidcTxn, redeemCode } from './hca.ts';
import { readSession, signSession } from './session.ts';

const env = {
	HCA_CLIENT_ID: 'client',
	HCA_CLIENT_SECRET: 'secret',
	PUBLIC_BASE_URL: 'https://hackcast.example',
	SESSION_SECRET: 'test-secret',
	DATABASE_URL: 'postgres://localhost/hackcast'
};

describe('auth config', () => {
	it('defaults the redirect URI to the public callback', () => {
		assert.equal(redirectUri(env), 'https://hackcast.example/auth/callback');
		assert.equal(
			redirectUri({ ...env, PUBLIC_BASE_URL: 'https://hackcast.example/' }),
			'https://hackcast.example/auth/callback'
		);
		assert.equal(redirectUri({ ...env, HCA_REDIRECT_URI: 'https://other.example/cb' }), 'https://other.example/cb');
	});

	it('stays closed until HCA, the session secret, the database, and a redirect exist', () => {
		assert.equal(authReady(env), true);
		assert.equal(authReady({ ...env, HCA_CLIENT_SECRET: '' }), false);
		assert.equal(authReady({ ...env, DATABASE_URL: undefined }), false);
		assert.equal(authReady({ ...env, PUBLIC_BASE_URL: undefined, HCA_REDIRECT_URI: undefined }), false);
	});

	it('hides a zero or missing RSVP count', () => {
		assert.equal(visibleRsvpCount(0), null);
		assert.equal(visibleRsvpCount(null), null);
		assert.equal(visibleRsvpCount(4), 4);
	});

	it('only allows known return paths', () => {
		assert.equal(safeNext('/admin/rsvps'), '/admin/rsvps');
		assert.equal(safeNext('https://evil.example'), '/join');
		assert.equal(safeNext('//evil.example'), '/join');
	});

	it('matches slack ids on the admin allowlist', () => {
		assert.equal(isAdminSlack('U123', 'U999, U123'), true);
		assert.equal(isAdminSlack('U123', 'U999'), false);
		assert.equal(isAdminSlack(null, 'U123'), false);
	});
});

describe('Hack Club Auth code flow', () => {
	it('sends PKCE and the identity scopes', () => {
		const txn = createOidcTxn();
		const url = new URL(authorizeUrl({ clientId: 'client', redirectUri: redirectUri(env)!, txn }));
		assert.equal(url.searchParams.get('response_type'), 'code');
		assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
		assert.equal(url.searchParams.get('code_challenge'), txn.challenge);
		assert.equal(url.searchParams.get('scope'), HCA_SCOPES);
		assert.equal(url.searchParams.get('state'), txn.state);
	});

	it('reads an ineligible member from a mocked token and rejects a bad state', async () => {
		const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
		const jwk = await exportJWK(publicKey);
		jwk.kid = 'test';
		const txn = createOidcTxn();
		const token = await new SignJWT({
			email: 'ada@hackclub.com',
			name: 'Ada',
			slack_id: 'UADA',
			verification_status: 'verified',
			ysws_eligible: false,
			nonce: txn.nonce
		})
			.setProtectedHeader({ alg: 'RS256', kid: 'test' })
			.setIssuer('https://auth.hackclub.com')
			.setSubject('ident!ada')
			.setAudience('client')
			.setIssuedAt()
			.setExpirationTime('2m')
			.sign(privateKey);

		const fetchImpl: typeof fetch = async () =>
			new Response(JSON.stringify({ id_token: token, access_token: 'atk', token_type: 'Bearer' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			});

		const claims = await redeemCode({
			code: 'auth-code',
			state: txn.state,
			expectedState: txn.state,
			verifier: txn.verifier,
			nonce: txn.nonce,
			clientId: 'client',
			clientSecret: 'secret',
			redirectUri: redirectUri(env)!,
			fetchImpl,
			jwks: jwksKey(jwk)
		});

		assert.deepEqual(claims, {
			sub: 'ident!ada',
			name: 'Ada',
			email: 'ada@hackclub.com',
			slackId: 'UADA',
			verificationStatus: 'verified',
			yswsEligible: false
		});

		await assert.rejects(
			() =>
				redeemCode({
					code: 'auth-code',
					state: 'nope',
					expectedState: txn.state,
					verifier: txn.verifier,
					nonce: txn.nonce,
					clientId: 'client',
					clientSecret: 'secret',
					redirectUri: redirectUri(env)!,
					fetchImpl,
					jwks: jwksKey(jwk)
				}),
			/state/
		);
	});
});

describe('session cookie', () => {
	it('round-trips a signed session and rejects tampering', () => {
		const token = signSession({ sub: 'ident!ada', name: 'Ada', slackId: 'UADA' }, 'test-secret', 60);
		assert.deepEqual(readSession(token, 'test-secret'), {
			sub: 'ident!ada',
			name: 'Ada',
			slackId: 'UADA',
			exp: readSession(token, 'test-secret')?.exp
		});
		assert.equal(readSession(token, 'other-secret'), null);
		assert.equal(readSession(`${token.slice(0, -2)}aa`, 'test-secret'), null);
	});
});

describe('csv', () => {
	it('quotes commas and neutralises formulas', () => {
		assert.equal(csvCell('ada@hackclub.com'), 'ada@hackclub.com');
		assert.equal(csvCell('a,b'), '"a,b"');
		assert.equal(csvCell('=cmd'), "'=cmd");
	});
});

function jwksKey(jwk: JWK) {
	return async () => importJWK(jwk, 'RS256');
}
