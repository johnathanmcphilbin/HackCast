import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hackatimeConnectBlocked, hackatimeContinueHref, hackatimeStatusCopy } from '../hackatime-recovery.ts';
import { destinationAfterHca } from './auth-config.ts';
import { HACKATIME_CALLBACK_PATH, hackatimeRedirectUri } from './hackatime.ts';
import { redirectUri } from './auth-config.ts';
import { cleanProjectName, raceName, recentProjects } from './projects.ts';

describe('HackCast onboarding path', () => {
	it('keeps the Hackatime redirect distinct from Hack Club Auth', () => {
		const env = { PUBLIC_BASE_URL: 'https://hackcast.hackclub.com' };
		const hca = redirectUri(env);
		const hackatime = hackatimeRedirectUri(env);
		assert.equal(hca, 'https://hackcast.hackclub.com/auth/callback');
		assert.equal(hackatime, 'https://hackcast.hackclub.com/auth/hackatime/callback');
		assert.equal(HACKATIME_CALLBACK_PATH, '/auth/hackatime/callback');
		assert.notEqual(hca, hackatime);
		assert.equal(destinationAfterHca('/'), '/dashboard');
	});

	it('accepts a Hackatime project name to link to HackCast', () => {
		assert.equal(cleanProjectName('  booth  '), 'booth');
		assert.equal(cleanProjectName(''), null);
		assert.equal(cleanProjectName('   '), null);
		assert.equal(cleanProjectName('a'.repeat(201)), null);
		assert.equal(cleanProjectName('line\nbreak'), null);
		assert.equal(cleanProjectName(null), null);
	});

	it('does not send Continue back into Hackatime OAuth when the account is taken', () => {
		assert.equal(hackatimeConnectBlocked('taken'), true);
		assert.equal(hackatimeConnectBlocked('soon'), true);
		assert.equal(hackatimeContinueHref('taken'), null);
		assert.equal(hackatimeContinueHref('soon'), null);
		assert.equal(hackatimeContinueHref('taken', true), null);
		assert.equal(hackatimeContinueHref('failed'), '/auth/hackatime?next=/dashboard');
		assert.equal(hackatimeContinueHref('denied'), '/auth/hackatime?next=/dashboard');
		assert.equal(hackatimeContinueHref(null, false), null);
		assert.match(hackatimeStatusCopy('taken'), /another Hackcast login/);
		assert.match(hackatimeStatusCopy('taken'), /without linking/);
	});

	it('offers the five Hackatime projects worked on most recently', () => {
		const at = (day: number | null) => (day == null ? null : new Date(Date.UTC(2026, 10, day)));
		const projects = [3, null, 9, 1, 7, 5, 8].map((day, i) => ({ name: `p${i}`, lastHeartbeat: at(day) }));
		assert.deepEqual(
			recentProjects(projects).map((project) => project.name),
			['p2', 'p6', 'p4', 'p5', 'p0']
		);
	});

	it('shows first names and a last initial in the hours race', () => {
		assert.equal(raceName('Ada Lovelace'), 'Ada L.');
		assert.equal(raceName('  Grace  Brewster Hopper '), 'Grace H.');
		assert.equal(raceName('Cher'), 'Cher');
		assert.equal(raceName(''), 'someone');
	});
});
