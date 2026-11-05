/** What a builder sends in from /submit, checked before it reaches the queue. */
export type SubmissionInput = {
	projectId: string;
	kind: 'software' | 'hardware';
	description: string;
	codeUrl: string;
	demoUrl: string;
	screenshotUrl: string;
	githubUsername: string | null;
	firstName: string;
	lastName: string;
	birthday: string;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	/** Hardware only. Software hours come from Hackatime. */
	claimedHours: number | null;
};

export type SubmissionErrors = Partial<Record<keyof SubmissionInput, string>>;

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(form: FormData, key: string, max: number): string {
	const value = form.get(key);
	return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function url(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'https:' || parsed.protocol === 'http:';
	} catch {
		return false;
	}
}

/** Born on or before today, and not before 1900. Kept as YYYY-MM-DD. */
function birthday(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.getUTCFullYear() >= 1900 && date.getTime() <= Date.now();
}

export function parseSubmission(
	form: FormData
):
	| { ok: true; value: SubmissionInput; values: Record<string, string> }
	| { ok: false; errors: SubmissionErrors; values: Record<string, string> } {
	const values: Record<string, string> = {};
	for (const key of [
		'projectId',
		'kind',
		'description',
		'codeUrl',
		'demoUrl',
		'screenshotUrl',
		'githubUsername',
		'firstName',
		'lastName',
		'birthday',
		'addressLine1',
		'addressLine2',
		'city',
		'state',
		'postalCode',
		'country',
		'claimedHours'
	]) {
		values[key] = text(form, key, key === 'description' ? 2000 : 300);
	}

	const errors: SubmissionErrors = {};
	if (!UUID.test(values.projectId)) errors.projectId = 'Pick the HackCast project you are submitting.';
	if (values.kind !== 'software' && values.kind !== 'hardware') errors.kind = 'Pick software or hardware.';
	if (values.description.length < 20) errors.description = 'Say what it is and what it does, in a couple of sentences.';
	if (!url(values.codeUrl)) errors.codeUrl = 'Link the open source code or design.';
	if (!url(values.demoUrl)) errors.demoUrl = 'Link a working demo or a video of it working.';
	if (!url(values.screenshotUrl)) errors.screenshotUrl = 'Link a screenshot or photo of it.';
	if (!values.firstName) errors.firstName = 'Add your first name.';
	if (!values.lastName) errors.lastName = 'Add your last name.';
	if (!birthday(values.birthday)) errors.birthday = 'Add your birthday.';
	if (!values.addressLine1) errors.addressLine1 = 'Add your street address.';
	if (!values.city) errors.city = 'Add your city.';
	if (!values.state) errors.state = 'Add your state, province or region.';
	if (!values.postalCode) errors.postalCode = 'Add your postal code.';
	if (!values.country) errors.country = 'Add your country.';

	let claimedHours: number | null = null;
	if (values.kind === 'hardware') {
		const hours = Number(values.claimedHours);
		if (!Number.isFinite(hours) || hours <= 0 || hours > 500) {
			errors.claimedHours = 'Add the hours from your journal.';
		} else {
			claimedHours = Math.round(hours * 10) / 10;
		}
	}

	if (Object.keys(errors).length > 0) return { ok: false, errors, values };
	return {
		ok: true,
		values,
		value: {
			projectId: values.projectId,
			kind: values.kind as SubmissionInput['kind'],
			description: values.description,
			codeUrl: values.codeUrl,
			demoUrl: values.demoUrl,
			screenshotUrl: values.screenshotUrl,
			githubUsername: values.githubUsername.replace(/^@/, '') || null,
			firstName: values.firstName,
			lastName: values.lastName,
			birthday: values.birthday,
			addressLine1: values.addressLine1,
			addressLine2: values.addressLine2 || null,
			city: values.city,
			state: values.state,
			postalCode: values.postalCode,
			country: values.country,
			claimedHours
		}
	};
}

export type Decision = 'approved' | 'changes_requested' | 'rejected';

/** A reviewer's call. Approving needs the hours to credit; the others need feedback for the builder. */
export function parseDecision(
	form: FormData
): { ok: true; value: { decision: Decision; approvedSeconds: number | null; feedback: string } } | { ok: false; message: string } {
	const decision = form.get('decision');
	const feedback = typeof form.get('feedback') === 'string' ? String(form.get('feedback')).trim().slice(0, 2000) : '';
	if (decision === 'approved') {
		const hours = Number(form.get('approvedHours'));
		if (!Number.isFinite(hours) || hours < 0 || hours > 500) return { ok: false, message: 'Set the hours to approve.' };
		return { ok: true, value: { decision, approvedSeconds: Math.round(hours * 3600), feedback } };
	}
	if (decision === 'changes_requested' || decision === 'rejected') {
		if (!feedback) return { ok: false, message: 'Tell them why, so they know what to do next.' };
		return { ok: true, value: { decision, approvedSeconds: null, feedback } };
	}
	return { ok: false, message: 'Pick approve, needs changes or reject.' };
}
