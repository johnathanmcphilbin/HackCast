import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AIRTABLE_SUBMIT_EMBED, AIRTABLE_SUBMIT_HEIGHT } from '../submit.ts';
import {
	authorizeUrl,
	exchangeCode,
	fetchHackatimeProfile,
	fetchHackatimeProjects,
	formatHours,
	HACKATIME_SCOPES,
	HACKATIME_TOKEN,
	hackatimeCredentials,
	hackatimeRedirectUri,
	profileFromPayload,
	projectsFromPayload,
	statesMatch
} from './hackatime.ts';
import { readHt, signHt } from './session.ts';

describe('Hackatime OAuth', () => {
	it('pins production and still allows localhost', () => {
		assert.equal(
			hackatimeRedirectUri({ PUBLIC_BASE_URL: 'https://hackcast.hackclub.com' }),
			'https://hackcast.hackclub.com/auth/hackatime/callback'
		);
		assert.equal(
			hackatimeRedirectUri({ PUBLIC_BASE_URL: 'https://hackcast.hackclub.com/' }, 'http://10.0.0.8'),
			'https://hackcast.hackclub.com/auth/hackatime/callback'
		);
		assert.equal(
			hackatimeRedirectUri({ PUBLIC_BASE_URL: 'https://hackcast.hackclub.com' }, 'http://localhost:5173'),
			'https://hackcast.hackclub.com/auth/hackatime/callback'
		);
		assert.equal(
			hackatimeRedirectUri({ PUBLIC_BASE_URL: 'https://hackcast.hackclub.com' }, 'https://127.0.0.1:3000'),
			'https://hackcast.hackclub.com/auth/hackatime/callback'
		);
		assert.equal(hackatimeRedirectUri({}, 'http://127.0.0.1:5173'), 'http://127.0.0.1:5173/auth/hackatime/callback');
		assert.equal(hackatimeRedirectUri({}, 'http://localhost:5173'), 'http://localhost:5173/auth/hackatime/callback');
		assert.equal(hackatimeRedirectUri({}, 'https://evil.example'), undefined);
		assert.equal(hackatimeRedirectUri({}), undefined);
	});

	it('accepts the Hackatime app UID under either env name', () => {
		assert.deepEqual(
			hackatimeCredentials({
				HACKATIME_CLIENT_ID: 'primary',
				PUBLIC_HACKATIME_OAUTH_UID: 'fallback',
				HACKATIME_CLIENT_SECRET: 'secret'
			}),
			{ id: 'primary', secret: 'secret' }
		);
		assert.deepEqual(
			hackatimeCredentials({ PUBLIC_HACKATIME_OAUTH_UID: 'uid', HACKATIME_CLIENT_SECRET: 'secret' }),
			{ id: 'uid', secret: 'secret' }
		);
		assert.equal(hackatimeCredentials({ HACKATIME_CLIENT_ID: 'id' }), undefined);
	});

	it('asks for profile and read, and keeps the secret out of the authorize URL', () => {
		const url = new URL(
			authorizeUrl({
				clientId: 'ht-client',
				redirectUri: 'https://hackcast.hackclub.com/auth/hackatime/callback',
				state: 'state-1'
			})
		);
		assert.equal(url.origin, 'https://hackatime.hackclub.com');
		assert.equal(url.pathname, '/oauth/authorize');
		assert.equal(url.searchParams.get('response_type'), 'code');
		assert.equal(url.searchParams.get('scope'), HACKATIME_SCOPES);
		assert.equal(url.searchParams.get('client_id'), 'ht-client');
		assert.equal(url.searchParams.get('redirect_uri'), 'https://hackcast.hackclub.com/auth/hackatime/callback');
		assert.equal(url.searchParams.get('state'), 'state-1');
		assert.equal(url.searchParams.get('client_secret'), null);
		assert.equal(HACKATIME_SCOPES, 'profile read');
	});

	it('exchanges the code with the client secret in the body', async () => {
		let seen: { url: string; body: string } | undefined;
		const fetchImpl: typeof fetch = async (url, init) => {
			seen = { url: String(url), body: String(init?.body ?? '') };
			return new Response(
				JSON.stringify({ access_token: 'atk', refresh_token: 'rtk', expires_in: 10, scope: 'profile read' }),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		};
		const tokens = await exchangeCode({
			code: 'auth-code',
			redirectUri: 'http://localhost:5173/auth/hackatime/callback',
			clientId: 'ht-client',
			clientSecret: 'super-secret',
			fetchImpl
		});
		assert.equal(seen?.url, HACKATIME_TOKEN);
		assert.match(seen?.body ?? '', /grant_type=authorization_code/);
		assert.match(seen?.body ?? '', /client_secret=super-secret/);
		assert.doesNotMatch(seen?.url ?? '', /super-secret/);
		assert.equal(tokens.accessToken, 'atk');
		assert.equal(tokens.refreshToken, 'rtk');
		assert.equal(tokens.expiresIn, 10);

		const denied: typeof fetch = async () => new Response('nope', { status: 401 });
		await assert.rejects(
			() =>
				exchangeCode({
					code: 'auth-code',
					redirectUri: 'http://localhost:5173/auth/hackatime/callback',
					clientId: 'ht-client',
					clientSecret: 'super-secret',
					fetchImpl: denied
				}),
			/token/
		);
	});

	it('compares OAuth state without throwing on a different length', () => {
		assert.equal(statesMatch('abc', 'abc'), true);
		assert.equal(statesMatch('abc', 'abd'), false);
		assert.equal(statesMatch('abc', 'ab'), false);
	});

	it('round-trips the Hackatime state cookie', () => {
		const token = signHt({ state: 'abc', next: '/submit' }, 'test-secret', 60);
		assert.equal(readHt(token, 'test-secret')?.state, 'abc');
		assert.equal(readHt(token, 'test-secret')?.next, '/submit');
		assert.equal(readHt(token, 'other-secret'), null);
		assert.equal(readHt(`${token.slice(0, -2)}aa`, 'test-secret'), null);
	});
});

describe('Hackatime API payloads', () => {
	it('reads a profile and project hours', async () => {
		assert.deepEqual(
			profileFromPayload({
				id: 123,
				emails: ['ada@hackclub.com'],
				github_username: 'ada',
				slack_id: 'UADA'
			}),
			{ id: '123', email: 'ada@hackclub.com', githubUsername: 'ada', slackId: 'UADA' }
		);
		assert.equal(profileFromPayload({ emails: ['ada@hackclub.com'] }), null);

		const projects = projectsFromPayload({
			projects: [
				{ name: 'smaller', total_seconds: 10, languages: ['Go'] },
				{ name: 'bigger', total_seconds: 50, languages: ['TypeScript', 1] },
				{ name: '   ', total_seconds: 99 },
				{ total_seconds: 5 }
			]
		});
		assert.deepEqual(projects, [
			{ name: 'bigger', totalSeconds: 50, languages: ['TypeScript'] },
			{ name: 'smaller', totalSeconds: 10, languages: ['Go'] }
		]);
		assert.equal(formatHours(0), '0m');
		assert.equal(formatHours(3660), '1h 1m');

		const fetchImpl: typeof fetch = async (url) => {
			const path = String(url);
			if (path.endsWith('/authenticated/me')) {
				return new Response(JSON.stringify({ id: 7, emails: ['ada@hackclub.com'], github_username: 'ada' }), {
					status: 200
				});
			}
			return new Response(JSON.stringify({ projects: [{ name: 'booth', total_seconds: 120, languages: [] }] }), {
				status: 200
			});
		};
		assert.equal((await fetchHackatimeProfile('token', fetchImpl))?.email, 'ada@hackclub.com');
		assert.equal((await fetchHackatimeProjects('token', fetchImpl))?.[0]?.name, 'booth');
		const down: typeof fetch = async () => new Response('no', { status: 503 });
		assert.equal(await fetchHackatimeProjects('token', down), null);
	});
});

describe('submission embed', () => {
	it('is the Hackcast Airtable form at the snippet height', () => {
		assert.equal(AIRTABLE_SUBMIT_EMBED, 'https://airtable.com/embed/app5wPp2jEV7ZkTBB/pagbrjBbfwF27K7BE/form');
		assert.equal(AIRTABLE_SUBMIT_HEIGHT, 533);
	});
});
