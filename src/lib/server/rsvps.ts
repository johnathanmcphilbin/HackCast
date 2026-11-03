import postgres from 'postgres';
import { databaseUrl } from './config.ts';
import {
	applySchema,
	countRsvpRows,
	drawQuestionRow,
	listRsvpRows,
	readQuestionPick,
	readRsvp,
	setQuestionRow,
	upsertRsvpRow,
	type QuestionPick,
	type RsvpRow,
	type RsvpWrite
} from './rsvp-db.ts';

export type { QuestionPick, RsvpRow, RsvpWrite };

let sql: postgres.Sql | null = null;
let schema: Promise<void> | null = null;
let countCache: { at: number; count: number } | null = null;
const COUNT_TTL_MS = 30_000;

function db(): postgres.Sql | null {
	const url = databaseUrl();
	if (!url) return null;
	if (!sql) {
		sql = postgres(url, {
			max: 5,
			idle_timeout: 20,
			connect_timeout: 10,
			onnotice: () => undefined
		});
	}
	return sql;
}

async function ensure(client: postgres.Sql): Promise<void> {
	if (!schema) {
		schema = applySchema(client).catch((err) => {
			schema = null;
			throw err;
		});
	}
	await schema;
}

export async function upsertRsvp(row: RsvpWrite): Promise<void> {
	const client = db();
	if (!client) throw new Error('database');
	await ensure(client);
	await upsertRsvpRow(client, row);
	countCache = null;
}

export async function setRsvpQuestion(sub: string, question: string): Promise<boolean> {
	const client = db();
	if (!client) throw new Error('database');
	await ensure(client);
	return setQuestionRow(client, sub, question);
}

export async function getRsvp(sub: string): Promise<RsvpRow | null> {
	const client = db();
	if (!client) return null;
	await ensure(client);
	return readRsvp(client, sub);
}

export async function listRsvps(): Promise<RsvpRow[]> {
	const client = db();
	if (!client) throw new Error('database');
	await ensure(client);
	return listRsvpRows(client);
}

export async function getQuestionPick(): Promise<QuestionPick | null> {
	const client = db();
	if (!client) return null;
	await ensure(client);
	return readQuestionPick(client);
}

export async function drawQuestion(): Promise<QuestionPick | null> {
	const client = db();
	if (!client) throw new Error('database');
	await ensure(client);
	return drawQuestionRow(client);
}

/** Raw count, or null when Postgres is unset or unreachable. Cached for 30s. */
export async function rsvpCount(): Promise<number | null> {
	if (countCache && Date.now() - countCache.at < COUNT_TTL_MS) return countCache.count;
	const client = db();
	if (!client) return null;
	try {
		await ensure(client);
		const count = await countRsvpRows(client);
		if (!Number.isFinite(count)) return null;
		countCache = { at: Date.now(), count };
		return count;
	} catch {
		console.error('rsvp count failed');
		return null;
	}
}
