/** One short question for episode 1. Optional to skip; a save must be non-empty and within this length. */
export const QUESTION_MAX = 280;

export type ParsedQuestion = { ok: true; question: string } | { ok: false; error: string };

export function parseQuestion(value: unknown): ParsedQuestion {
	const question = String(value ?? '')
		.replace(/\u0000/g, '')
		.replace(/\r\n/g, '\n')
		.trim();
	if (!question) return { ok: false, error: 'write a question first.' };
	if (question.length > QUESTION_MAX) {
		return { ok: false, error: `keep it under ${QUESTION_MAX} characters.` };
	}
	return { ok: true, question };
}

/** Uniform index in `[0, length)`. `nextInt` must match `crypto.randomInt` (exclusive max). */
export function pickIndex(length: number, nextInt: (max: number) => number): number {
	if (!Number.isInteger(length) || length < 1) throw new Error('empty');
	const index = nextInt(length);
	if (!Number.isInteger(index) || index < 0 || index >= length) throw new Error('index');
	return index;
}
