import { randomInt } from 'node:crypto';
import postgres from 'postgres';
import { parseQuestion, pickIndex } from '../question.ts';

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

export type QuestionPick = {
	sub: string;
	name: string;
	email: string;
	question: string;
	pickedAt: Date;
};

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

type PickRaw = {
	sub: string;
	name: string;
	email: string;
	question: string;
	picked_at: Date;
};

function mapRow(row: Raw): RsvpRow {
	return {
		sub: row.sub,
		name: row.name,
		email: row.email ?? '',
		slackId: row.slack_id,
		verificationStatus: row.verification_status,
		yswsEligible: row.ysws_eligible,
		question: row.question,
		createdAt: row.created_at
	};
}

function mapPick(row: PickRaw): QuestionPick {
	return {
		sub: row.sub,
		name: row.name,
		email: row.email,
		question: row.question,
		pickedAt: row.picked_at
	};
}

/**
 * Idempotent schema for a fresh or already-populated database.
 * `create table if not exists` does not add columns to an older `rsvps` table,
 * so each column is also added with `if not exists`. Rows already stored are left as they are.
 * Safe to run on every boot and safe to run twice.
 */
export async function applySchema(sql: postgres.Sql): Promise<void> {
	await sql.begin(async (tx) => {
		await tx`
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
		`;
		await tx`alter table rsvps add column if not exists name text not null default ''`;
		await tx`alter table rsvps add column if not exists email text not null default ''`;
		await tx`alter table rsvps add column if not exists slack_id text`;
		await tx`alter table rsvps add column if not exists verification_status text`;
		await tx`alter table rsvps add column if not exists ysws_eligible boolean`;
		await tx`alter table rsvps add column if not exists question text`;
		await tx`alter table rsvps add column if not exists created_at timestamptz not null default now()`;
		await tx`alter table rsvps add column if not exists updated_at timestamptz not null default now()`;
		await tx`
			create table if not exists question_pick (
				id integer primary key check (id = 1),
				sub text not null,
				name text not null,
				email text not null,
				question text not null,
				picked_at timestamptz not null default now()
			)
		`;
	});
}

export async function upsertRsvpRow(sql: postgres.Sql, row: RsvpWrite): Promise<void> {
	await sql`
		insert into rsvps (sub, name, email, slack_id, verification_status, ysws_eligible)
		values (${row.sub}, ${row.name}, ${row.email}, ${row.slackId}, ${row.verificationStatus}, ${row.yswsEligible})
		on conflict (sub) do update set
			name = excluded.name,
			email = case when excluded.email <> '' then excluded.email else rsvps.email end,
			slack_id = excluded.slack_id,
			verification_status = excluded.verification_status,
			ysws_eligible = excluded.ysws_eligible,
			updated_at = now()
	`;
}

export async function setQuestionRow(sql: postgres.Sql, sub: string, question: string): Promise<boolean> {
	const parsed = parseQuestion(question);
	if (!parsed.ok) throw new Error(parsed.error);
	const rows = await sql<{ sub: string }[]>`
		update rsvps set question = ${parsed.question}, updated_at = now()
		where sub = ${sub}
		returning sub
	`;
	return rows.length > 0;
}

export async function readRsvp(sql: postgres.Sql, sub: string): Promise<RsvpRow | null> {
	const rows = await sql<Raw[]>`
		select sub, name, email, slack_id, verification_status, ysws_eligible, question, created_at
		from rsvps where sub = ${sub} limit 1
	`;
	return rows[0] ? mapRow(rows[0]) : null;
}

export async function listRsvpRows(sql: postgres.Sql): Promise<RsvpRow[]> {
	const rows = await sql<Raw[]>`
		select sub, name, email, slack_id, verification_status, ysws_eligible, question, created_at
		from rsvps order by created_at asc, sub asc
	`;
	return rows.map(mapRow);
}

export async function countRsvpRows(sql: postgres.Sql): Promise<number> {
	const rows = await sql<{ count: number }[]>`select count(*)::int as count from rsvps`;
	return Number(rows[0]?.count ?? 0);
}

export async function readQuestionPick(sql: postgres.Sql): Promise<QuestionPick | null> {
	const rows = await sql<PickRaw[]>`
		select sub, name, email, question, picked_at
		from question_pick where id = 1
	`;
	return rows[0] ? mapPick(rows[0]) : null;
}

/** Picks uniformly from rows that have a question. A miss (nobody has one) leaves any saved draw in place. */
export async function drawQuestionRow(
	sql: postgres.Sql,
	nextInt: (max: number) => number = randomInt
): Promise<QuestionPick | null> {
	const eligible = await sql<{ sub: string; name: string; email: string; question: string }[]>`
		select sub, name, email, question
		from rsvps
		where question is not null and btrim(question) <> ''
		order by created_at asc, sub asc
	`;
	if (eligible.length === 0) return null;
	const row = eligible[pickIndex(eligible.length, nextInt)];
	const saved = await sql<PickRaw[]>`
		insert into question_pick (id, sub, name, email, question, picked_at)
		values (1, ${row.sub}, ${row.name}, ${row.email}, ${row.question}, now())
		on conflict (id) do update set
			sub = excluded.sub,
			name = excluded.name,
			email = excluded.email,
			question = excluded.question,
			picked_at = now()
		returning sub, name, email, question, picked_at
	`;
	return mapPick(saved[0]);
}
