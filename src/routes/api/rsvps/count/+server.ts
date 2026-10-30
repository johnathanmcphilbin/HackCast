import { json } from '@sveltejs/kit';
import { rsvpCount } from '#lib/server/rsvps.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const count = await rsvpCount();
	return json(
		{ count },
		{
			headers: { 'cache-control': 'public, max-age=30' }
		}
	);
};
