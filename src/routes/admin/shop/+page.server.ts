import { fail, redirect } from '@sveltejs/kit';
import { hoursLabel, isRedemptionStatus, money, type RedemptionStatus } from '#lib/shop.ts';
import { listRedemptions, shopTotals, updateRedemption, type AdminRedemption } from '#lib/server/shop.ts';
import { requireStaff } from '#lib/server/staff.ts';
import { UUID } from '#lib/server/submission-form.ts';
import type { Actions, PageServerLoad } from './$types';

function wanted(value: string | null): RedemptionStatus | null {
	return value && isRedemptionStatus(value) ? value : null;
}

function address(row: AdminRedemption): string | null {
	const parts = [row.shipName, row.addressLine1, row.addressLine2, [row.city, row.state, row.postalCode].filter(Boolean).join(' '), row.country].filter(
		(part): part is string => Boolean(part)
	);
	return parts.length ? parts.join(', ') : null;
}

export const load: PageServerLoad = async (event) => {
	await requireStaff(event, 'admin', '/admin/shop');
	const status = wanted(event.url.searchParams.get('status'));
	try {
		const [rows, totals] = await Promise.all([listRedemptions(status), shopTotals()]);
		return {
			unavailable: false,
			status,
			saved: event.url.searchParams.get('saved') === '1',
			totals: {
				reserved: hoursLabel(totals.seconds),
				committed: money(totals.cents),
				pending: totals.pending,
				approved: totals.approved,
				fulfilled: totals.fulfilled,
				rejected: totals.rejected
			},
			rows: rows.map((row) => ({
				id: row.id,
				name: row.name,
				email: row.email,
				sku: row.sku,
				title: row.title,
				stackable: row.stackable,
				hours: row.hours,
				grantLabel: row.grantLabel,
				status: row.status,
				note: row.note,
				question: row.question,
				address: address(row),
				createdAt: row.createdAt.toISOString()
			}))
		};
	} catch {
		console.error('shop admin failed');
		return { unavailable: true, status, saved: false, totals: null, rows: [] };
	}
};

export const actions: Actions = {
	update: async (event) => {
		await requireStaff(event, 'admin', '/admin/shop');
		const form = await event.request.formData();
		const id = String(form.get('id') ?? '');
		const status = String(form.get('status') ?? '');
		const note = String(form.get('note') ?? '').trim();
		if (!UUID.test(id)) return fail(400, { message: 'Pick a redemption.' });
		if (!isRedemptionStatus(status)) return fail(400, { message: 'That status is not one we use.' });
		if (note.length > 500) return fail(400, { message: 'Keep the note under 500 characters.' });
		try {
			const saved = await updateRedemption(id, status, note || null);
			if (!saved) return fail(400, { message: 'That redemption is not in the list.' });
		} catch {
			console.error('shop status update failed');
			return fail(500, { message: 'Could not save that status. Try again.' });
		}
		const filter = wanted(event.url.searchParams.get('status'));
		redirect(303, filter ? `/admin/shop?status=${filter}&saved=1` : '/admin/shop?saved=1');
	}
};
