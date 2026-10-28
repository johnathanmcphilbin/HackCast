import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, TXN_COOKIE } from '#lib/server/session.ts';
import type { RequestHandler } from './$types';

const clear: RequestHandler = ({ cookies }) => {
	cookies.delete(SESSION_COOKIE, { path: '/' });
	cookies.delete(TXN_COOKIE, { path: '/' });
	redirect(303, '/');
};

export const GET = clear;
export const POST = clear;
