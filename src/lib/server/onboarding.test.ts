import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { hackatimeConnectBlocked, hackatimeContinueHref, hackatimeStatusCopy } from '../hackatime-recovery.ts';
import { destinationAfterHca } from './auth-config.ts';
import { HACKATIME_CALLBACK_PATH, hackatimeRedirectUri } from './hackatime.ts';
import { redirectUri } from './auth-config.ts';
import { cleanProjectName, topProjects } from './projects.ts';

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

	it('does not send Continue back into Hackatime OAuth when the account is taken', () => {
		assert.equal(hackatimeConnectBlocked('taken'), true);
		assert.equal(hackatimeConnectBlocked('soon'), true);
		assert.equal(hackatimeContinueHref('taken'), null);
		assert.equal(hackatimeContinueHref('soon'), null);
		assert.equal(hackatimeContinueHref('taken', true), null);
		assert.notEqual(hackatimeContinueHref('taken'), '/auth/hackatime?next=/onboarding');
		assert.equal(hackatimeContinueHref('failed'), '/auth/hackatime?next=/onboarding');
		assert.equal(hackatimeContinueHref('denied'), '/auth/hackatime?next=/onboarding');
		assert.equal(hackatimeContinueHref(null, false), null);
		assert.match(hackatimeStatusCopy('taken'), /another Hackcast login/);
		assert.match(hackatimeStatusCopy('taken'), /without linking/);

		const onboarding = readFileSync(new URL('../../routes/onboarding/+page.svelte', import.meta.url), 'utf8');
		const onboardingServer = readFileSync(new URL('../../routes/onboarding/+page.server.ts', import.meta.url), 'utf8');
		const dashboard = readFileSync(new URL('../../routes/dashboard/+page.svelte', import.meta.url), 'utf8');
		const dashboardServer = readFileSync(new URL('../../routes/dashboard/+page.server.ts', import.meta.url), 'utf8');
		assert.match(onboarding, /hackatimeContinueHref/);
		assert.match(onboarding, /start a new project without Hackatime/);
		assert.match(onboarding, /action="\?\/create"/);
		assert.doesNotMatch(onboarding, /href="\/auth\/hackatime\?next=\/onboarding"/);
		assert.doesNotMatch(dashboard, /href="\/auth\/hackatime\?next=\/onboarding"/);
		assert.doesNotMatch(onboardingServer, /\/auth\/hackatime\?next=\/onboarding/);
		assert.doesNotMatch(dashboardServer, /\/auth\/hackatime\?next=\/onboarding/);
	});

	it('offers only the five Hackatime projects with the most hours', () => {
		const projects = [1, 9, 3, 7, 5, 8, 2].map((hours) => ({ name: `p${hours}`, totalSeconds: hours * 3600 }));
		assert.deepEqual(
			topProjects(projects).map((project) => project.name),
			['p9', 'p8', 'p7', 'p5', 'p3']
		);
		assert.equal(projects[0].name, 'p1');
	});
});
