import { sendToAirtable } from './airtable.ts';
import { airtableTarget } from './config.ts';
import { getSubmission, markSent } from './submissions.ts';

/**
 * Send an approved submission on to Hack Club's Airtable and wipe the private
 * fields from our copy. Returns null when it went, or why it didn't.
 */
export async function sendApproved(submissionId: string): Promise<string | null> {
	const target = airtableTarget();
	if (!target) return 'Airtable isn’t set up on this server (AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE).';
	const submission = await getSubmission(submissionId);
	if (!submission || submission.status !== 'approved') return 'That submission isn’t waiting to be sent.';
	try {
		const recordId = await sendToAirtable(target, submission, submission.reviewerName ?? 'Hackcast');
		await markSent(submission.id, recordId);
		return null;
	} catch (err) {
		console.error('send to Airtable failed');
		return `Airtable said ${err instanceof Error ? err.message : 'no'}.`;
	}
}
