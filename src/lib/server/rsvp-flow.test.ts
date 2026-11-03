import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { describe, it } from 'node:test';
import { QUESTION_MAX } from '../question.ts';
import {
	applySchema,
	countRsvpRows,
	drawQuestionRow,
	readQuestionPick,
	readRsvp,
	setQuestionRow,
	upsertRsvpRow
} from './rsvp-db.ts';
import { readTxn } from './session.ts';

/**
 * End-to-end RSVP flow against a real Postgres database.
 *
 * Hack Club Auth is not called. The spawned server is started with
 * `hca-mock-preload.mjs`, which answers only the token and JWKS requests.
 * `/auth/login` and `/auth/callback` are the real routes: the test keeps the
 * PKCE cookie, and the callback checks state and nonce itself.
 *
 * Set RSVP_TEST_DATABASE_URL to run this. The default is a local throwaway
 * database (role `hackcast`, password `hackcast`) and is not an app secret.
 */
const databaseUrl =
	process.env.RSVP_TEST_DATABASE_URL ?? 'postgres://hackcast:hackcast@127.0.0.1:5432/hackcast_rsvp_test';
const port = 4189;
const sessionSecret = 'test-session-secret-e2e';
const root = fileURLToPath(new URL('../../../', import.meta.url));

const probe = postgres(databaseUrl, { max: 1, connect_timeout: 3 });
let reachable = false;
try {
	await probe`select 1 as ok`;
	reachable = true;
} catch {
	reachable = false;
} finally {
	await probe.end({ timeout: 1 }).catch(() => undefined);
}

