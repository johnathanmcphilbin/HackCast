import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	FRAME_ANCESTORS,
	FRAME_OPTIONS,
	MAX_QUESTIONS_PER_GUEST,
	applySecurityHeaders,
	canAskAnother,
	requestOriginAllowed
} from './security.ts';

describe('security headers', () => {
	it('refuses to be framed', () => {
		const headers = new Headers();
		applySecurityHeaders(headers);
		assert.equal(headers.get('x-frame-options'), FRAME_OPTIONS);
		assert.equal(headers.get('content-security-policy'), FRAME_ANCESTORS);
		assert.match(headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/);
	});
});

describe('logout origin', () => {
	it('accepts only this site as the form origin', () => {
		const here = 'https://hackcast.hackclub.com';
		assert.equal(requestOriginAllowed(here, here), true);
		assert.equal(requestOriginAllowed('https://evil.example', here), false);
		assert.equal(requestOriginAllowed('https://hackcast.hackclub.com.evil.example', here), false);
		assert.equal(requestOriginAllowed(null, here), false);
		assert.equal(requestOriginAllowed('', here), false);
	});
});

describe('question cap', () => {
	it('allows questions until the per-guest cap', () => {
		assert.equal(canAskAnother(0), true);
		assert.equal(canAskAnother(MAX_QUESTIONS_PER_GUEST - 1), true);
		assert.equal(canAskAnother(MAX_QUESTIONS_PER_GUEST), false);
		assert.equal(canAskAnother(-1), false);
		assert.equal(canAskAnother(1.5), false);
	});
});
