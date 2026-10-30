import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'hackcast_session';
export const TXN_COOKIE = 'hackcast_hca';

export type Session = {
	sub: string;
	name: string;
	slackId: string | null;
	exp: number;
};

export type AuthTxn = {
	state: string;
	nonce: string;
	verifier: string;
	next: string;
	exp: number;
};

function mac(body: string, secret: string): string {
	return createHmac('sha256', secret).update(body).digest('base64url');
}

function same(a: string, b: string): boolean {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
}

export function signPayload(payload: object, secret: string): string {
	const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
	return `${body}.${mac(body, secret)}`;
}

export function readPayload(token: string | undefined, secret: string | undefined): unknown | null {
	if (!token || !secret) return null;
	const split = token.lastIndexOf('.');
	if (split <= 0) return null;
	const body = token.slice(0, split);
	const signature = token.slice(split + 1);
	if (!same(signature, mac(body, secret))) return null;
	try {
		const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as { exp?: unknown };
		if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return null;
		return payload;
	} catch {
		return null;
	}
}

export function signSession(session: Omit<Session, 'exp'>, secret: string, ttlSeconds = 60 * 60 * 24 * 30): string {
	return signPayload({ ...session, exp: Math.floor(Date.now() / 1000) + ttlSeconds }, secret);
}

export function readSession(token: string | undefined, secret: string | undefined): Session | null {
	const payload = readPayload(token, secret) as Partial<Session> | null;
	if (!payload || typeof payload.sub !== 'string' || typeof payload.name !== 'string') return null;
	return {
		sub: payload.sub,
		name: payload.name,
		slackId: typeof payload.slackId === 'string' ? payload.slackId : null,
		exp: payload.exp ?? 0
	};
}

export function signTxn(txn: Omit<AuthTxn, 'exp'>, secret: string, ttlSeconds = 600): string {
	return signPayload({ ...txn, exp: Math.floor(Date.now() / 1000) + ttlSeconds }, secret);
}

export function readTxn(token: string | undefined, secret: string | undefined): AuthTxn | null {
	const payload = readPayload(token, secret) as Partial<AuthTxn> | null;
	if (!payload || typeof payload.state !== 'string' || typeof payload.nonce !== 'string' || typeof payload.verifier !== 'string') {
		return null;
	}
	return {
		state: payload.state,
		nonce: payload.nonce,
		verifier: payload.verifier,
		next: typeof payload.next === 'string' ? payload.next : '/join',
		exp: payload.exp ?? 0
	};
}
