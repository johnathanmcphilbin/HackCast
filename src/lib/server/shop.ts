import type postgres from 'postgres';
import {
	canAfford,
	isRedemptionStatus,
	parseOnAirQuestion,
	quoteRedeem,
	shopCopy,
	type RedemptionStatus,
	type ShipTo
} from '../shop.ts';
import { submissionsDatabase } from './submissions.ts';
import { database } from './users.ts';

/**
 * Shop redemptions. Pending, approved, and fulfilled reserve approved hours.
 * Rejected gives the hours back. Gear rows copy the Hack Club Auth address
 * onto the redemption. Credits are marked stackable. Questions store the text.
 * The catalog itself lives in src/lib/shop.ts.
 */

export class ShopError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ShopError';
	}
}

let schema: Promise<void> | null = null;

async function ready(): Promise<postgres.Sql> {
	const sql = await database();
	if (!schema) {
		schema = (async () => {
			await sql`
				create table if not exists shop_redemptions (
					id uuid primary key default gen_random_uuid(),
					user_id uuid not null references users (id) on delete cascade,
					sku text not null,
					title text not null,
					kind text not null check (kind in ('credit', 'gear', 'question')),
					stackable boolean not null default false,
					hours integer not null check (hours > 0),
					seconds integer not null check (seconds > 0),
					grant_cents integer,
					grant_label text not null,
					status text not null default 'pending'
						check (status in ('pending', 'approved', 'fulfilled', 'rejected')),
					note text,
					question text,
					ship_name text,
					address_line1 text,
					address_line2 text,
					city text,
					state text,
					postal_code text,
					country text,
					created_at timestamptz not null default now(),
					updated_at timestamptz not null default now(),
					decided_at timestamptz
				)
			`;
			await sql`
				create index if not exists shop_redemptions_status_idx
				on shop_redemptions (status, created_at desc)
			`;
			await sql`
				create index if not exists shop_redemptions_user_idx
				on shop_redemptions (user_id, created_at desc)
			`;
		})().catch((err) => {
			schema = null;
			throw err;
		});
	}
	await schema;
	return sql;
}

export type RedeemInput = {
	hackclubId: string;
	sku: string;
	hours: unknown;
	question: string | null;
	ship: ShipTo | null;
};

type AddressRow = {
	name: string;
	address_line1: string | null;
	address_line2: string | null;
	city: string | null;
	state: string | null;
	postal_code: string | null;
	country: string | null;
};

function toShip(row: AddressRow): ShipTo | null {
	const line1 = row.address_line1?.trim() ?? '';
	if (!line1) return null;
	return {
		name: row.name.trim() || 'Hack Clubber',
		line1,
		line2: row.address_line2?.trim() || null,
		city: row.city?.trim() || '',
		state: row.state?.trim() || null,
		postalCode: row.postal_code?.trim() || '',
		country: row.country?.trim() || ''
	};
}

/**
 * Address saved from Hack Club Auth at sign-in.
 * If that is empty, the newest submission that still has one.
 * Submission addresses are wiped after Airtable, so a found one is copied onto the user.
 */
export async function shippingAddressFor(hackclubId: string): Promise<ShipTo | null> {
	const sql = await database();
	const saved = await sql<AddressRow[]>`
		select display_name as name, address_line1, address_line2, city, state, postal_code, country
		from users where hackclub_id = ${hackclubId} limit 1
	`;
	const own = saved[0] ? toShip(saved[0]) : null;
	if (own) return own;
	try {
		await submissionsDatabase();
	} catch {
		return null;
	}
	const prior = await sql<AddressRow[]>`
		select trim(both ' ' from concat(s.first_name, ' ', s.last_name)) as name,
			s.address_line1, s.address_line2, s.city, s.state, s.postal_code, s.country
		from submissions s
		join users u on u.id = s.user_id
		where u.hackclub_id = ${hackclubId}
			and s.address_line1 is not null
			and btrim(s.address_line1) <> ''
		order by s.submitted_at desc
		limit 1
	`;
	const ship = prior[0] ? toShip(prior[0]) : null;
	if (!ship) return null;
	await sql`
		update users set
			address_line1 = ${ship.line1},
			address_line2 = ${ship.line2},
			city = ${ship.city},
			state = ${ship.state},
			postal_code = ${ship.postalCode},
			country = ${ship.country},
			updated_at = now()
		where hackclub_id = ${hackclubId} and (address_line1 is null or btrim(address_line1) = '')
	`;
	return ship;
}

