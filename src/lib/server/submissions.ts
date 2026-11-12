import type postgres from 'postgres';
import type { Decision, SubmissionInput } from './submission-form.ts';
import { database, userId } from './users.ts';

/**
 * Submissions stay in Hackcast's own queue until a reviewer approves them.
 * Approval sends the project on to Hack Club's Airtable, then the address and
 * birthday are wiped from our copy. Every decision is logged in
 * `submission_reviews`, which is where the review stats come from.
 *
 * pending → changes_requested → (builder edits) → pending
 * pending → rejected → (admin moves it back) → pending
 * pending → approved → sent
 */

export type SubmissionStatus = 'pending' | 'changes_requested' | 'rejected' | 'approved' | 'sent';

export type Submission = {
	id: string;
	projectId: string | null;
	projectName: string;
	hackatimeProject: string | null;
	kind: 'software' | 'hardware';
	description: string;
	codeUrl: string;
	demoUrl: string;
	screenshotUrl: string;
	githubUsername: string | null;
	firstName: string;
	lastName: string;
	email: string;
	birthday: string | null;
	addressLine1: string | null;
	addressLine2: string | null;
	city: string | null;
	state: string | null;
	postalCode: string | null;
	country: string;
	trackedSeconds: number;
	status: SubmissionStatus;
	approvedSeconds: number | null;
	feedback: string | null;
	/** The reviewer's justification for the hours, sent to Airtable. Not shown to the builder. */
	justification: string | null;
	reviewerName: string | null;
	airtableRecordId: string | null;
	submittedAt: Date;
	decidedAt: Date | null;
	builderName: string;
	builderHackclubId: string;
	builderSlackId: string | null;
};

let schema: Promise<void> | null = null;

async function ready(): Promise<postgres.Sql> {
	const sql = await database();
	if (!schema) {
		schema = (async () => {
			await sql`
				create table if not exists submissions (
					id uuid primary key default gen_random_uuid(),
					user_id uuid not null references users (id) on delete cascade,
					project_id uuid references hackcast_projects (id) on delete set null,
					project_name text not null,
					hackatime_project text,
					kind text not null check (kind in ('software', 'hardware')),
					description text not null,
					code_url text not null,
					demo_url text not null,
					screenshot_url text not null,
					github_username text,
					first_name text not null,
					last_name text not null,
					email text not null default '',
					birthday date,
					address_line1 text,
					address_line2 text,
					city text,
					state text,
					postal_code text,
					country text not null default '',
					tracked_seconds integer not null default 0,
					status text not null default 'pending'
						check (status in ('pending', 'changes_requested', 'rejected', 'approved', 'sent')),
					approved_seconds integer,
					feedback text,
					reviewer_name text,
					airtable_record_id text,
					submitted_at timestamptz not null default now(),
					decided_at timestamptz,
					sent_at timestamptz,
					updated_at timestamptz not null default now()
				)
			`;
			await sql`alter table submissions add column if not exists justification text`;
			await sql`create index if not exists submissions_status_idx on submissions (status, submitted_at)`;
			await sql`
				create table if not exists submission_reviews (
					id uuid primary key default gen_random_uuid(),
					submission_id uuid not null references submissions (id) on delete cascade,
					reviewer_user_id uuid references users (id) on delete set null,
					reviewer_name text not null default '',
					decision text not null check (decision in ('approved', 'changes_requested', 'rejected')),
					approved_seconds integer,
					tracked_seconds integer not null default 0,
					feedback text,
					waited_seconds integer not null default 0,
					decided_at timestamptz not null default now()
				)
			`;
			await sql`
				create table if not exists project_activity_days (
					project_id uuid not null references hackcast_projects (id) on delete cascade,
					day date not null,
					primary key (project_id, day)
				)
			`;
		})().catch((err) => {
			schema = null;
			throw err;
		});
	}
	await schema;
	return sql;
}

