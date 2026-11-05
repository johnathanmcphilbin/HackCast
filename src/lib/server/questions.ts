import type postgres from 'postgres';
import { database, userId } from './users.ts';

/** Questions builders want the next guest to answer. Most hours wins a guaranteed one. */

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

export type PoolQuestion = { body: string; asker: string; askerSeconds: number; createdAt: Date };

/** Every question for a guest, with the asker's Hackatime hours on their HackCast projects. */
export async function questionPool(guest: string): Promise<PoolQuestion[]> {
	const sql = await ready();
	const rows = await sql<{ body: string; display_name: string; seconds: string | null; created_at: Date }[]>`
		select q.body, u.display_name, q.created_at,
			(select sum(p.hackatime_seconds) from hackcast_projects p
				where p.user_id = q.user_id and p.hackatime_project is not null)::text as seconds
		from questions q join users u on u.id = q.user_id
		where q.guest = ${guest}
		order by seconds desc nulls last, q.created_at asc
	`;
	return rows.map((row) => ({
		body: row.body,
		asker: row.display_name,
		askerSeconds: Number(row.seconds ?? 0),
		createdAt: row.created_at
	}));
}
