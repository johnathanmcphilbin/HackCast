import type postgres from 'postgres';
import { db } from './db.ts';
import type { PostalAddress } from './hca.ts';

/**
 * Signed-in people live in `users`, keyed by Hack Club Auth's subject
 * (`hackclub_id`). RSVPs stay in `rsvps`. Hackatime tokens live in
 * `hackatime_connections` and are never returned to a page load.
 * HackCast projects live in `hackcast_projects`: a name, plus the Hackatime
 * project it tracks once one is linked (null until then).
 */

export type UserWrite = {
	hackclubId: string;
	displayName: string;
	email: string;
	slackId: string | null;
	/** Set from Hack Club Auth. Omit it to leave a stored address alone. */
	address?: PostalAddress | null;
};

export type HackatimeConnectionWrite = {
	accessToken: string;
	refreshToken: string | null;
	expiresIn: number | null;
	scope: string | null;
	hackatimeUserId: string | null;
};

let schema: Promise<void> | null = null;

function client(): postgres.Sql {
	const sql = db();
	if (!sql) throw new Error('database');
	return sql;
}

async function ensure(sql: postgres.Sql): Promise<void> {
	if (!schema) {
		schema = (async () => {
			await sql`
				create table if not exists users (
					id uuid primary key default gen_random_uuid(),
					hackclub_id text not null unique,
					slack_id text,
					email text not null default '',
					display_name text not null default '',
					created_at timestamptz not null default now(),
					updated_at timestamptz not null default now()
				)
			`;
			// Staff roles are keyed by email so a reviewer can be added before they first sign in.
			await sql`
				create table if not exists staff_roles (
					email text primary key,
					role text not null check (role in ('admin', 'reviewer')),
					created_at timestamptz not null default now()
				)
			`;
			await sql`
				create table if not exists hackatime_connections (
					user_id uuid primary key references users (id) on delete cascade,
					hackatime_user_id text,
					access_token text not null,
					refresh_token text,
					expires_at timestamptz,
					scope text,
					connected_at timestamptz not null default now(),
					updated_at timestamptz not null default now()
				)
			`;
			await sql`
				create unique index if not exists hackatime_connections_hackatime_user_id_idx
				on hackatime_connections (hackatime_user_id)
				where hackatime_user_id is not null
			`;
			await sql`
				create table if not exists hackcast_projects (
					id uuid not null default gen_random_uuid(),
					user_id uuid not null references users (id) on delete cascade,
					name text not null,
					hackatime_project text,
					created_at timestamptz not null default now(),
					constraint hackcast_projects_id_pkey primary key (id),
					constraint hackcast_projects_name_length check (char_length(hackatime_project) between 1 and 200)
				)
			`;
			// Older tables keyed projects by (user_id, hackatime_project) with no separate name.
			await sql`alter table hackcast_projects add column if not exists id uuid not null default gen_random_uuid()`;
			await sql`alter table hackcast_projects add column if not exists name text`;
			await sql`update hackcast_projects set name = hackatime_project where name is null`;
			await sql`alter table hackcast_projects alter column name set not null`;
			await sql`alter table hackcast_projects drop constraint if exists hackcast_projects_pkey`;
			await sql`
				do $$ begin
					if not exists (select 1 from pg_constraint where conname = 'hackcast_projects_id_pkey') then
						alter table hackcast_projects add constraint hackcast_projects_id_pkey primary key (id);
					end if;
				end $$
			`;
			await sql`alter table hackcast_projects alter column hackatime_project drop not null`;
			await sql`
				create unique index if not exists hackcast_projects_user_hackatime_idx
				on hackcast_projects (user_id, hackatime_project)
				where hackatime_project is not null
			`;
			await sql`
				create unique index if not exists hackcast_projects_user_name_idx
				on hackcast_projects (user_id, name)
			`;
			// When the Hackatime project was linked, for the "projects connected" chart.
			await sql`alter table hackcast_projects add column if not exists linked_at timestamptz`;
			// Last hours read from Hackatime, for the dashboard and the hours race.
			await sql`alter table hackcast_projects add column if not exists hackatime_seconds integer`;
			await sql`alter table hackcast_projects add column if not exists hours_checked_at timestamptz`;
			await sql`
				update hackcast_projects set linked_at = created_at
				where hackatime_project is not null and linked_at is null
			`;
			// Mailing address copied from Hack Club Auth at sign-in. Shop reads this. It does not ask again.
			await sql`alter table users add column if not exists address_line1 text`;
			await sql`alter table users add column if not exists address_line2 text`;
			await sql`alter table users add column if not exists city text`;
			await sql`alter table users add column if not exists state text`;
			await sql`alter table users add column if not exists postal_code text`;
			await sql`alter table users add column if not exists country text`;
		})().catch((err) => {
			schema = null;
			throw err;
		});
	}
	await schema;
}

/** The pool with the users and projects tables in place, for modules that build on them. */
export async function database(): Promise<postgres.Sql> {
	const sql = client();
	await ensure(sql);
	return sql;
}