describe('postgres rsvp flow', {
	skip: reachable ? false : 'Postgres test database is not reachable; set RSVP_TEST_DATABASE_URL to run this'
}, () => {
	it('signs up, saves a question, and lets an admin draw one', { timeout: 120_000 }, async () => {
		assert.ok(existsSync(new URL('../../../build/index.js', import.meta.url)), 'run npm run build before this test');
		const sql = postgres(databaseUrl, { max: 1, onnotice: () => undefined });
		let child: ChildProcess | null = null;
		const logs: string[] = [];
		try {
			await sql`drop table if exists question_pick`;
			await sql`drop table if exists rsvps`;
			await sql`
				create table rsvps (
					sub text primary key,
					name text not null default ''
				)
			`;
			await sql`insert into rsvps (sub, name) values ('legacy!one', 'Legacy')`;
			await applySchema(sql);
			await applySchema(sql);
			const legacy = await readRsvp(sql, 'legacy!one');
			assert.equal(legacy?.name, 'Legacy', 'migration keeps an existing row');
			assert.equal(legacy?.email, '', 'migration adds email without inventing one');
			assert.equal(legacy?.question, null, 'migration adds a null question');
			assert.equal(await countRsvpRows(sql), 1, 'migration does not duplicate rows');

			await upsertRsvpRow(sql, {
				sub: 'legacy!one',
				name: 'Legacy',
				email: 'legacy@hackclub.com',
				slackId: null,
				verificationStatus: null,
				yswsEligible: true
			});
			assert.equal(await setQuestionRow(sql, 'legacy!one', '  a question from before  '), true);
			await applySchema(sql);
			await applySchema(sql);
			const kept = await readRsvp(sql, 'legacy!one');
			assert.equal(kept?.email, 'legacy@hackclub.com', 'a second migration keeps the stored email');
			assert.equal(kept?.question, 'a question from before', 'a second migration keeps the stored question');
			await assert.rejects(() => setQuestionRow(sql, 'legacy!one', '   '), /write a question first/);
			await assert.rejects(() => setQuestionRow(sql, 'legacy!one', 'x'.repeat(QUESTION_MAX + 1)), /keep it under/);
			assert.equal((await readRsvp(sql, 'legacy!one'))?.question, 'a question from before', 'rejected questions are not stored');

			await upsertRsvpRow(sql, {
				sub: 'legacy!one',
				name: 'Legacy',
				email: '',
				slackId: null,
				verificationStatus: null,
				yswsEligible: true
			});
			assert.equal((await readRsvp(sql, 'legacy!one'))?.email, 'legacy@hackclub.com', 'a blank login email does not wipe a stored one');
			await upsertRsvpRow(sql, {
				sub: 'legacy!one',
				name: 'Legacy',
				email: 'legacy2@hackclub.com',
				slackId: null,
				verificationStatus: null,
				yswsEligible: null
			});
			assert.equal((await readRsvp(sql, 'legacy!one'))?.email, 'legacy2@hackclub.com', 'a new email replaces the stored one');

			await sql`delete from question_pick`;
			await sql`delete from rsvps`;
			const nobody = await drawQuestionRow(sql);
			assert.equal(nobody, null, 'a draw with zero questions does nothing');
			assert.equal(await readQuestionPick(sql), null);

			await upsertRsvpRow(sql, person('a', 'A', 'a@hackclub.com'));
			await upsertRsvpRow(sql, person('b', 'B', 'b@hackclub.com'));
			assert.equal(await drawQuestionRow(sql), null, 'rows with no question are not a draw');
			assert.equal(await setQuestionRow(sql, 'a', 'only one'), true);
			await sql`update rsvps set created_at = timestamptz '2020-01-01' where sub = 'a'`;
			await sql`update rsvps set created_at = timestamptz '2020-01-02' where sub = 'b'`;
			for (let i = 0; i < 5; i++) {
				const pick = await drawQuestionRow(sql);
				assert.equal(pick?.sub, 'a', 'one submitted question is the only draw');
				assert.equal(pick?.question, 'only one');
			}
			assert.equal(await countPicks(sql), 1, 're-drawing overwrites the single saved pick');
			const savedPick = await readQuestionPick(sql);
			await sql`update rsvps set question = '   ' where sub = 'a'`;
			assert.equal(await drawQuestionRow(sql), null, 'a blank question is not drawn');
			const still = await readQuestionPick(sql);
			assert.equal(still?.question, savedPick?.question, 'a failed draw keeps the saved pick');
			assert.equal(still?.pickedAt.getTime(), savedPick?.pickedAt.getTime());

			await setQuestionRow(sql, 'a', 'alpha');
			await upsertRsvpRow(sql, person('c', 'C', 'c@hackclub.com'));
			await setQuestionRow(sql, 'c', 'gamma');
			await sql`update rsvps set created_at = timestamptz '2020-01-01' where sub = 'a'`;
			await sql`update rsvps set created_at = timestamptz '2020-01-03' where sub = 'c'`;
			await sql`update rsvps set question = null where sub = 'b'`;
			assert.equal((await drawQuestionRow(sql, () => 0))?.sub, 'a');
			assert.equal((await drawQuestionRow(sql, () => 1))?.question, 'gamma');
			assert.equal((await drawQuestionRow(sql, () => 1))?.email, 'c@hackclub.com');
			for (let i = 0; i < 12; i++) {
				const pick = await drawQuestionRow(sql);
				assert.ok(pick?.sub === 'a' || pick?.sub === 'c', 'a draw only comes from submitted questions');
			}

			await sql`delete from question_pick`;
			await sql`delete from rsvps`;

			child = spawn(process.execPath, ['--import', fileURLToPath(new URL('../../../test/hca-mock-preload.mjs', import.meta.url)), 'build/index.js'], {
				cwd: root,
				env: {
					...process.env,
					PORT: String(port),
					HOST: '127.0.0.1',
					HCA_MOCK: '1',
					HCA_CLIENT_ID: 'test-client',
					HCA_CLIENT_SECRET: 'test-secret',
					SESSION_SECRET: sessionSecret,
					DATABASE_URL: databaseUrl,
					PUBLIC_BASE_URL: `http://127.0.0.1:${port}`,
					ADMIN_SLACK_IDS: 'UADMIN'
				},
				stdio: ['ignore', 'pipe', 'pipe']
			});
			child.stdout?.on('data', (chunk) => logs.push(chunk.toString()));
			child.stderr?.on('data', (chunk) => logs.push(chunk.toString()));
			const base = `http://127.0.0.1:${port}`;
			await waitForServer(base, () => logs.join(''));

			const ada = await signIn(base, 'member');
			const adaRow = await readRsvp(sql, 'ident!ada');
			assert.equal(adaRow?.email, 'ada@hackclub.com', 'a new sign-up stores the email');
			assert.equal(adaRow?.name, 'Ada');
			assert.equal(await countRsvpRows(sql), 1);

			const quiet = await signIn(base, 'quiet');
			const sam = await signIn(base, 'admin');
			assert.equal((await readRsvp(sql, 'ident!quiet'))?.email, 'quiet@hackclub.com');
			assert.equal((await readRsvp(sql, 'ident!sam'))?.email, 'sam@hackclub.com');
			assert.equal(await countRsvpRows(sql), 3, 'three sign-ups are three rows');

			const loggedOut = await fetch(`${base}/admin/rsvps`, { redirect: 'manual' });
			assert.equal(loggedOut.status, 303, 'a logged-out visitor is sent away from the admin page');
			assert.match(loggedOut.headers.get('location') ?? '', /\/auth\/login\?next=\/admin\/rsvps/);

			const blocked = await fetch(`${base}/admin/rsvps`, { headers: { cookie: ada.cookie }, redirect: 'manual' });
			assert.equal(blocked.status, 404, 'a signed-in non-admin is blocked from the admin page');
			const blockedCsv = await fetch(`${base}/admin/rsvps.csv`, { headers: { cookie: ada.cookie }, redirect: 'manual' });
			assert.equal(blockedCsv.status, 404, 'a non-admin cannot download the csv');
			const blockedDraw = await postAction(base, '/admin/rsvps?/pick', ada.cookie, {});
			assert.equal(blockedDraw.status, 404, 'a non-admin cannot draw');

			const emptyDraw = await postAction(base, '/admin/rsvps?/pick', sam.cookie, {});
			assert.equal(emptyDraw.status, 400, 'drawing with zero questions is rejected');
			assert.match(emptyDraw.text, /no questions in the hat yet/);
			assert.equal(await readQuestionPick(sql), null);

			const first = await postAction(base, '/join?/question', ada.cookie, { question: '  how did you get your first club started?  ' });
			assert.equal(first.status, 200, `submitting a question failed\n${first.text.slice(0, 500)}\n${logs.join('').slice(-1500)}`);
			assert.match(first.text, /it goes in a hat/);
			assert.match(first.text, /max and zach/);
			assert.match(first.text, /saved\. you can change it whenever/);
			assert.equal((await readRsvp(sql, 'ident!ada'))?.question, 'how did you get your first club started?');

			const again = await signIn(base, 'member-again');
			assert.equal(await countRsvpRows(sql), 3, 'a repeat sign-in does not add a row');
			const repeated = await readRsvp(sql, 'ident!ada');
			assert.equal(repeated?.email, 'ada@hackclub.com', 'a repeat sign-in keeps the email');
			assert.equal(repeated?.name, 'Ada Lovelace', 'a repeat sign-in updates the same row');
			assert.equal(repeated?.question, 'how did you get your first club started?', 'a repeat sign-in keeps the question');

			const edited = await postAction(base, '/join?/question', again.cookie, { question: 'how did you meet?' });
			assert.equal(edited.status, 200);
			assert.equal((await readRsvp(sql, 'ident!ada'))?.question, 'how did you meet?', 'editing a question replaces the text');

			const replaced = await postAction(base, '/join?/question', again.cookie, { question: 'what should we ship first?' });
			assert.equal(replaced.status, 200);
			assert.equal((await readRsvp(sql, 'ident!ada'))?.question, 'what should we ship first?', 'replacing a question stores the new one');

			const empty = await postAction(base, '/join?/question', again.cookie, { question: '   ' });
			assert.equal(empty.status, 400, 'an empty question is rejected');
			assert.match(empty.text, /write a question first/);
			assert.equal((await readRsvp(sql, 'ident!ada'))?.question, 'what should we ship first?');

			const tooLong = await postAction(base, '/join?/question', again.cookie, { question: 'q'.repeat(QUESTION_MAX + 1) });
			assert.equal(tooLong.status, 400, 'an over-long question is rejected');
			assert.match(tooLong.text, /keep it under 280 characters/);
			assert.equal((await readRsvp(sql, 'ident!ada'))?.question, 'what should we ship first?');

			const onlyAda = await postAction(base, '/admin/rsvps?/pick', sam.cookie, {});
			assert.equal(onlyAda.status, 200, `draw failed\n${onlyAda.text.slice(0, 400)}`);
			assert.match(onlyAda.text, /what should we ship first/);
			assert.match(onlyAda.text, /Ada Lovelace/);
			assert.equal((await readQuestionPick(sql))?.sub, 'ident!ada', 'with one question, the draw is that question');
			const quietPage = await fetch(`${base}/admin/rsvps`, { headers: { cookie: quiet.cookie } });
			assert.equal(quietPage.status, 404);

			await postAction(base, '/join?/question', sam.cookie, { question: 'what do you wish you had built at 16?' });
			const seen = new Set<string>();
			for (let i = 0; i < 16; i++) {
				const draw = await postAction(base, '/admin/rsvps?/pick', sam.cookie, {});
				assert.equal(draw.status, 200);
				const pick = await readQuestionPick(sql);
				assert.ok(pick?.sub === 'ident!ada' || pick?.sub === 'ident!sam', 'the http draw skips people with no question');
				assert.notEqual(pick?.sub, 'ident!quiet');
				seen.add(pick?.sub ?? '');
			}
			assert.equal(seen.size, 2, 'both submitted questions can be drawn');
			assert.equal(await countPicks(sql), 1);

			const pick = await readQuestionPick(sql);
			const adminPage = await fetch(`${base}/admin/rsvps`, { headers: { cookie: sam.cookie } });
			assert.equal(adminPage.status, 200);
			const adminHtml = await adminPage.text();
			assert.match(adminHtml, /3 on the list/);
			assert.match(adminHtml, /2 in the hat/);
			assert.match(adminHtml, /ada@hackclub\.com/);
			assert.match(adminHtml, /sam@hackclub\.com/);
			assert.match(adminHtml, /quiet@hackclub\.com/);
			assert.match(adminHtml, /what should we ship first\?/);
			assert.match(adminHtml, /what do you wish you had built at 16\?/);
			assert.match(adminHtml, /\d{4}-\d{2}-\d{2}/);
			assert.match(adminHtml, new RegExp(escapeRegExp(pick?.question ?? 'missing-pick')));
			assert.match(adminHtml, /download csv/);

			const refreshed = await fetch(`${base}/admin/rsvps`, { headers: { cookie: sam.cookie } });
			const refreshedHtml = await refreshed.text();
			assert.match(refreshedHtml, new RegExp(escapeRegExp(pick?.question ?? '')), 'the draw is still on the page after a refresh');
			assert.equal((await readQuestionPick(sql))?.question, pick?.question);

			const csvResponse = await fetch(`${base}/admin/rsvps.csv`, { headers: { cookie: sam.cookie } });
			assert.equal(csvResponse.status, 200);
			assert.match(csvResponse.headers.get('content-type') ?? '', /text\/csv/);
			const csv = await csvResponse.text();
			assert.match(csv, /name,email/);
			assert.match(csv, /question/);
			assert.match(csv, /ada@hackclub\.com/);
			assert.match(csv, /what should we ship first\?/);
			assert.match(csv, /quiet@hackclub\.com/);

			const countResponse = await fetch(`${base}/api/rsvps/count`);
			assert.equal((await countResponse.json()).count, 3);

			await applySchema(sql);
			await applySchema(sql);
			assert.equal(await countRsvpRows(sql), 3, 'migrating again keeps the signed-up rows');
			assert.equal((await readRsvp(sql, 'ident!ada'))?.email, 'ada@hackclub.com');
			assert.equal((await readRsvp(sql, 'ident!ada'))?.question, 'what should we ship first?');
			assert.equal((await readQuestionPick(sql))?.question, pick?.question, 'migrating again keeps the saved draw');

			console.log('PASS migration runs safely twice on a populated database');
			console.log('PASS new sign-up stores the email');
			console.log('PASS repeat sign-in does not duplicate the row');
			console.log('PASS submit, edit, and replace a question');
			console.log('PASS validation rejects empty and over-long questions');
			console.log('PASS non-admins are blocked');
			console.log('PASS admin list, count, and csv');
			console.log('PASS random draw uses only submitted questions, including 0 and 1');
			console.log('PASS the draw survives a refresh');
		} catch (err) {
			const tail = logs.join('').slice(-2000);
			if (tail) console.error(tail);
			throw err;
		} finally {
			if (child) {
				child.kill('SIGKILL');
				await once(child, 'exit').catch(() => undefined);
			}
			await sql.end({ timeout: 5 });
		}
	});
});

