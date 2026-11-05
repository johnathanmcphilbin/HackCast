import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { airtableFields, AIRTABLE_FIELDS, justification } from './airtable.ts';
import { cleanEmail, roleFor } from './roles.ts';
import { lastDays, median } from './days.ts';
import { parseDecision, parseSubmission } from './submission-form.ts';
import type { Submission } from './submissions.ts';

function form(values: Record<string, string>): FormData {
	const data = new FormData();
	for (const [key, value] of Object.entries(values)) data.set(key, value);
	return data;
}

const good = {
	projectId: '0b8e7a52-3a8b-4f39-9a51-2f0f5b6f0c11',
	kind: 'software',
	description: 'A booth timer that tells you when to stop talking.',
	codeUrl: 'https://github.com/ada/booth',
	demoUrl: 'https://booth.example.com',
	screenshotUrl: 'https://example.com/booth.png',
	githubUsername: '@ada',
	firstName: 'Ada',
	lastName: 'Lovelace',
	birthday: '2010-12-10',
	addressLine1: '1 Analytical Way',
	city: 'London',
	state: 'Greater London',
	postalCode: 'N1 1AA',
	country: 'United Kingdom'
};

describe('staff roles', () => {
	it('makes johnny@hackclub.com an admin whatever the database says', () => {
		assert.equal(roleFor({ email: 'Johnny@HackClub.com', storedRole: null, slackAdmin: false, adminEmails: undefined }), 'admin');
		assert.equal(roleFor({ email: 'ada@hackclub.com', storedRole: 'reviewer', slackAdmin: false, adminEmails: undefined }), 'reviewer');
		assert.equal(roleFor({ email: 'ada@hackclub.com', storedRole: null, slackAdmin: false, adminEmails: ' ada@hackclub.com ' }), 'admin');
		assert.equal(roleFor({ email: null, storedRole: null, slackAdmin: true, adminEmails: undefined }), 'admin');
		assert.equal(roleFor({ email: 'ada@hackclub.com', storedRole: null, slackAdmin: false, adminEmails: undefined }), null);
		assert.equal(cleanEmail(' Ada@HackClub.com '), 'ada@hackclub.com');
		assert.equal(cleanEmail('not an email'), null);
	});
});

describe('submission form', () => {
	it('accepts a complete software submission and strips the @ from GitHub', () => {
		const parsed = parseSubmission(form(good));
		assert.ok(parsed.ok);
		assert.equal(parsed.value.githubUsername, 'ada');
		assert.equal(parsed.value.claimedHours, null);
	});

	it('needs journal hours for hardware and says what is missing', () => {
		const parsed = parseSubmission(form({ ...good, kind: 'hardware', codeUrl: 'github.com/ada', birthday: '2999-01-01' }));
		assert.ok(!parsed.ok);
		assert.ok(parsed.errors.claimedHours);
		assert.ok(parsed.errors.codeUrl);
		assert.ok(parsed.errors.birthday);
		const hardware = parseSubmission(form({ ...good, kind: 'hardware', claimedHours: '12.34' }));
		assert.ok(hardware.ok);
		assert.equal(hardware.value.claimedHours, 12.3);
	});

	it('needs hours to approve and feedback to send back', () => {
		const approve = parseDecision(form({ decision: 'approved', approvedHours: '2.5' }));
		assert.ok(approve.ok);
		assert.equal(approve.value.approvedSeconds, 9000);
		assert.ok(!parseDecision(form({ decision: 'rejected' })).ok);
		assert.ok(parseDecision(form({ decision: 'changes_requested', feedback: 'Add a demo video.' })).ok);
		assert.ok(!parseDecision(form({ decision: 'maybe' })).ok);
	});
});

describe('sending to Airtable', () => {
	const submission = {
		projectName: 'booth',
		hackatimeProject: 'booth-timer',
		kind: 'software',
		description: good.description,
		codeUrl: good.codeUrl,
		demoUrl: good.demoUrl,
		screenshotUrl: good.screenshotUrl,
		githubUsername: 'ada',
		firstName: 'Ada',
		lastName: 'Lovelace',
		email: 'ada@hackclub.com',
		birthday: '2010-12-10',
		addressLine1: good.addressLine1,
		addressLine2: null,
		city: good.city,
		state: good.state,
		postalCode: good.postalCode,
		country: good.country,
		trackedSeconds: 36_000,
		approvedSeconds: 27_000,
		feedback: 'Solid. Cut the idle time.'
	} as Submission;

	it('overrides the hours with what was approved and signs the justification', () => {
		const fields = airtableFields(submission, 'Johnny');
		assert.equal(fields[AIRTABLE_FIELDS.hours], 7.5);
		assert.deepEqual(fields[AIRTABLE_FIELDS.screenshot], [{ url: good.screenshotUrl }]);
		assert.equal(fields[AIRTABLE_FIELDS.addressLine2], undefined);
		const text = justification(submission, 'Johnny');
		assert.match(text, /tracked 10\.0h/);
		assert.match(text, /Approved 7\.5h/);
		assert.match(text, /Cut the idle time/);
		assert.match(text, /Reviewed by Johnny$/);
	});
});

describe('stats helpers', () => {
	it('counts back whole UTC days and finds the middle wait', () => {
		assert.deepEqual(lastDays(3, new Date('2026-11-05T12:00:00Z')), ['2026-11-03', '2026-11-04', '2026-11-05']);
		assert.equal(median([]), null);
		assert.equal(median([5, 1, 3]), 3);
		assert.equal(median([4, 1, 3, 2]), 2.5);
	});
});
