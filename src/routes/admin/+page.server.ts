import { requireStaff } from '#lib/server/staff.ts';
import { adminStats, liveActivity } from '#lib/server/stats.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await requireStaff(event, 'admin', '/admin');
	const refresh = event.url.searchParams.get('refresh') === '1';
	const [stats, live] = await Promise.all([
		adminStats().catch(() => {
			console.error('admin stats failed');
			return null;
		}),
		liveActivity(refresh).catch(() => {
			console.error('live activity failed');
			return null;
		})
	]);
	return {
		stats,
		live: live && {
			...live,
			checkedAt: live.checkedAt.toISOString(),
			workedOnToday: live.workedOnToday.map((project) => ({
				...project,
				lastHeartbeat: project.lastHeartbeat.toISOString()
			}))
		}
	};
};
