import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { destinationAfterHca } from './auth-config.ts';
import { HACKATIME_CALLBACK_PATH, hackatimeRedirectUri } from './hackatime.ts';
import { redirectUri } from './auth-config.ts';
import { cleanProjectName } from './projects.ts';

describe('HackCast onboarding path', () => {
	it('keeps the Hackatime redirect distinct from Hack Club Auth', () => {
		const env = { PUBLIC_BASE_URL: 'https://hackcast.hackclub.com' };
		const hca = redirectUri(env);
		const hackatime = hackatimeRedirectUri(env);
		assert.equal(hca, 'https://hackcast.hackclub.com/auth/callback');
		assert.equal(hackatime, 'https://hackcast.hackclub.com/auth/hackatime/callback');
		assert.equal(HACKATIME_CALLBACK_PATH, '/auth/hackatime/callback');
		assert.notEqual(hca, hackatime);
		assert.equal(
			destinationAfterHca({ next: '/', hackatimeConnected: false, hasHackcastProject: false }),
			'/auth/hackatime?next=%2Fonboarding'
		);
	});

	it('accepts a Hackatime project name to link to HackCast', () => {
		assert.equal(cleanProjectName('  booth  '), 'booth');
		assert.equal(cleanProjectName(''), null);
		assert.equal(cleanProjectName('   '), null);
		assert.equal(cleanProjectName('a'.repeat(201)), null);
		assert.equal(cleanProjectName('line\nbreak'), null);
		assert.equal(cleanProjectName(null), null);
	});
});
