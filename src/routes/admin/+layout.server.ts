import { requireStaff } from '#lib/server/staff.ts';
import { pendingCount } from '#lib/server/submissions.ts';
import type { LayoutServerLoad } from './$types';

/** Every admin page needs at least a reviewer. Pages that are admin-only check again. */
export const load: LayoutServerLoad = async (event) => {
	const { role } = await requireStaff(event, 'reviewer', event.url.pathname);
	let pending: number | null = null;
	try {
		pending = await pendingCount();
	} catch {
		console.error('pending count failed');
	}
	return { role, pending };
};
