import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Old links to /join go straight to Hack Club Auth.
export const GET: RequestHandler = () => redirect(303, '/auth/login');