async function emailFromRsvp(sql: postgres.Sql, hackclubId: string): Promise<string> {
	try {
		const rows = await sql<{ email: string }[]>`
			select email from rsvps where sub = ${hackclubId} limit 1
		`;
		return rows[0]?.email ?? '';
	} catch {
		return '';
	}
}

export async function upsertUser(row: UserWrite): Promise<string> {
	const sql = client();
	await ensure(sql);
	const email = row.email.trim() || (await emailFromRsvp(sql, row.hackclubId));
	const address = row.address?.line1 ? row.address : null;
	const writeAddress = Boolean(address);
	const rows = await sql<{ id: string }[]>`
		insert into users (
			hackclub_id, slack_id, email, display_name,
			address_line1, address_line2, city, state, postal_code, country
		)
		values (
			${row.hackclubId}, ${row.slackId}, ${email}, ${row.displayName},
			${address?.line1 ?? null}, ${address?.line2 ?? null}, ${address?.city ?? null},
			${address?.state ?? null}, ${address?.postalCode ?? null}, ${address?.country ?? null}
		)
		on conflict (hackclub_id) do update set
			slack_id = coalesce(excluded.slack_id, users.slack_id),
			email = case when excluded.email <> '' then excluded.email else users.email end,
			display_name = case when excluded.display_name <> '' then excluded.display_name else users.display_name end,
			address_line1 = case when ${writeAddress} then excluded.address_line1 else users.address_line1 end,
			address_line2 = case when ${writeAddress} then excluded.address_line2 else users.address_line2 end,
			city = case when ${writeAddress} then excluded.city else users.city end,
			state = case when ${writeAddress} then excluded.state else users.state end,
			postal_code = case when ${writeAddress} then excluded.postal_code else users.postal_code end,
			country = case when ${writeAddress} then excluded.country else users.country end,
			updated_at = now()
		returning id::text as id
	`;
	const id = rows[0]?.id;
	if (!id) throw new Error('database');
	return id;
}

export async function hackatimeLinkedElsewhere(hackatimeUserId: string, hackclubId: string): Promise<boolean> {
	const sql = client();
	await ensure(sql);
	const rows = await sql<{ hackclub_id: string }[]>`
		select u.hackclub_id
		from hackatime_connections c
		join users u on u.id = c.user_id
		where c.hackatime_user_id = ${hackatimeUserId}
			and u.hackclub_id <> ${hackclubId}
		limit 1
	`;
	return rows.length > 0;
}

export async function saveHackatimeConnection(hackclubId: string, tokens: HackatimeConnectionWrite): Promise<void> {
	const sql = client();
	await ensure(sql);
	const expiresAt = tokens.expiresIn != null ? new Date(Date.now() + tokens.expiresIn * 1000) : null;
	const rows = await sql<{ user_id: string }[]>`
		insert into hackatime_connections (user_id, hackatime_user_id, access_token, refresh_token, expires_at, scope)
		select id, ${tokens.hackatimeUserId}, ${tokens.accessToken}, ${tokens.refreshToken}, ${expiresAt}, ${tokens.scope}
		from users
		where hackclub_id = ${hackclubId}
		on conflict (user_id) do update set
			hackatime_user_id = excluded.hackatime_user_id,
			access_token = excluded.access_token,
			refresh_token = excluded.refresh_token,
			expires_at = excluded.expires_at,
			scope = excluded.scope,
			updated_at = now()
		returning user_id::text as user_id
	`;
	if (!rows[0]) throw new Error('database');
}

export type HackcastProject = {
	id: string;
	name: string;
	/** The Hackatime project this tracks, or null until one is linked. */
	hackatimeProject: string | null;
	/** Hours last read from Hackatime, in seconds, and when. Null until first read. */
	hackatimeSeconds: number | null;
	hoursCheckedAt: Date | null;
};

export async function listHackcastProjects(hackclubId: string): Promise<HackcastProject[]> {
	const sql = client();
	await ensure(sql);
	const rows = await sql<
		{
			id: string;
			name: string;
			hackatime_project: string | null;
			hackatime_seconds: number | null;
			hours_checked_at: Date | null;
		}[]
	>`
		select p.id::text as id, p.name, p.hackatime_project, p.hackatime_seconds, p.hours_checked_at
		from hackcast_projects p
		join users u on u.id = p.user_id
		where u.hackclub_id = ${hackclubId}
		order by p.created_at asc
	`;
	return rows.map((row) => ({
		id: row.id,
		name: row.name,
		hackatimeProject: row.hackatime_project,
		hackatimeSeconds: row.hackatime_seconds,
		hoursCheckedAt: row.hours_checked_at
	}));
}

export async function userId(sql: postgres.Sql, hackclubId: string): Promise<string> {
	const users = await sql<{ id: string }[]>`
		select id::text as id from users where hackclub_id = ${hackclubId} limit 1
	`;
	const id = users[0]?.id;
	if (!id) throw new Error('database');
	return id;
}