/** Reserve hours and store the redemption. Throws ShopError when the buy is not allowed. */
export async function redeemShopItem(input: RedeemInput): Promise<{ id: string }> {
	const quote = quoteRedeem(input.sku, input.hours);
	if (!quote.ok) throw new ShopError(quote.message);
	let ship = input.ship;
	if (quote.item.kind === 'gear') {
		if (!ship?.line1) ship = await shippingAddressFor(input.hackclubId);
		if (!ship?.line1) throw new ShopError(shopCopy.missingAddress);
	}
	if (quote.item.kind === 'question' && !input.question) {
		throw new ShopError('Write the question you want asked on the episode.');
	}
	await submissionsDatabase();
	const sql = await ready();
	return sql.begin(async (tx) => {
		const users = await tx<{ id: string }[]>`
			select id::text as id from users where hackclub_id = ${input.hackclubId} for update
		`;
		const userId = users[0]?.id;
		if (!userId) throw new ShopError('Sign in again and then redeem.');
		const approved = await tx<{ total: string | null }[]>`
			select coalesce(sum(approved_seconds), 0)::text as total
			from submissions
			where user_id = ${userId}::uuid and status in ('approved', 'sent')
		`;
		const spent = await tx<{ total: string | null }[]>`
			select coalesce(sum(seconds), 0)::text as total
			from shop_redemptions
			where user_id = ${userId}::uuid and status <> 'rejected'
		`;
		const available = Number(approved[0]?.total ?? 0) - Number(spent[0]?.total ?? 0);
		if (!canAfford(available, quote.seconds)) throw new ShopError('You do not have enough approved hours for that.');
		const savedShip = quote.item.kind === 'gear' ? ship : null;
		const rows = await tx<{ id: string }[]>`
			insert into shop_redemptions (
				user_id, sku, title, kind, stackable, hours, seconds, grant_cents, grant_label,
				question, ship_name, address_line1, address_line2, city, state, postal_code, country
			) values (
				${userId}::uuid,
				${quote.item.sku},
				${quote.item.title},
				${quote.item.kind},
				${quote.item.kind === 'credit'},
				${quote.hours},
				${quote.seconds},
				${quote.grantCents},
				${quote.grantLabel},
				${quote.item.kind === 'question' ? input.question : null},
				${savedShip?.name ?? null},
				${savedShip?.line1 ?? null},
				${savedShip?.line2 ?? null},
				${savedShip?.city ?? null},
				${savedShip?.state ?? null},
				${savedShip?.postalCode ?? null},
				${savedShip?.country ?? null}
			)
			returning id::text as id
		`;
		const id = rows[0]?.id;
		if (!id) throw new ShopError('Could not save that redemption. Try again.');
		return { id };
	});
}

/** Redeem from a shop form. Gear uses the saved Hack Club address. Questions need text. */
export async function placeRedemption(hackclubId: string, form: FormData): Promise<void> {
	await redeemShopItem({
		hackclubId,
		sku: String(form.get('sku') ?? ''),
		hours: form.get('hours'),
		question: parseOnAirQuestion(form.get('question')),
		ship: null
	});
}

export async function spentSecondsFor(hackclubId: string): Promise<number> {
	const sql = await ready();
	const rows = await sql<{ total: string | null }[]>`
		select coalesce(sum(r.seconds), 0)::text as total
		from shop_redemptions r
		join users u on u.id = r.user_id
		where u.hackclub_id = ${hackclubId} and r.status <> 'rejected'
	`;
	return Number(rows[0]?.total ?? 0);
}

export type MemberRedemption = {
	id: string;
	title: string;
	hours: number;
	grantLabel: string;
	status: RedemptionStatus;
	stackable: boolean;
	createdAt: Date;
};