function person(sub: string, name: string, email: string) {
	return {
		sub,
		name,
		email,
		slackId: null,
		verificationStatus: 'verified' as string | null,
		yswsEligible: true as boolean | null
	};
}

async function countPicks(sql: postgres.Sql): Promise<number> {
	const rows = await sql<{ count: number }[]>`select count(*)::int as count from question_pick`;
	return Number(rows[0]?.count ?? 0);
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function waitForServer(base: string, logs: () => string): Promise<void> {
	for (let i = 0; i < 50; i++) {
		try {
			const response = await fetch(`${base}/api/rsvps/count`);
			if (response.ok) return;
		} catch {
			// server still booting
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	throw new Error(`server did not start\n${logs()}`);
}

function cookieJar(response: Response): Map<string, string> {
	const jar = new Map<string, string>();
	for (const line of response.headers.getSetCookie()) {
		const pair = line.split(';')[0] ?? '';
		const split = pair.indexOf('=');
		if (split <= 0) continue;
		const name = pair.slice(0, split).trim();
		const value = pair.slice(split + 1);
		if (!value) jar.delete(name);
		else jar.set(name, value);
	}
	return jar;
}

async function signIn(base: string, who: string): Promise<{ cookie: string }> {
	const login = await fetch(`${base}/auth/login`, { redirect: 'manual' });
	assert.equal(login.status, 302, `login did not start for ${who}`);
	const txn = cookieJar(login).get('hackcast_hca');
	assert.ok(txn, 'login did not set the PKCE cookie');
	const decoded = decodeURIComponent(txn);
	const payload = readTxn(decoded, sessionSecret);
	assert.ok(payload, 'PKCE cookie did not verify');
	const callback = await fetch(
		`${base}/auth/callback?code=${encodeURIComponent(`${who}.${payload.nonce}`)}&state=${encodeURIComponent(payload.state)}`,
		{ redirect: 'manual', headers: { cookie: `hackcast_hca=${decoded}` } }
	);
	assert.equal(callback.status, 303, `callback failed for ${who}: ${callback.headers.get('location')}`);
	assert.equal(callback.headers.get('location'), '/join');
	const session = cookieJar(callback).get('hackcast_session');
	assert.ok(session, 'callback did not set a session');
	return { cookie: `hackcast_session=${session}` };
}

async function postAction(base: string, path: string, cookie: string, fields: Record<string, string>): Promise<{ status: number; text: string }> {
	const response = await fetch(`${base}${path}`, {
		method: 'POST',
		redirect: 'manual',
		headers: {
			cookie,
			// adapter-node derives the app origin as https unless a protocol header says otherwise.
			origin: `https://127.0.0.1:${port}`,
			accept: 'text/html',
			'content-type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(fields)
	});
	return { status: response.status, text: await response.text() };
}