/** Add a HackCast project. Pass the Hackatime project to track now, or null to link one later. */
export async function addHackcastProject(
	hackclubId: string,
	name: string,
	hackatimeProject: string | null
): Promise<void> {
	const sql = client();
	await ensure(sql);
	const id = await userId(sql, hackclubId);
	await sql`
		insert into hackcast_projects (user_id, name, hackatime_project, linked_at)
		values (${id}::uuid, ${name}, ${hackatimeProject}, ${hackatimeProject ? new Date() : null})
		on conflict do nothing
	`;
}

/** Link a Hackatime project to a HackCast project that doesn't have one yet. False if nothing changed. */
export async function linkHackatimeProject(
	hackclubId: string,
	projectId: string,
	hackatimeProject: string
): Promise<boolean> {
	const sql = client();
	await ensure(sql);
	const id = await userId(sql, hackclubId);
	const rows = await sql`
		update hackcast_projects
		set hackatime_project = ${hackatimeProject}, linked_at = now()
		where id = ${projectId}::uuid and user_id = ${id}::uuid and hackatime_project is null
		returning id
	`;
	return rows.length > 0;
}

export async function hackatimeStatus(hackclubId: string): Promise<{ connected: boolean; hackatimeUserId: string | null }> {
	const sql = client();
	await ensure(sql);
	const rows = await sql<{ hackatime_user_id: string | null }[]>`
		select c.hackatime_user_id
		from hackatime_connections c
		join users u on u.id = c.user_id
		where u.hackclub_id = ${hackclubId}
		limit 1
	`;
	const row = rows[0];
	if (!row) return { connected: false, hackatimeUserId: null };
	return { connected: true, hackatimeUserId: row.hackatime_user_id };
}

/** Server-only. Do not put the return value on a load result. */
export async function hackatimeAccessToken(hackclubId: string): Promise<string | null> {
	const sql = client();
	await ensure(sql);
	const rows = await sql<{ access_token: string }[]>`
		select c.access_token
		from hackatime_connections c
		join users u on u.id = c.user_id
		where u.hackclub_id = ${hackclubId}
		limit 1
	`;
	return rows[0]?.access_token ?? null;
}

export function isUniqueViolation(err: unknown, depth = 0): boolean {
	if (!err || typeof err !== 'object' || depth > 3) return false;
	if ('code' in err && (err as { code?: unknown }).code === '23505') return true;
	if ('cause' in err) return isUniqueViolation((err as { cause?: unknown }).cause, depth + 1);
	return false;
}

export type StaffRole = 'admin' | 'reviewer';

export type StaffMember = { email: string; displayName: string; role: StaffRole };

/** The person's email and any staff role given to it. */
export async function userAccess(hackclubId: string): Promise<{ email: string; role: StaffRole | null } | null> {
	const sql = client();
	await ensure(sql);
	const rows = await sql<{ email: string; role: StaffRole | null }[]>`
		select u.email, r.role
		from users u
		left join staff_roles r on r.email = lower(u.email)
		where u.hackclub_id = ${hackclubId}
		limit 1
	`;
	return rows[0] ?? null;
}

export async function listStaff(): Promise<StaffMember[]> {
	const sql = client();
	await ensure(sql);
	const rows = await sql<{ email: string; display_name: string | null; role: StaffRole }[]>`
		select r.email, max(u.display_name) as display_name, r.role
		from staff_roles r
		left join users u on lower(u.email) = r.email
		group by r.email, r.role
		order by r.role, r.email
	`;
	return rows.map((row) => ({ email: row.email, displayName: row.display_name ?? '', role: row.role }));
}

/** Give an email a staff role, or take it away with null. */
export async function setStaffRole(email: string, role: StaffRole | null): Promise<void> {
	const sql = client();
	await ensure(sql);
	const key = email.trim().toLowerCase();
	if (role) {
		await sql`
			insert into staff_roles (email, role) values (${key}, ${role})
			on conflict (email) do update set role = excluded.role
		`;
	} else {
		await sql`delete from staff_roles where email = ${key}`;
	}
}

/** Store the hours Hackatime reported for a project. */
export async function saveProjectSeconds(projectId: string, seconds: number): Promise<void> {
	const sql = client();
	await ensure(sql);
	await sql`
		update hackcast_projects
		set hackatime_seconds = ${Math.round(seconds)}, hours_checked_at = now()
		where id = ${projectId}::uuid
	`;
}

export type RaceEntry = { hackclubId: string; name: string; seconds: number };

/** Everyone with Hackatime hours on a linked HackCast project, most hours first. */
export async function hoursRace(): Promise<RaceEntry[]> {
	const sql = client();
	await ensure(sql);
	const rows = await sql<{ hackclub_id: string; display_name: string; seconds: string }[]>`
		select u.hackclub_id, u.display_name, sum(p.hackatime_seconds)::text as seconds
		from hackcast_projects p
		join users u on u.id = p.user_id
		where p.hackatime_project is not null and p.hackatime_seconds > 0
		group by u.hackclub_id, u.display_name
		order by sum(p.hackatime_seconds) desc, u.display_name
	`;
	return rows.map((row) => ({ hackclubId: row.hackclub_id, name: row.display_name, seconds: Number(row.seconds) }));
}
