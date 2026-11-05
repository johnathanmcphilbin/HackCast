import { requireStaff } from '#lib/server/staff.ts';
import { listRsvps } from '#lib/server/rsvps.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await requireStaff(event, 'admin', '/admin/rsvps');
	try {
		const rows = await listRsvps();
		return {
			unavailable: false as const,
			rows: rows.map((row) => ({
				name: row.name,
				email: row.email,
				slackId: row.slackId,
				verificationStatus: row.verificationStatus,
				yswsEligible: row.yswsEligible,
				createdAt: row.createdAt.toISOString()
			}))
		};
	} catch {
		console.error('admin rsvp list failed');
		return { rows: [], unavailable: true as const };
	}
};