const COLUMNS = (sql: postgres.Sql) => sql`
	s.id::text as id, s.project_id::text as project_id, s.project_name, s.hackatime_project, s.kind,
	s.description, s.code_url, s.demo_url, s.screenshot_url, s.github_username, s.first_name, s.last_name,
	coalesce(nullif(s.email, ''), u.email) as email, to_char(s.birthday, 'YYYY-MM-DD') as birthday, s.address_line1, s.address_line2, s.city, s.state,
	s.postal_code, s.country, s.tracked_seconds, s.status, s.approved_seconds, s.feedback, s.justification, s.reviewer_name,
	s.airtable_record_id, s.submitted_at, s.decided_at,
	u.display_name as builder_name, u.hackclub_id as builder_hackclub_id, u.slack_id as builder_slack_id
`;

type Row = {
	id: string;
	project_id: string | null;
	project_name: string;
	hackatime_project: string | null;
	kind: 'software' | 'hardware';
	description: string;
	code_url: string;
	demo_url: string;
	screenshot_url: string;
	github_username: string | null;
	first_name: string;
	last_name: string;
	email: string;
	birthday: string | null;
	address_line1: string | null;
	address_line2: string | null;
	city: string | null;
	state: string | null;
	postal_code: string | null;
	country: string;
	tracked_seconds: number;
	status: SubmissionStatus;
	approved_seconds: number | null;
	feedback: string | null;
	justification: string | null;
	reviewer_name: string | null;
	airtable_record_id: string | null;
	submitted_at: Date;
	decided_at: Date | null;
	builder_name: string;
	builder_hackclub_id: string;
	builder_slack_id: string | null;
};

function toSubmission(row: Row): Submission {
	return {
		id: row.id,
		projectId: row.project_id,
		projectName: row.project_name,
		hackatimeProject: row.hackatime_project,
		kind: row.kind,
		description: row.description,
		codeUrl: row.code_url,
		demoUrl: row.demo_url,
		screenshotUrl: row.screenshot_url,
		githubUsername: row.github_username,
		firstName: row.first_name,
		lastName: row.last_name,
		email: row.email,
		birthday: row.birthday,
		addressLine1: row.address_line1,
		addressLine2: row.address_line2,
		city: row.city,
		state: row.state,
		postalCode: row.postal_code,
		country: row.country,
		trackedSeconds: row.tracked_seconds,
		status: row.status,
		approvedSeconds: row.approved_seconds,
		feedback: row.feedback,
		justification: row.justification,
		reviewerName: row.reviewer_name,
		airtableRecordId: row.airtable_record_id,
		submittedAt: row.submitted_at,
		decidedAt: row.decided_at,
		builderName: row.builder_name,
		builderHackclubId: row.builder_hackclub_id,
		builderSlackId: row.builder_slack_id
	};
}

export class SubmitError extends Error {}

/**
 * Send a project in, or resubmit one a reviewer asked to change.
 * One open submission per project: pending, approved and sent block another.
 */
