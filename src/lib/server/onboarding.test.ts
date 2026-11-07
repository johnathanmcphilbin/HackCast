import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hackatimeConnectBlocked, hackatimeContinueHref, hackatimeStatusCopy } from '../hackatime-recovery.ts';
import { destinationAfterHca } from './auth-config.ts';
import { HACKATIME_CALLBACK_PATH, hackatimeRedirectUri } from './hackatime.ts';
import { redirectUri } from './auth-config.ts';
import {
	cleanGuestRequest,
	cleanProjectName,
	groupGuestVotes,
	guestKey,
	hatEntries,
	pickWeighted,
	raceName,
	recentProjects,
	sameGuest
} from './projects.ts';

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

	it('takes guest requests for HQ or outside, tidied', () => {
		assert.deepEqual(cleanGuestRequest('hq', '  Zach   Latta '), { category: 'hq', name: 'Zach Latta' });
		assert.deepEqual(cleanGuestRequest('outside', 'Linus Torvalds'), { category: 'outside', name: 'Linus Torvalds' });
		assert.equal(cleanGuestRequest('elsewhere', 'Ada'), null);
		assert.equal(cleanGuestRequest('hq', '   '), null);
		assert.equal(cleanGuestRequest('hq', 'x'.repeat(121)), null);
	});

	it('matches spellings of the same guest into one tally', () => {
		assert.equal(guestKey('  Zach  Latta. '), 'zach latta');
		assert.equal(guestKey('Zoë'), 'zoe');
		assert.ok(sameGuest('zach latta', 'zack latta'));
		assert.ok(!sameGuest('ada', 'ida'));
		assert.ok(!sameGuest('zach latta', 'max wofford'));
		const at = new Date('2026-11-05T12:00:00Z');
		const vote = (id: string, name: string, voter: string, category: 'hq' | 'outside' = 'hq') => ({
			id,
			category,
			name,
			voter,
			status: 'new',
			at
		});
		const groups = groupGuestVotes([
			vote('1', 'Zach Latta', 'Ada'),
			vote('2', 'zach latta', 'Grace'),
			vote('3', 'Zack Latta', 'Linus'),
			vote('4', 'Max Wofford', 'Ada'),
			vote('5', 'Zach Latta', 'Mo', 'outside')
		]);
		assert.equal(groups[0].name, 'Zach Latta');
		assert.equal(groups[0].votes, 3);
		assert.deepEqual(groups[0].spellings, ['Zack Latta']);
		assert.equal(groups.filter((group) => group.category === 'outside').length, 1);
	});

	it('gives five free entries in the hat, plus one per approved hour', () => {
		assert.equal(hatEntries(0), 5);
		assert.equal(hatEntries(3599), 5);
		assert.equal(hatEntries(3 * 3600), 8);
		assert.equal(hatEntries(3.9 * 3600), 8);
		const hat = [
			{ item: 'one', weight: 1 },
			{ item: 'three', weight: 3 }
		];
		assert.equal(pickWeighted(hat, 0), 'one');
		assert.equal(pickWeighted(hat, 0.24), 'one');
		assert.equal(pickWeighted(hat, 0.26), 'three');
		assert.equal(pickWeighted(hat, 0.99), 'three');
		assert.equal(pickWeighted([], 0.5), null);
	});
});
