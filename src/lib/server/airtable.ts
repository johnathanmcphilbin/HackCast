import type { Submission } from './submissions.ts';

/**
 * Field names on Hack Club's YSWS submissions table. If a send fails with
 * UNKNOWN_FIELD_NAME, the table calls one of these something else: fix it here.
 */
export const AIRTABLE_FIELDS = {
	codeUrl: 'Code URL',
	demoUrl: 'Playable URL',
	description: 'Description',
	screenshot: 'Screenshot',
	githubUsername: 'GitHub Username',
	firstName: 'First Name',
	lastName: 'Last Name',
	email: 'Email',
	birthday: 'Birthday',
	addressLine1: 'Address (Line 1)',
	addressLine2: 'Address (Line 2)',
	city: 'City',
	state: 'State / Province',
	postalCode: 'ZIP / Postal Code',
	country: 'Country',
	hours: 'Optional - Override Hours Spent',
	justification: 'Optional - Override Hours Spent Justification'
} as const;

/** Where the tracked hours came from. The start of a justification, for the reviewer to build on. */
export function hoursSource(submission: Submission): string {
	const tracked = (submission.trackedSeconds / 3600).toFixed(1);
	return submission.kind === 'software'
		? `Hackatime project "${submission.hackatimeProject ?? submission.projectName}" tracked ${tracked}h.`
		: `Hardware project. ${tracked}h from the build journal.`;
}

/** Why the hours are what they are: the reviewer's own words when written, signed by the reviewer. */
export function justification(submission: Submission, reviewerName: string): string {
	const approved = ((submission.approvedSeconds ?? 0) / 3600).toFixed(1);
	const lines = [`HackCast project "${submission.projectName}". ${hoursSource(submission)} Approved ${approved}h.`];
	if (submission.justification) lines.push(submission.justification);
	else if (submission.feedback) lines.push(submission.feedback);
	lines.push(`Reviewed by ${reviewerName}`);
	return lines.join('\n\n');
}

export function airtableFields(submission: Submission, reviewerName: string): Record<string, unknown> {
	const f = AIRTABLE_FIELDS;
	const fields: Record<string, unknown> = {
		[f.codeUrl]: submission.codeUrl,
		[f.demoUrl]: submission.demoUrl,
		[f.description]: submission.description,
		[f.screenshot]: [{ url: submission.screenshotUrl }],
		[f.firstName]: submission.firstName,
		[f.lastName]: submission.lastName,
		[f.email]: submission.email,
		[f.birthday]: submission.birthday,
		[f.addressLine1]: submission.addressLine1,
		[f.city]: submission.city,
		[f.state]: submission.state,
		[f.postalCode]: submission.postalCode,
		[f.country]: submission.country,
		[f.hours]: Math.round(((submission.approvedSeconds ?? 0) / 3600) * 100) / 100,
		[f.justification]: justification(submission, reviewerName)
	};
	if (submission.githubUsername) fields[f.githubUsername] = submission.githubUsername;
	if (submission.addressLine2) fields[f.addressLine2] = submission.addressLine2;
	return fields;
}

function airtableUrl(target: { baseId: string; table: string }, recordId = ''): string {
	const base = `https://api.airtable.com/v0/${encodeURIComponent(target.baseId)}/${encodeURIComponent(target.table)}`;
	return recordId ? `${base}/${encodeURIComponent(recordId)}` : base;
}

async function airtableRequest(url: string, method: 'POST' | 'PATCH', apiKey: string, fields: Record<string, unknown>, fetchImpl: typeof fetch): Promise<string> {
	const response = await fetchImpl(url, {
		method,
		headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
		body: JSON.stringify({ fields, typecast: true }),
		signal: AbortSignal.timeout(15000)
	});
	const json = (await response.json().catch(() => null)) as { id?: unknown; error?: { type?: unknown; message?: unknown } } | null;
	if (!response.ok || typeof json?.id !== 'string') {
		const type = typeof json?.error?.type === 'string' ? json.error.type : `HTTP ${response.status}`;
		const message = typeof json?.error?.message === 'string' ? `: ${json.error.message}` : '';
		throw new Error(`${type}${message}`);
	}
	return json.id;
}

/** Rewrite the hours and justification on a record already sent. */
export async function updateAirtableReview(
	target: { apiKey: string; baseId: string; table: string },
	recordId: string,
	submission: Submission,
	reviewerName: string,
	fetchImpl: typeof fetch = fetch
): Promise<void> {
	const f = AIRTABLE_FIELDS;
	await airtableRequest(airtableUrl(target, recordId), 'PATCH', target.apiKey, {
		[f.hours]: Math.round(((submission.approvedSeconds ?? 0) / 3600) * 100) / 100,
		[f.justification]: justification(submission, reviewerName)
	}, fetchImpl);
}

/** Create the record. Returns its id, or throws with Airtable's error type. */
export async function sendToAirtable(
	target: { apiKey: string; baseId: string; table: string },
	submission: Submission,
	reviewerName: string,
	fetchImpl: typeof fetch = fetch
): Promise<string> {
	return airtableRequest(airtableUrl(target), 'POST', target.apiKey, airtableFields(submission, reviewerName), fetchImpl);
}
