import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Naming a project and linking Hackatime moved into a popup on the dashboard.
export const GET: RequestHandler = ({ url }) => redirect(303, `/dashboard${url.search}`);
