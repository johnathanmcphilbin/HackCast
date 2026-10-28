import { assertAdmin } from '#lib/server/admin.ts';
import { csvRow } from '#lib/server/csv.ts';
import { listRsvps } from '#lib/server/rsvps.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	assertAdmin(event);
	const rows = await listRsvps();
	const lines = [
		csvRow(['sub', 'name', 'email', 'slack_id', 'verification_status', 'ysws_eligible', 'question', 'created_at']),
		...rows.map((row) =>
			csvRow([
				row.sub,
				row.name,
				row.email,
				row.slackId,
				row.verificationStatus,
				row.yswsEligible === null ? '' : row.yswsEligible ? 'true' : 'false',
				row.question,
				row.createdAt.toISOString()
			])
		)
	];
	return new Response(lines.join('\n') + '\n', {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': 'attachment; filename="hackcast-rsvps.csv"',
			'cache-control': 'no-store'
		}
	});
};
