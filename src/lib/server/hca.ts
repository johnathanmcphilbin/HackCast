import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { jwtVerify, type JWTVerifyGetKey } from 'jose';
import { HCA_AUTHORIZE, HCA_ISSUER, HCA_SCOPES, HCA_TOKEN } from './auth-config.ts';

export type IdClaims = {
	sub: string;
	name: string;
	email: string;
	slackId: string | null;
	verificationStatus: string | null;
	yswsEligible: boolean | null;
};

export type PkceTxn = {
	state: string;
	nonce: string;
	verifier: string;
	challenge: string;
};

function bytes(size: number): string {
	return randomBytes(size).toString('base64url');
}

export function createPkce(): { verifier: string; challenge: string } {
	const verifier = bytes(32);
	const challenge = createHash('sha256').update(verifier).digest('base64url');
	return { verifier, challenge };
}

export function createOidcTxn(): PkceTxn {
	const { verifier, challenge } = createPkce();
	return { state: bytes(24), nonce: bytes(24), verifier, challenge };
}

export function authorizeUrl(input: {
	clientId: string;
	redirectUri: string;
	txn: PkceTxn;
}): string {
	const url = new URL(HCA_AUTHORIZE);
	url.searchParams.set('client_id', input.clientId);
	url.searchParams.set('redirect_uri', input.redirectUri);
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('scope', HCA_SCOPES);
	url.searchParams.set('state', input.txn.state);
	url.searchParams.set('nonce', input.txn.nonce);
	url.searchParams.set('code_challenge', input.txn.challenge);
	url.searchParams.set('code_challenge_method', 'S256');
	return url.toString();
}

function text(value: unknown): string | null {
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function claimsFromPayload(payload: Record<string, unknown>): IdClaims {
	const sub = text(payload.sub);
	if (!sub) throw new Error('Hack Club Auth token has no subject');
	const given = text(payload.given_name) ?? '';
	const family = text(payload.family_name) ?? '';
	const combined = `${given} ${family}`.trim();
	const name = text(payload.name) ?? (combined || 'hack clubber');
	const eligible = payload.ysws_eligible;
	return {
		sub,
		name,
		email: text(payload.email) ?? '',
		slackId: text(payload.slack_id),
		verificationStatus: text(payload.verification_status),
		yswsEligible: typeof eligible === 'boolean' ? eligible : null
	};
}

function statesMatch(a: string, b: string): boolean {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
}

export async function redeemCode(input: {
	code: string;
	state: string;
	expectedState: string;
	verifier: string;
	nonce: string;
	clientId: string;
	clientSecret: string;
	redirectUri: string;
	fetchImpl?: typeof fetch;
	jwks: JWTVerifyGetKey;
	tokenEndpoint?: string;
	issuer?: string;
}): Promise<IdClaims> {
	if (!statesMatch(input.state, input.expectedState)) throw new Error('state');

	const fetchImpl = input.fetchImpl ?? fetch;
	const body = new URLSearchParams({
		grant_type: 'authorization_code',
		code: input.code,
		redirect_uri: input.redirectUri,
		client_id: input.clientId,
		client_secret: input.clientSecret,
		code_verifier: input.verifier
	});
	const response = await fetchImpl(input.tokenEndpoint ?? HCA_TOKEN, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
		body
	});
	if (!response.ok) throw new Error('token');
	const json = (await response.json()) as { id_token?: unknown };
	if (typeof json.id_token !== 'string') throw new Error('id_token');

	const { payload } = await jwtVerify(json.id_token, input.jwks, {
		issuer: input.issuer ?? HCA_ISSUER,
		audience: input.clientId,
		clockTolerance: 60
	});
	if (payload.nonce !== input.nonce) throw new Error('nonce');
	return claimsFromPayload(payload as Record<string, unknown>);
}