export async function redemptionsFor(hackclubId: string): Promise<MemberRedemption[]> {
	const sql = await ready();
	const rows = await sql<
		{
			id: string;
			title: string;
			hours: number;
			grant_label: string;
			status: RedemptionStatus;
			stackable: boolean;
			created_at: Date;
		}[]
	>`
		select r.id::text as id, r.title, r.hours, r.grant_label, r.status, r.stackable, r.created_at
		from shop_redemptions r
		join users u on u.id = r.user_id
		where u.hackclub_id = ${hackclubId}
		order by r.created_at desc
		limit 20
	`;
	return rows.map((row) => ({
		id: row.id,
		title: row.title,
		hours: row.hours,
		grantLabel: row.grant_label,
		status: row.status,
		stackable: row.stackable,
		createdAt: row.created_at
	}));
}

export type AdminRedemption = {
	id: string;
	name: string;
	email: string;
	sku: string;
	title: string;
	kind: string;
	stackable: boolean;
	hours: number;
	grantCents: number | null;
	grantLabel: string;
	status: RedemptionStatus;
	note: string | null;
	question: string | null;
	shipName: string | null;
	addressLine1: string | null;
	addressLine2: string | null;
	city: string | null;
	state: string | null;
	postalCode: string | null;
	country: string | null;
	createdAt: Date;
};

export async function listRedemptions(status: RedemptionStatus | null): Promise<AdminRedemption[]> {
	const sql = await ready();
	const rows = await sql<
		{
			id: string;
			display_name: string;
			email: string;
			sku: string;
			title: string;
			kind: string;
			stackable: boolean;
			hours: number;
			grant_cents: number | null;
			grant_label: string;
			status: RedemptionStatus;
			note: string | null;
			question: string | null;
			ship_name: string | null;
			address_line1: string | null;
			address_line2: string | null;
			city: string | null;
			state: string | null;
			postal_code: string | null;
			country: string | null;
			created_at: Date;
		}[]
	>`
		select r.id::text as id, u.display_name, u.email, r.sku, r.title, r.kind, r.stackable, r.hours,
			r.grant_cents, r.grant_label, r.status, r.note, r.question, r.ship_name, r.address_line1,
			r.address_line2, r.city, r.state, r.postal_code, r.country, r.created_at
		from shop_redemptions r
		join users u on u.id = r.user_id
		where ${status}::text is null or r.status = ${status}
		order by r.created_at desc
		limit 300
	`;
	return rows.map((row) => ({
		id: row.id,
		name: row.display_name,
		email: row.email,
		sku: row.sku,
		title: row.title,
		kind: row.kind,
		stackable: row.stackable,
		hours: row.hours,
		grantCents: row.grant_cents,
		grantLabel: row.grant_label,
		status: row.status,
		note: row.note,
		question: row.question,
		shipName: row.ship_name,
		addressLine1: row.address_line1,
		addressLine2: row.address_line2,
		city: row.city,
		state: row.state,
		postalCode: row.postal_code,
		country: row.country,
		createdAt: row.created_at
	}));
}

export type ShopTotals = {
	pending: number;
	approved: number;
	fulfilled: number;
	rejected: number;
	seconds: number;
	cents: number;
};

export async function shopTotals(): Promise<ShopTotals> {
	const sql = await ready();
	const rows = await sql<
		{ pending: number; approved: number; fulfilled: number; rejected: number; seconds: string; cents: string }[]
	>`
		select
			count(*) filter (where status = 'pending')::int as pending,
			count(*) filter (where status = 'approved')::int as approved,
			count(*) filter (where status = 'fulfilled')::int as fulfilled,
			count(*) filter (where status = 'rejected')::int as rejected,
			coalesce(sum(seconds) filter (where status <> 'rejected'), 0)::text as seconds,
			coalesce(sum(grant_cents) filter (where status <> 'rejected'), 0)::text as cents
		from shop_redemptions
	`;
	const row = rows[0];
	return {
		pending: row?.pending ?? 0,
		approved: row?.approved ?? 0,
		fulfilled: row?.fulfilled ?? 0,
		rejected: row?.rejected ?? 0,
		seconds: Number(row?.seconds ?? 0),
		cents: Number(row?.cents ?? 0)
	};
}

export async function updateRedemption(id: string, status: string, note: string | null): Promise<boolean> {
	if (!isRedemptionStatus(status)) return false;
	const sql = await ready();
	const rows = await sql`
		update shop_redemptions set
			status = ${status},
			note = ${note},
			updated_at = now(),
			decided_at = case when ${status} = 'pending' then null else coalesce(decided_at, now()) end
		where id = ${id}::uuid
		returning id
	`;
	return rows.length > 0;
}
