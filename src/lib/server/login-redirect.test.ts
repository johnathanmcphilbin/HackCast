import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { describe, it } from 'node:test';

const port = 4187;

describe('/auth/login', () => {
	it('returns 302 to Hack Club Auth and sets the PKCE cookie', async () => {
		const child = spawn('node', ['build/index.js'], {
			cwd: new URL('../../../', import.meta.url),
			env: {
				...process.env,
				PORT: String(port),
				HOST: '127.0.0.1',
				HCA_CLIENT_ID: 'test-client',
				HCA_CLIENT_SECRET: 'test-secret',
				SESSION_SECRET: 'test-session-secret',
				DATABASE_URL: 'postgres://127.0.0.1:5432/hackcast',
				PUBLIC_BASE_URL: `http://127.0.0.1:${port}`
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

		try {
			const base = `http://127.0.0.1:${port}`;
			let ready = false;
			for (let i = 0; i < 50; i++) {
				try {
					await fetch(`${base}/api/rsvps/count`);
					ready = true;
					break;
				} catch {
					await new Promise((resolve) => setTimeout(resolve, 100));
				}
			}
			assert.equal(ready, true, `server did not start\n${logs}`);

			const response = await fetch(`${base}/auth/login`, { redirect: 'manual' });
			assert.equal(response.status, 302);
			const location = response.headers.get('location') ?? '';
			const target = new URL(location);
			assert.equal(target.origin, 'https://auth.hackclub.com');
			assert.equal(target.pathname, '/oauth/authorize');
			assert.equal(target.searchParams.get('code_challenge_method'), 'S256');
			assert.ok(target.searchParams.get('code_challenge'));
			const cookie = response.headers.get('set-cookie') ?? '';
			assert.match(cookie, /hackcast_hca=/);
		} finally {
			child.kill('SIGTERM');
			await once(child, 'exit').catch(() => undefined);
		}
	});
});
