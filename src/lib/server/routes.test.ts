import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { after, describe, it } from 'node:test';
import { AIRTABLE_SUBMIT_EMBED } from '../submit.ts';
import { signSession } from './session.ts';

const port = 4191;
const base = `http://127.0.0.1:${port}`;
const session = signSession({ sub: 'ident!ada', name: 'Ada Lovelace', slackId: 'UADA' }, 'test-session-secret', 600);

describe('booth routes', () => {
	const child: ChildProcess = spawn('node', ['build/index.js'], {
		cwd: new URL('../../../', import.meta.url),
		env: {
			...process.env,
			PORT: String(port),
			HOST: '127.0.0.1',
			HCA_CLIENT_ID: 'test-client',
			HCA_CLIENT_SECRET: 'test-secret',
			SESSION_SECRET: 'test-session-secret',
			DATABASE_URL: 'postgres://127.0.0.1:5432/hackcast',
			PUBLIC_BASE_URL: base,
			HACKATIME_CLIENT_ID: 'ht-client',
			HACKATIME_CLIENT_SECRET: 'ht-secret'
		},
		stdio: ['ignore', 'pipe', 'pipe']
	});
	let logs = '';
	child.stdout?.on('data', (chunk) => {
		logs += chunk.toString();
	});
	child.stderr?.on('data', (chunk) => {
		logs += chunk.toString();
	});

	after(async () => {
		child.kill('SIGTERM');
		await once(child, 'exit').catch(() => undefined);
	});

	async function ready(): Promise<void> {
		for (let i = 0; i < 80; i++) {
			try {
				await fetch(`${base}/api/rsvps/count`);
				return;
			} catch {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}
		assert.fail(`server did not start\n${logs}`);
	}

	it('sends signed-out booth routes through Hack Club Auth', async () => {
		await ready();
		for (const path of ['/dashboard', '/submit', '/onboarding', '/auth/hackatime']) {
			const response = await fetch(`${base}${path}`, { redirect: 'manual' });
			assert.equal(response.status, 303, path);
			const location = new URL(response.headers.get('location') ?? '', base);
			assert.equal(location.pathname, '/auth/login', path);
			assert.equal(location.searchParams.get('next'), path);
		}
	});

	it('embeds the Airtable form for a signed-in submit page', async () => {
		await ready();
		const response = await fetch(`${base}/submit`, {
			headers: { cookie: `hackcast_session=${session}` },
			redirect: 'manual'
		});
		assert.equal(response.status, 200);
		const html = await response.text();
		assert.ok(html.includes(AIRTABLE_SUBMIT_EMBED));
		assert.match(html, /height="533"/);
		assert.match(html, /background:\s*transparent/);
		assert.match(html, /border:\s*1px solid #ccc/);
		assert.doesNotMatch(html, /<form[\s>]/i);
	});

	it('shows the booth and keeps the Hackatime callback off the Hack Club Auth path', async () => {
		await ready();
		const response = await fetch(`${base}/dashboard`, {
			headers: { cookie: `hackcast_session=${session}` },
			redirect: 'manual'
		});
		assert.equal(response.status, 200);
		const html = await response.text();
		assert.match(html, /href="\/submit"/);
		assert.match(html, /hello, Ada/);
		assert.doesNotMatch(html, /connect hackatime/i);
		assert.doesNotMatch(html, /rsvp for hackcast/i);

		const onboarding = await fetch(`${base}/onboarding`, {
			headers: { cookie: `hackcast_session=${session}` },
			redirect: 'manual'
		});
		assert.equal(onboarding.status, 200);
		const onboardingHtml = await onboarding.text();
		assert.match(onboardingHtml, /HackCast project/i);
	});

	it('starts Hackatime OAuth for a signed-in user', async () => {
		await ready();
		const response = await fetch(`${base}/auth/hackatime`, {
			headers: { cookie: `hackcast_session=${session}` },
			redirect: 'manual'
		});
		assert.equal(response.status, 302);
		const target = new URL(response.headers.get('location') ?? '');
		assert.equal(target.origin, 'https://hackatime.hackclub.com');
		assert.equal(target.pathname, '/oauth/authorize');
		assert.equal(target.searchParams.get('client_id'), 'ht-client');
		assert.equal(target.searchParams.get('scope'), 'profile read');
		assert.equal(target.searchParams.get('redirect_uri'), `${base}/auth/hackatime/callback`);
		assert.notEqual(target.searchParams.get('redirect_uri'), `${base}/auth/callback`);
		assert.equal(new URL(target.searchParams.get('redirect_uri')!).pathname, '/auth/hackatime/callback');
		assert.equal(target.searchParams.get('client_secret'), null);
		assert.ok(target.searchParams.get('state'));
		assert.match(response.headers.get('set-cookie') ?? '', /hackcast_ht=/);
	});

	it('leaves the public landing page open on Start Now', async () => {
		await ready();
		const response = await fetch(`${base}/`);
		assert.equal(response.status, 200);
		const html = await response.text();
		assert.match(html, /Start Now/);
		assert.match(html, /href="\/auth\/login\?next=(%2F|\/)onboarding"/);
		assert.doesNotMatch(html, /rsvp for hackcast/i);
		assert.doesNotMatch(html, /waitlist/i);
		assert.doesNotMatch(html, /you're on the list/i);
	});
});
