import { fail } from '@sveltejs/kit';
import { adminEmails } from '#lib/server/config.ts';
import { cleanEmail, OWNER_EMAILS } from '#lib/server/roles.ts';
import { requireStaff } from '#lib/server/staff.ts';
import { listStaff, setStaffRole } from '#lib/server/users.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await requireStaff(event, 'admin', '/admin/team');
	const fixed = [...OWNER_EMAILS, ...(adminEmails() ?? '').split(',')].map((email) => email.trim()).filter(Boolean);
	try {
		return { unavailable: false, staff: await listStaff(), fixed };
	} catch {
		console.error('staff list failed');
		return { unavailable: true, staff: [], fixed };
	}
};

export const actions: Actions = {
	add: async (event) => {
		await requireStaff(event, 'admin', '/admin/team');
		const form = await event.request.formData();
		const email = cleanEmail(form.get('email'));
		const role = form.get('role');
		if (!email) return fail(400, { message: 'Use the email they sign in to Hack Club with.' });
		if (role !== 'reviewer' && role !== 'admin') return fail(400, { message: 'Pick reviewer or admin.' });
		await setStaffRole(email, role);
		return { message: `${email} is now a ${role}.` };
	},
	remove: async (event) => {
		await requireStaff(event, 'admin', '/admin/team');
		const email = cleanEmail((await event.request.formData()).get('email'));
		if (!email) return fail(400, { message: 'Pick someone to remove.' });
		await setStaffRole(email, null);
		return { message: `${email} no longer has a role.` };
	}
};
