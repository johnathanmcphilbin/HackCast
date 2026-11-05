import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { requireSession } from '#lib/server/guards.ts';
import {
	ShopError,
	placeRedemption,
	redemptionsFor,
	shippingAddressFor,
	spentSecondsFor
} from '#lib/server/shop.ts';
import { approvedSecondsFor } from '#lib/server/submissions.ts';
import { hoursRace, upsertUser } from '#lib/server/users.ts';
import type { Actions, PageServerLoad } from './$types';

const empty = {
	approvedSeconds: 0,
	availableSeconds: 0,
	hasAddress: false,
	unavailable: false,
	redemptions: [] as {
		id: string;
		title: string;
		hours: number;
		grantLabel: string;
		status: string;
		stackable: boolean;
		createdAt: string;
	}[]
};

export const load: PageServerLoad = async (event) => {
	const session = requireSession(event, '/shop');
	const base = {
		redeemed: event.url.searchParams.get('redeemed') === '1',
		unavailable: false,
		leading: false,
		shop: empty
	};
	try {
		await upsertUser({ hackclubId: session.sub, displayName: session.name, email: '', slackId: session.slackId });
		const [approved, spent, mine, address, race] = await Promise.all([
			approvedSecondsFor(session.sub),
			spentSecondsFor(session.sub),
			redemptionsFor(session.sub),
			shippingAddressFor(session.sub),
			hoursRace()
		]);
		return {
			...base,
			leading: race[0]?.hackclubId === session.sub,
			shop: {
				approvedSeconds: approved,
				availableSeconds: Math.max(0, approved - spent),
				hasAddress: Boolean(address),
				unavailable: false,
				redemptions: mine.map((row) => ({
					id: row.id,
					title: row.title,
					hours: row.hours,
					grantLabel: row.grantLabel,
					status: row.status,
					stackable: row.stackable,
					createdAt: row.createdAt.toISOString()
				}))
			}
		};
	} catch (err) {
		if (isRedirect(err)) throw err;
		console.error('shop page failed');
		return { ...base, unavailable: true, shop: { ...empty, unavailable: true } };
	}
};

export const actions: Actions = {
	redeem: async (event) => {
		const session = requireSession(event, '/shop');
		const form = await event.request.formData();
		const sku = String(form.get('sku') ?? '');
		try {
			await upsertUser({ hackclubId: session.sub, displayName: session.name, email: '', slackId: session.slackId });
			await placeRedemption(session.sub, form);
		} catch (err) {
			if (isRedirect(err)) throw err;
			const message = err instanceof ShopError ? err.message : null;
			if (message) return fail(400, { area: 'shop', sku, message });
			console.error('redeem failed');
			return fail(500, { area: 'shop', sku, message: 'Could not save that redemption. Try again.' });
		}
		redirect(303, '/shop?redeemed=1');
	}
};
