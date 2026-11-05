import type postgres from 'postgres';
import type { GuestCategory, GuestVote } from './projects.ts';
import { submissionsDatabase } from './submissions.ts';
import { database, userId } from './users.ts';

export { cleanGuestRequest, type GuestCategory } from './projects.ts';

/**
 * Questions builders want the next guest to answer. The hours race leader gets a
 * guaranteed question; everyone else goes into a hat with one entry per approved
 * hour (at least one). `picked_how` records how a question was chosen.
 */

let schema: Promise<void> | null = null;

async function ready(): Promise<postgres.Sql> {
	const sql = await database();
	if (!schema) {
		schema = sql`
			create table if not exists questions (
				id uuid primary key default gen_random_uuid(),
				user_id uuid not null references users (id) on delete cascade,
				guest text not null,
				body text not null check (char_length(body) between 1 and 500),
				created_at timestamptz not null default now()
			)
		`
			.then(() => sql`alter table questions add column if not exists picked_how text`)
			.then(() => sql`alter table questions add column if not exists picked_at timestamptz`)
			.then(() => undefined)
			.catch((err) => {
				schema = null;
				throw err;
			});
	}
	await schema;
	return sql;
}

export function cleanQuestion(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const body = value.replace(/\s+/g, ' ').trim();
	return body && body.length <= 500 ? body : null;
}

export async function askQuestion(hackclubId: string, guest: string, body: string): Promise<void> {
	const sql = await ready();
	const id = await userId(sql, hackclubId);
	await sql`insert into questions (user_id, guest, body) values (${id}::uuid, ${guest}, ${body})`;
}

export async function questionsFrom(hackclubId: string, guest: string): Promise<{ id: string; body: string; createdAt: Date }[]> {
	const sql = await ready();
	const rows = await sql<{ id: string; body: string; created_at: Date }[]>`
		select q.id::text as id, q.body, q.created_at
		from questions q join users u on u.id = q.user_id
		where u.hackclub_id = ${hackclubId} and q.guest = ${guest}
		order by q.created_at desc
	`;
	return rows.map((row) => ({ id: row.id, body: row.body, createdAt: row.created_at }));
}

export type PoolQuestion = {
	id: string;
	body: string;
	askerId: string;
	asker: string;
	approvedSeconds: number;
	pickedHow: 'guaranteed' | 'drawn' | null;
	createdAt: Date;
};

/** Every question for a guest, with how many approved hours the asker has. */
export async function questionPool(guest: string): Promise<PoolQuestion[]> {
	const sql = await submissionsDatabase();
	await ready();
	const rows = await sql<
		{
			id: string;
			body: string;
			hackclub_id: string;
			display_name: string;
			approved: string | null;
			picked_how: 'guaranteed' | 'drawn' | null;
			created_at: Date;
		}[]
	>`
		select q.id::text as id, q.body, u.hackclub_id, u.display_name, q.picked_how, q.created_at,
			(select sum(s.approved_seconds) from submissions s
				where s.user_id = q.user_id and s.status in ('approved', 'sent'))::text as approved
		from questions q join users u on u.id = q.user_id
		where q.guest = ${guest}
		order by q.created_at asc
	`;
	return rows.map((row) => ({
		id: row.id,
		body: row.body,
		askerId: row.hackclub_id,
		asker: row.display_name,
		approvedSeconds: Number(row.approved ?? 0),
		pickedHow: row.picked_how,
		createdAt: row.created_at
	}));
}

export async function markPicked(questionId: string, how: 'guaranteed' | 'drawn'): Promise<void> {
	const sql = await ready();
	await sql`update questions set picked_how = ${how}, picked_at = now() where id = ${questionId}::uuid`;
}

export async function clearPicks(guest: string): Promise<void> {
	const sql = await ready();
	await sql`update questions set picked_how = null, picked_at = null where guest = ${guest}`;
}

/*
 * Guest votes: one per person, per category (Hack Club HQ or outside), per
 * episode. Voting again in a category changes the vote. `status` is the admin's
 * review of that name: new until shortlisted or dismissed.
 */
let requestSchema: Promise<void> | null = null;

async function requestsReady(): Promise<postgres.Sql> {
	const sql = await ready();
	if (!requestSchema) {
		requestSchema = sql`
			create table if not exists guest_requests (
				id uuid primary key default gen_random_uuid(),
				user_id uuid not null references users (id) on delete cascade,
				episode integer not null,
				category text not null check (category in ('hq', 'outside')),
				name text not null check (char_length(name) between 1 and 120),
				status text not null default 'new' check (status in ('new', 'shortlisted', 'dismissed')),
				created_at timestamptz not null default now(),
				unique (user_id, episode, category)
			)
		`
			.then(() => undefined)
			.catch((err) => {
				requestSchema = null;
				throw err;
			});
	}
	await requestSchema;
	return sql;
}

/** Cast or change this person's vote in one category for an episode. */
export async function voteGuest(hackclubId: string, episode: number, category: GuestCategory, name: string): Promise<void> {
	const sql = await requestsReady();
	const id = await userId(sql, hackclubId);
	await sql`
		insert into guest_requests (user_id, episode, category, name) values (${id}::uuid, ${episode}, ${category}, ${name})
		on conflict (user_id, episode, category) do update
			set name = excluded.name, status = 'new', created_at = now()
			where guest_requests.name <> excluded.name
	`;
}

/** This person's votes for an episode, keyed by category. */
export async function guestVotesFrom(hackclubId: string, episode: number): Promise<Partial<Record<GuestCategory, string>>> {
	const sql = await requestsReady();
	const rows = await sql<{ category: GuestCategory; name: string }[]>`
		select g.category, g.name
		from guest_requests g join users u on u.id = g.user_id
		where u.hackclub_id = ${hackclubId} and g.episode = ${episode}
	`;
	return Object.fromEntries(rows.map((row) => [row.category, row.name]));
}

export type GuestStatus = 'new' | 'shortlisted' | 'dismissed';

/** Every vote for an episode as typed, for matching into one tally per guest. */
export async function guestVotes(episode: number): Promise<GuestVote[]> {
	const sql = await requestsReady();
	return sql<GuestVote[]>`
		select g.id::text as id, g.category, g.name, u.display_name as voter, g.status, g.created_at as at
		from guest_requests g join users u on u.id = g.user_id
		where g.episode = ${episode}
		order by g.created_at desc
	`;
}

/** Set the status on every request matched into one guest. */
export async function setGuestStatus(ids: string[], status: GuestStatus): Promise<void> {
	if (ids.length === 0) return;
	const sql = await requestsReady();
	await sql`update guest_requests set status = ${status} where id in ${sql(ids)}`;
}
