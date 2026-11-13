import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkOrigin, isFormSubmission } from '../../../origin-check.js';

const SELF = 'https://hackcast.hackclub.com';

describe('form origin check', () => {
	it('only looks at mutating form submissions', () => {
		assert.ok(isFormSubmission('POST', 'application/x-www-form-urlencoded'));
		assert.ok(isFormSubmission('POST', 'multipart/form-data; boundary=x'));
		assert.ok(isFormSubmission('POST', undefined));
		assert.ok(!isFormSubmission('GET', 'application/x-www-form-urlencoded'));
		assert.ok(!isFormSubmission('POST', 'application/json'));
	});

	it('lets same-site submits through even when the browser drops Origin', () => {
		assert.equal(checkOrigin({ origin: SELF }, SELF), 'ok');
		assert.equal(checkOrigin({ secFetchSite: 'same-origin' }, SELF), 'fill');
		assert.equal(checkOrigin({ origin: 'null', secFetchSite: 'same-origin' }, SELF), 'fill');
		assert.equal(checkOrigin({ referer: `${SELF}/dashboard` }, SELF), 'fill');
	});

	it('rejects submits from anywhere else', () => {
		assert.equal(checkOrigin({ origin: 'https://evil.example' }, SELF), 'reject');
		assert.equal(checkOrigin({ origin: 'https://evil.example', secFetchSite: 'same-origin' }, SELF), 'reject');
		assert.equal(checkOrigin({ secFetchSite: 'cross-site', referer: `${SELF}/` }, SELF), 'reject');
		assert.equal(checkOrigin({ referer: 'https://evil.example/' }, SELF), 'reject');
		assert.equal(checkOrigin({}, SELF), 'reject');
	});
});
