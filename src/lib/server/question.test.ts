import assert from 'node:assert/strict';
import { randomInt } from 'node:crypto';
import { describe, it } from 'node:test';
import { parseQuestion, pickIndex, QUESTION_MAX } from '../question.ts';

describe('question text', () => {
	it('rejects an empty or whitespace-only question', () => {
		assert.deepEqual(parseQuestion(''), { ok: false, error: 'write a question first.' });
		assert.deepEqual(parseQuestion('   \n\t  '), { ok: false, error: 'write a question first.' });
		assert.deepEqual(parseQuestion('\u0000'), { ok: false, error: 'write a question first.' });
	});

	it('trims a real question and rejects one past the limit', () => {
		const parsed = parseQuestion('  how did you start?  ');
		assert.equal(parsed.ok, true);
		if (parsed.ok) assert.equal(parsed.question, 'how did you start?');

		const exact = parseQuestion('a'.repeat(QUESTION_MAX));
		assert.equal(exact.ok, true);
		if (exact.ok) assert.equal(exact.question.length, QUESTION_MAX);

		const over = parseQuestion(`${'a'.repeat(QUESTION_MAX)}b`);
		assert.deepEqual(over, { ok: false, error: `keep it under ${QUESTION_MAX} characters.` });
	});
});

describe('pick index', () => {
	it('stays inside the list and uses the injected generator', () => {
		assert.equal(pickIndex(1, () => 0), 0);
		assert.equal(pickIndex(4, () => 3), 3);
		assert.throws(() => pickIndex(0, () => 0), /empty/);
		assert.throws(() => pickIndex(2, () => 2), /index/);
	});

	it('accepts crypto.randomInt for a non-empty list', () => {
		for (let i = 0; i < 40; i++) {
			const index = pickIndex(3, randomInt);
			assert.ok(index >= 0 && index < 3);
		}
	});
});