export async function submitProject(
	hackclubId: string,
	input: SubmissionInput,
	trackedSeconds: number
): Promise<void> {
	const sql = await ready();
	const owner = await userId(sql, hackclubId);
	await sql.begin(async (tx) => {
		const projects = await tx<{ name: string; hackatime_project: string | null }[]>`
			select name, hackatime_project from hackcast_projects
			where id = ${input.projectId}::uuid and user_id = ${owner}::uuid
		`;
		const project = projects[0];
		if (!project) throw new SubmitError('That HackCast project is not yours.');
		if (input.kind === 'software' && !project.hackatime_project) {
			throw new SubmitError('Link a Hackatime project to it on your dashboard first.');
		}
		const open = await tx<{ id: string; status: SubmissionStatus }[]>`
			select id::text as id, status from submissions
			where project_id = ${input.projectId}::uuid
			order by submitted_at desc limit 1
			for update
		`;
		const latest = open[0];
		if (latest && (latest.status === 'pending' || latest.status === 'approved' || latest.status === 'sent')) {
			throw new SubmitError(
				latest.status === 'pending' ? 'That project is already waiting for review.' : 'That project is already approved.'
			);
		}
		const emails = await tx<{ email: string }[]>`select email from users where id = ${owner}::uuid`;
		const fields = {
			project_name: project.name,
			hackatime_project: input.kind === 'software' ? project.hackatime_project : null,
			kind: input.kind,
			description: input.description,
			code_url: input.codeUrl,
			demo_url: input.demoUrl,
			screenshot_url: input.screenshotUrl,
			github_username: input.githubUsername,
			first_name: input.firstName,
			last_name: input.lastName,
			email: emails[0]?.email ?? '',
			birthday: input.birthday,
			address_line1: input.addressLine1,
			address_line2: input.addressLine2,
			city: input.city,
			state: input.state,
			postal_code: input.postalCode,
			country: input.country,
			tracked_seconds: Math.round(trackedSeconds)
		};
		if (latest?.status === 'changes_requested') {
			await tx`
				update submissions set ${tx(fields)}, status = 'pending', submitted_at = now(), updated_at = now()
				where id = ${latest.id}::uuid
			`;
		} else {
			await tx`
				insert into submissions ${tx({ ...fields, user_id: owner, project_id: input.projectId })}
			`;
		}
	});
}

/** The builder's own submissions, newest first, one per project. */
export async function submissionsFor(hackclubId: string): Promise<Submission[]> {
	const sql = await ready();
	const rows = await sql<Row[]>`
		select distinct on (s.project_id) ${COLUMNS(sql)}
		from submissions s join users u on u.id = s.user_id
		where u.hackclub_id = ${hackclubId}
		order by s.project_id, s.submitted_at desc
	`;
	return rows.map(toSubmission).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}

/** The builder's latest submission for one project, to prefill a resubmission. */
export async function latestForProject(hackclubId: string, projectId: string): Promise<Submission | null> {
	const sql = await ready();
	const rows = await sql<Row[]>`
		select ${COLUMNS(sql)}
		from submissions s join users u on u.id = s.user_id
		where u.hackclub_id = ${hackclubId} and s.project_id = ${projectId}::uuid
		order by s.submitted_at desc limit 1
	`;
	return rows[0] ? toSubmission(rows[0]) : null;
}

export async function submissionsWithStatus(statuses: SubmissionStatus[], limit = 200): Promise<Submission[]> {
	const sql = await ready();
	const rows = await sql<Row[]>`
		select ${COLUMNS(sql)}
		from submissions s join users u on u.id = s.user_id
		where s.status in ${sql(statuses)}
		order by ${statuses.includes('pending') ? sql`s.submitted_at asc` : sql`coalesce(s.decided_at, s.submitted_at) desc`}
		limit ${limit}
	`;
	return rows.map(toSubmission);
}

export async function getSubmission(id: string): Promise<Submission | null> {
	const sql = await ready();
	const rows = await sql<Row[]>`
		select ${COLUMNS(sql)}
		from submissions s join users u on u.id = s.user_id
		where s.id = ${id}::uuid
	`;
	return rows[0] ? toSubmission(rows[0]) : null;
}

export type ReviewLogEntry = {
	reviewerName: string;
	decision: Decision;
	approvedSeconds: number | null;
	feedback: string | null;
	decidedAt: Date;
};

export async function reviewLog(submissionId: string): Promise<ReviewLogEntry[]> {
	const sql = await ready();
	const rows = await sql<
		{ reviewer_name: string; decision: Decision; approved_seconds: number | null; feedback: string | null; decided_at: Date }[]
	>`
		select reviewer_name, decision, approved_seconds, feedback, decided_at
		from submission_reviews where submission_id = ${submissionId}::uuid
		order by decided_at desc
	`;
	return rows.map((row) => ({
		reviewerName: row.reviewer_name,
		decision: row.decision,
		approvedSeconds: row.approved_seconds,
		feedback: row.feedback,
		decidedAt: row.decided_at
	}));
}

