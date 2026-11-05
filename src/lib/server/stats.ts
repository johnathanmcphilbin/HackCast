import { fetchHackatimeProjects } from './hackatime.ts';
import { lastDays, median } from './days.ts';
import { recordActivity, submissionsDatabase } from './submissions.ts';

/** One bar or point per UTC day, oldest first. */
export type DayCount = { day: string; value: number; extra?: number };

export type AdminStats = {
	funnel: { label: string; value: number }[];
	connected: { projects: number; builders: number; lastWeek: number; overTime: DayCount[] };
	review: {
		waiting: number;
		oldestWaitSeconds: number | null;
		medianWaitSeconds: number | null;
		averageWaitSeconds: number | null;
		decidedWeek: number;
		submittedWeek: number;
		byReviewer: { name: string; count: number }[];
	};
	hours: {
		approvedSeconds: number;
		trackedSeconds: number;
		approvedDecisions: number;
		changesDecisions: number;
		rejectedDecisions: number;
		byKind: { kind: string; submissions: number; approved: number; approvedSeconds: number }[];
	};
	countries: { country: string; count: number }[];
	countriesKnown: number;
	submissionsByDay: { day: string; submitted: number; decided: number }[];
	activeByDay: DayCount[];
};

function fill(days: string[], rows: { day: string; n: number; m?: number }[]): DayCount[] {
	const byDay = new Map(rows.map((row) => [row.day, row]));
	return days.map((day) => ({ day, value: byDay.get(day)?.n ?? 0, extra: byDay.get(day)?.m }));
}

export async function adminStats(): Promise<AdminStats> {
	const sql = await submissionsDatabase();
	const month = lastDays(30);
	const sixWeeks = lastDays(42);

	const [
		funnelRow,
		connectedRow,
		connectedDays,
		waitingRow,
		waits,
		weekRow,
		reviewers,
		hoursRow,
		decisionRows,
		kinds,
		countries,
		submittedDays,
		decidedDays,
		activeDays
	] = await Promise.all([
		sql<{ users: number; connected: number; projects: number; submitted: number; approved: number }[]>`
			select
				(select count(*)::int from users) as users,
				(select count(*)::int from hackatime_connections) as connected,
				(select count(distinct user_id)::int from hackcast_projects) as projects,
				(select count(distinct user_id)::int from submissions) as submitted,
				(select count(distinct user_id)::int from submissions where status in ('approved', 'sent')) as approved
		`,
		sql<{ projects: number; builders: number; week: number }[]>`
			select count(*)::int as projects, count(distinct user_id)::int as builders,
				count(*) filter (where linked_at > now() - interval '7 days')::int as week
			from hackcast_projects where hackatime_project is not null
		`,
		sql<{ day: string; n: number }[]>`
			select to_char(d.day, 'YYYY-MM-DD') as day,
				(select count(*)::int from hackcast_projects p
					where p.hackatime_project is not null and p.linked_at < d.day + interval '1 day') as n
			from generate_series((now() at time zone 'utc')::date - 41, (now() at time zone 'utc')::date, interval '1 day') as d(day)
		`,
		sql<{ n: number; oldest: Date | null }[]>`
			select count(*)::int as n, min(submitted_at) as oldest from submissions where status = 'pending'
		`,
		sql<{ waited_seconds: number }[]>`select waited_seconds from submission_reviews`,
		sql<{ decided: number; submitted: number }[]>`
			select
				(select count(*)::int from submission_reviews where decided_at > now() - interval '7 days') as decided,
				(select count(*)::int from submissions where submitted_at > now() - interval '7 days') as submitted
		`,
		sql<{ name: string; n: number }[]>`
			select reviewer_name as name, count(*)::int as n from submission_reviews
			group by reviewer_name order by n desc
		`,
		sql<{ approved: string | null; tracked: string | null }[]>`
			select sum(approved_seconds)::text as approved, sum(tracked_seconds)::text as tracked
			from submissions where status in ('approved', 'sent')
		`,
		sql<{ decision: string; n: number }[]>`
			select decision, count(*)::int as n from submission_reviews group by decision
		`,
		sql<{ kind: string; submissions: number; approved: number; seconds: string | null }[]>`
			select kind, count(*)::int as submissions,
				count(*) filter (where status in ('approved', 'sent'))::int as approved,
				sum(approved_seconds) filter (where status in ('approved', 'sent'))::text as seconds
			from submissions group by kind order by kind desc
		`,
		sql<{ country: string; n: number }[]>`
			select country, count(*)::int as n from (
				select distinct on (user_id) user_id, country from submissions
				order by user_id, submitted_at desc
			) latest
			where country <> ''
			group by country order by n desc, country
		`,
		sql<{ day: string; n: number }[]>`
			select to_char(submitted_at at time zone 'utc', 'YYYY-MM-DD') as day, count(*)::int as n
			from submissions where submitted_at > now() - interval '31 days' group by 1
		`,
		sql<{ day: string; n: number }[]>`
			select to_char(decided_at at time zone 'utc', 'YYYY-MM-DD') as day, count(*)::int as n
			from submission_reviews where decided_at > now() - interval '31 days' group by 1
		`,
		sql<{ day: string; n: number; m: number }[]>`
			select to_char(a.day, 'YYYY-MM-DD') as day, count(*)::int as n, count(distinct p.user_id)::int as m
			from project_activity_days a join hackcast_projects p on p.id = a.project_id
			where a.day > (now() at time zone 'utc')::date - 30
			group by a.day
		`
	]);

	const f = funnelRow[0];
	const decisions = new Map(decisionRows.map((row) => [row.decision, row.n]));
	const submitted = new Map(submittedDays.map((row) => [row.day, row.n]));
	const decided = new Map(decidedDays.map((row) => [row.day, row.n]));
	const waitValues = waits.map((row) => row.waited_seconds);
	const oldest = waitingRow[0]?.oldest;

	return {
		funnel: [
			{ label: 'Signed up', value: f.users },
			{ label: 'Connected Hackatime', value: f.connected },
			{ label: 'Added a project', value: f.projects },
			{ label: 'Submitted a project', value: f.submitted },
			{ label: 'Got hours approved', value: f.approved }
		],
		connected: {
			projects: connectedRow[0].projects,
			builders: connectedRow[0].builders,
			lastWeek: connectedRow[0].week,
			overTime: fill(sixWeeks, connectedDays)
		},
		review: {
			waiting: waitingRow[0]?.n ?? 0,
			oldestWaitSeconds: oldest ? Math.round((Date.now() - oldest.getTime()) / 1000) : null,
			medianWaitSeconds: median(waitValues),
			averageWaitSeconds: waitValues.length
				? waitValues.reduce((sum, value) => sum + value, 0) / waitValues.length
				: null,
			decidedWeek: weekRow[0].decided,
			submittedWeek: weekRow[0].submitted,
			byReviewer: reviewers.map((row) => ({ name: row.name || 'unknown', count: row.n }))
		},
		hours: {
			approvedSeconds: Number(hoursRow[0]?.approved ?? 0),
			trackedSeconds: Number(hoursRow[0]?.tracked ?? 0),
			approvedDecisions: decisions.get('approved') ?? 0,
			changesDecisions: decisions.get('changes_requested') ?? 0,
			rejectedDecisions: decisions.get('rejected') ?? 0,
			byKind: kinds.map((row) => ({
				kind: row.kind,
				submissions: row.submissions,
				approved: row.approved,
				approvedSeconds: Number(row.seconds ?? 0)
			}))
		},
		countries: countries.map((row) => ({ country: row.country, count: row.n })),
		countriesKnown: countries.reduce((sum, row) => sum + row.n, 0),
		submissionsByDay: month.map((day) => ({
			day,
			submitted: submitted.get(day) ?? 0,
			decided: decided.get(day) ?? 0
		})),
		activeByDay: fill(month, activeDays)
	};
}

