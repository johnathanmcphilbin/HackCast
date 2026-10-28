import postgres from 'postgres';
import { databaseUrl } from './config.ts';

export type RsvpRow = {
	sub: string;
	name: string;
	email: string;
	slackId: string | null;
	verificationStatus: string | null;
	yswsEligible: boolean | null;
	question: string | null;
	createdAt: Date;
};

export type RsvpWrite = {
	sub: string;
	name: string;
	email: string;
	slackId: string | null;
	verificationStatus: string | null;
	yswsEligible: boolean | null;
};

let sql: postgres.Sql | null = null;
let schema: Promise<void> | null = null;
let countCache: { at: number; count: number } | null = null;
const COUNT_TTL_MS = 30_000;

function db(): postgres.Sql | null {
	const url = databaseUrl();
	if (!url) return null;
	if (!sql) sql = postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 10 });
	return sql;
}

async function ensure(client: postgres.Sql): Promise<void> {
	if (!schema) {
		schema = client`
			create table if not exists rsvps (
				sub text primary key,
				name text not null default '',
				email text not null default '',
				slack_id text,
				verification_status text,
				ysws_eligible boolean,
				question text,
				created_at timestamptz not null default now(),
				updated_at timestamptz not null default now()
			)
		`
			.then(() => undefined)
			.catch((err) => {
				schema = null;
				throw err;
			});
	}
	await schema;
}

type Raw = {
	sub: string;
	name: string;
	email: string;
	slack_id: string | null;
	verification_status: string | null;
	ysws_eligible: boolean | null;
	question: string | null;
	created_at: Date;
};

function mapRow(row: Raw): RsvpRow {
	return {
		sub: row.sub,
		name: row.name,
		email: row.email,
		slackId: row.slack_id,
		verificationStatus: row.verification_status,
		yswsEligible: row.ysws_eligible,
		question: row.question,
		createdAt: row.created_at
	};
}

export async function upsertRsvp(row: RsvpWrite): Promise<void> {
	const client = db();
	if (!client) throw new Error('database');
	await ensure(client);
	await client`
		insert into rsvps (sub, name, email, slack_id, verification_status, ysws_eligible)
		values (${row.sub}, ${row.name}, ${row.email}, ${row.slackId}, ${row.verificationStatus}, ${row.yswsEligible})
		on conflict (sub) do update set
			name = excluded.name,
			email = excluded.email,
			slack_id = excluded.slack_id,
			verification_status = excluded.verification_status,
			ysws_eligible = excluded.ysws_eligible,
			updated_at = now()
	`;
	countCache = null;
}

export async function setRsvpQuestion(sub: string, question: string | null): Promise<void> {
	const client = db();
	if (!client) throw new Error('database');
	await ensure(client);
	await client`update rsvps set question = ${question}, updated_at = now() where sub = ${sub}`;
}

export async function getRsvp(sub: string): Promise<RsvpRow | null> {
	const client = db();
	if (!client) return null;
	await ensure(client);
	const rows = await client<Raw[]>`
		select sub, name, email, slack_id, verification_status, ysws_eligible, question, created_at
		from rsvps where sub = ${sub} limit 1
	`;
	return rows[0] ? mapRow(rows[0]) : null;
}

export async function listRsvps(): Promise<RsvpRow[]> {
	const client = db();
	if (!client) throw new Error('database');
	await ensure(client);
	const rows = await client<Raw[]>`
		select sub, name, email, slack_id, verification_status, ysws_eligible, question, created_at
		from rsvps order by created_at asc
	`;
	return rows.map(mapRow);
}

/** Raw count, or null when Postgres is unset or unreachable. Cached for 30s. */
export async function rsvpCount(): Promise<number | null> {
	if (countCache && Date.now() - countCache.at < COUNT_TTL_MS) return countCache.count;
	const client = db();
	if (!client) return null;
	try {
		await ensure(client);
		const rows = await client<{ count: number }[]>`select count(*)::int as count from rsvps`;
		const count = Number(rows[0]?.count ?? 0);
		if (!Number.isFinite(count)) return null;
		countCache = { at: Date.now(), count };
		return count;
	} catch {
		console.error('rsvp count failed');
		return null;
	}
}