/** Record a reviewer's call on a pending submission. False if it was no longer pending. */
export async function decide(input: {
	submissionId: string;
	reviewerHackclubId: string;
	reviewerName: string;
	decision: Decision;
	approvedSeconds: number | null;
	feedback: string;
	justification: string | null;
}): Promise<boolean> {
	const sql = await ready();
	const reviewer = await userId(sql, input.reviewerHackclubId);
	return sql.begin(async (tx) => {
		const rows = await tx<{ submitted_at: Date; tracked_seconds: number }[]>`
			update submissions set
				status = ${input.decision},
				approved_seconds = ${input.approvedSeconds},
				feedback = ${input.feedback || null},
				justification = ${input.justification},
				reviewer_name = ${input.reviewerName},
				decided_at = now(),
				updated_at = now()
			where id = ${input.submissionId}::uuid and status = 'pending'
			returning submitted_at, tracked_seconds
		`;
		const row = rows[0];
		if (!row) return false;
		await tx`
			insert into submission_reviews
				(submission_id, reviewer_user_id, reviewer_name, decision, approved_seconds, tracked_seconds, feedback, waited_seconds)
			values (
				${input.submissionId}::uuid, ${reviewer}::uuid, ${input.reviewerName}, ${input.decision},
				${input.approvedSeconds}, ${row.tracked_seconds}, ${input.feedback || null},
				${Math.max(0, Math.round((Date.now() - row.submitted_at.getTime()) / 1000))}
			)
		`;
		return true;
	});
}

/** Change the approved hours and justification after approval. False unless it is approved or sent. */
export async function rewriteApproval(submissionId: string, approvedSeconds: number, justification: string): Promise<boolean> {
	const sql = await ready();
	const rows = await sql`
		update submissions set approved_seconds = ${approvedSeconds}, justification = ${justification}, updated_at = now()
		where id = ${submissionId}::uuid and status in ('approved', 'sent')
		returning id
	`;
	return rows.length > 0;
}

/** Approved and now in Hack Club's Airtable: keep the record id, drop the address and birthday. */
export async function markSent(submissionId: string, airtableRecordId: string): Promise<void> {
	const sql = await ready();
	await sql`
		update submissions set
			status = 'sent', airtable_record_id = ${airtableRecordId}, sent_at = now(), updated_at = now(),
			birthday = null, address_line1 = null, address_line2 = null, city = null, state = null, postal_code = null
		where id = ${submissionId}::uuid and status = 'approved'
	`;
}

/** Admin undo for a rejection. */
export async function moveBackToQueue(submissionId: string): Promise<boolean> {
	const sql = await ready();
	const rows = await sql`
		update submissions set status = 'pending', updated_at = now()
		where id = ${submissionId}::uuid and status = 'rejected'
		returning id
	`;
	return rows.length > 0;
}

/** Approved hours, which are what the shop spends. */
export async function approvedSecondsFor(hackclubId: string): Promise<number> {
	const sql = await ready();
	const rows = await sql<{ total: string | null }[]>`
		select sum(s.approved_seconds)::text as total
		from submissions s join users u on u.id = s.user_id
		where u.hackclub_id = ${hackclubId} and s.status in ('approved', 'sent')
	`;
	return Number(rows[0]?.total ?? 0);
}

export async function pendingCount(): Promise<number> {
	const sql = await ready();
	const rows = await sql<{ n: number }[]>`select count(*)::int as n from submissions where status = 'pending'`;
	return rows[0]?.n ?? 0;
}

/** Remember which days a project had coding time, for the daily active chart. */
export async function recordActivity(entries: { projectId: string; day: string }[]): Promise<void> {
	if (entries.length === 0) return;
	const sql = await ready();
	await sql`
		insert into project_activity_days ${sql(entries.map((entry) => ({ project_id: entry.projectId, day: entry.day })))}
		on conflict do nothing
	`;
}

export { ready as submissionsDatabase };