export type LiveProject = {
	projectName: string;
	hackatimeProject: string;
	builder: string;
	totalSeconds: number;
	lastHeartbeat: Date;
};

export type LiveActivity = {
	checkedAt: Date;
	now: number;
	today: number;
	week: number;
	trackedSeconds: number;
	unreachable: number;
	workedOnToday: LiveProject[];
};

const LIVE_TTL_MS = 3 * 60_000;
const CONCURRENCY = 6;
let live: { at: number; value: Promise<LiveActivity> } | null = null;

/** Run `work` over `items` with at most `limit` in flight. */
async function pool<T>(items: T[], limit: number, work: (item: T) => Promise<void>): Promise<void> {
	let next = 0;
	await Promise.all(
		Array.from({ length: Math.min(limit, items.length) }, async () => {
			while (next < items.length) await work(items[next++]);
		})
	);
}

async function measure(): Promise<LiveActivity> {
	const sql = await submissionsDatabase();
	type Linked = { display_name: string; access_token: string; project_id: string; name: string; hackatime_project: string };
	const rows = await sql<Linked[]>`
		select u.display_name, c.access_token, p.id::text as project_id, p.name, p.hackatime_project
		from hackcast_projects p
		join users u on u.id = p.user_id
		join hackatime_connections c on c.user_id = p.user_id
		where p.hackatime_project is not null
	`;
	const byToken = new Map<string, Linked[]>();
	for (const row of rows) byToken.set(row.access_token, [...(byToken.get(row.access_token) ?? []), row]);

	const nowMs = Date.now();
	const seen: LiveProject[] = [];
	const activity: { projectId: string; day: string }[] = [];
	let unreachable = 0;
	let trackedSeconds = 0;

	await pool([...byToken.entries()], CONCURRENCY, async ([token, linked]) => {
		const remote = await fetchHackatimeProjects(token);
		if (!remote) {
			unreachable++;
			return;
		}
		const byName = new Map(remote.map((project) => [project.name, project]));
		for (const row of linked) {
			const project = byName.get(row.hackatime_project);
			if (!project) continue;
			trackedSeconds += project.totalSeconds;
			if (!project.lastHeartbeat) continue;
			seen.push({
				projectName: row.name,
				hackatimeProject: row.hackatime_project,
				builder: row.display_name,
				totalSeconds: project.totalSeconds,
				lastHeartbeat: project.lastHeartbeat
			});
			if (nowMs - project.lastHeartbeat.getTime() < 30 * 86_400_000) {
				activity.push({ projectId: row.project_id, day: project.lastHeartbeat.toISOString().slice(0, 10) });
			}
		}
	});

	await recordActivity(activity).catch(() => console.error('record activity failed'));
	const within = (ms: number) => seen.filter((project) => nowMs - project.lastHeartbeat.getTime() <= ms);
	return {
		checkedAt: new Date(nowMs),
		now: within(15 * 60_000).length,
		today: within(86_400_000).length,
		week: within(7 * 86_400_000).length,
		trackedSeconds,
		unreachable,
		workedOnToday: within(86_400_000).sort((a, b) => b.lastHeartbeat.getTime() - a.lastHeartbeat.getTime())
	};
}

/**
 * What builders are doing on Hackatime right now. Asks Hackatime once per
 * connected builder, so the answer is kept for a few minutes.
 */
export function liveActivity(refresh = false): Promise<LiveActivity> {
	if (!refresh && live && Date.now() - live.at < LIVE_TTL_MS) return live.value;
	const value = measure();
	live = { at: Date.now(), value };
	value.catch(() => {
		live = null;
	});
	return value;
}
