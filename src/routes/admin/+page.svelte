<script lang="ts">
	import BarChart from '#lib/components/BarChart.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const BLUE = '#2f6db5';
	const RED = '#c2338f';

	const hours = (seconds: number) => `${(seconds / 3600).toFixed(1)}h`;
	function wait(seconds: number | null): string {
		if (seconds == null) return '—';
		if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
		if (seconds < 172_800) return `${(seconds / 3600).toFixed(1)}h`;
		return `${(seconds / 86_400).toFixed(1)}d`;
	}
	function ago(iso: string): string {
		const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
		if (minutes < 60) return `${minutes}m ago`;
		return `${Math.round(minutes / 60)}h ago`;
	}
	const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
	const s = $derived(data.stats);
	const active = $derived(s?.activeByDay ?? []);
	const activeToday = $derived(active.at(-1));
	const activeWeek = $derived(active.slice(-7).reduce((sum, d) => sum + d.value, 0) / 7);
	const activePeak = $derived(active.reduce((best, d) => (d.value > best.value ? d : best), { day: '', value: 0 }));
	const decisions = $derived(
		s ? s.hours.approvedDecisions + s.hours.changesDecisions + s.hours.rejectedDecisions : 0
	);
</script>

<Seo title="Admin | Hackcast" description="Hackcast admin." />

<div class="admin">
	<h1>admin</h1>

	<section class="block">
		<h2>right now</h2>
		{#if data.live}
			<p class="checked">
				checked {new Date(data.live.checkedAt).toLocaleTimeString()} · <a href="/admin?refresh=1">check again</a>
			</p>
			<div class="tiles">
				<div class="tile"><b>{data.live.now}</b><span>projects being worked on now</span><small>last 15 min</small></div>
				<div class="tile"><b>{data.live.today}</b><span>worked on today</span><small>last 24h</small></div>
				<div class="tile"><b>{data.live.week}</b><span>this week</span></div>
				{#if s}
					<div class="tile">
						<b>{s.connected.projects}</b><span>Hackatime projects connected</span>
						<small>by {s.connected.builders} builders</small>
					</div>
				{/if}
				<div class="tile"><b>{hours(data.live.trackedSeconds)}</b><span>tracked on connected projects</span></div>
			</div>
			<details class="list">
				<summary>worked on in the last 24 hours ({data.live.workedOnToday.length})</summary>
				{#if data.live.unreachable > 0}
					<p>Couldn't reach Hackatime for {data.live.unreachable} builders, so they're not counted.</p>
				{/if}
				<table>
					<thead><tr><th>project</th><th>builder</th><th>hours</th><th>last coded</th></tr></thead>
					<tbody>
						{#each data.live.workedOnToday as project (project.builder + project.hackatimeProject)}
							<tr>
								<td>{project.projectName}</td>
								<td>{project.builder}</td>
								<td class="num">{hours(project.totalSeconds)}</td>
								<td>{ago(project.lastHeartbeat)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</details>
		{:else}
			<p>Couldn't reach Hackatime right now. <a href="/admin?refresh=1">Try again</a>.</p>
		{/if}
	</section>

	{#if !s}
		<p>The stats aren't reachable right now.</p>
	{:else}
		<div class="tiles">
			{#each s.funnel.filter((step) => step.label !== 'Added a project') as step (step.label)}
				<div class="tile"><b>{step.value}</b><span>{step.label.toLowerCase()}</span></div>
			{/each}
			<div class="tile"><b>{s.review.waiting}</b><span>waiting for review</span></div>
		</div>

		<section class="block">
			<h2>daily active projects</h2>
			<p>
				{activeToday?.value ?? 0} today, by {activeToday?.extra ?? 0} builders · {activeWeek.toFixed(1)} a day this week
				{#if activePeak.value}· {activePeak.value} at most, {activePeak.day}{/if}
			</p>
			<BarChart
				days={active.map((d) => d.day)}
				series={[{ name: 'projects', color: BLUE, values: active.map((d) => d.value) }]}
				label="Projects with coding time each day, last 30 days"
				detail={(i) => `${active[i].extra ?? 0} builders`}
			/>
			<p class="fine">
				HackCast projects with coding time on Hackatime that day (UTC). Counted each time this page checks Hackatime,
				so days before the admin page was first opened stay empty.
			</p>
		</section>

		<section class="block">
			<h2>sign-up funnel</h2>
			<ol class="funnel">
				{#each s.funnel as step, i (step.label)}
					<li>
						<span class="label">{step.label}</span>
						<span class="bar"><span style:width="{pct(step.value, s.funnel[0].value)}%"></span></span>
						<span class="num">{step.value}</span>
						<span class="pct">
							{pct(step.value, s.funnel[0].value)}%{#if i > 0 && s.funnel[i - 1].value > 0}{` · ${pct(step.value, s.funnel[i - 1].value)}% of previous`}{/if}
						</span>
					</li>
				{/each}
			</ol>
		</section>

		<section class="block">
			<h2>submissions, last 30 days</h2>
			<p>
				submitted {s.submissionsByDay.reduce((sum, d) => sum + d.submitted, 0)} · decided
				{s.submissionsByDay.reduce((sum, d) => sum + d.decided, 0)}
			</p>
			<BarChart
				days={s.submissionsByDay.map((d) => d.day)}
				series={[
					{ name: 'submitted', color: BLUE, values: s.submissionsByDay.map((d) => d.submitted) },
					{ name: 'decided', color: RED, values: s.submissionsByDay.map((d) => d.decided) }
				]}
				label="Submissions and decisions per day, last 30 days"
			/>
		</section>

		<section class="block">
			<h2>Hackatime projects connected</h2>
			<p>{s.connected.projects} connected now · +{s.connected.lastWeek} in the last 7 days</p>
			<BarChart
				days={s.connected.overTime.map((d) => d.day)}
				series={[{ name: 'connected', color: BLUE, values: s.connected.overTime.map((d) => d.value) }]}
				label="HackCast projects with a Hackatime project linked, running total"
			/>
			<p class="fine">Running total of HackCast projects with a Hackatime project linked, by the day it was linked.</p>
		</section>

		<section class="block">
			<h2>review speed</h2>
			<div class="tiles">
				<div class="tile"><b>{s.review.waiting}</b><span>waiting now</span></div>
				<div class="tile"><b>{wait(s.review.oldestWaitSeconds)}</b><span>oldest has waited</span></div>
				<div class="tile">
					<b>{wait(s.review.medianWaitSeconds)}</b><span>typical wait for a decision</span>
					<small>median, average {wait(s.review.averageWaitSeconds)}</small>
				</div>
				<div class="tile">
					<b>{s.review.decidedWeek} / {s.review.submittedWeek}</b><span>decided / submitted</span><small>last 7 days</small>
				</div>
			</div>
			{#if s.review.byReviewer.length}
				<p>
					Decisions by reviewer: {s.review.byReviewer.map((r) => `${r.name} ${r.count}`).join(' · ')}
				</p>
			{/if}
		</section>

		<section class="block">
			<h2>hours</h2>
			<div class="tiles">
				<div class="tile">
					<b>{hours(s.hours.approvedSeconds)}</b><span>approved</span>
					<small>from {hours(s.hours.trackedSeconds)} tracked on those projects</small>
				</div>
				<div class="tile">
					<b>{s.hours.trackedSeconds ? 100 - pct(s.hours.approvedSeconds, s.hours.trackedSeconds) : 0}%</b>
					<span>cut on review</span><small>tracked hours not approved</small>
				</div>
				<div class="tile">
					<b>{s.hours.approvedDecisions} / {decisions}</b><span>decisions approved</span>
					<small>{s.hours.changesDecisions} needs changes · {s.hours.rejectedDecisions} rejected</small>
				</div>
			</div>
			<table>
				<thead><tr><th></th><th>submissions</th><th>approved</th><th>hours approved</th></tr></thead>
				<tbody>
					{#each s.hours.byKind as row (row.kind)}
						<tr>
							<td>{row.kind}</td>
							<td class="num">{row.submissions}</td>
							<td class="num">{row.approved}</td>
							<td class="num">{hours(row.approvedSeconds)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section class="block">
			<h2>where people are from</h2>
			{#if s.countries.length}
				<table>
					<tbody>
						{#each s.countries as row (row.country)}
							<tr><td>{row.country}</td><td class="num">{row.count}</td></tr>
						{/each}
					</tbody>
				</table>
			{/if}
			<p class="fine">From the country on each person's latest submission · {s.countriesKnown} known</p>
		</section>
	{/if}
</div>

<style>
	.admin {
		width: min(1120px, calc(100% - 2rem));
		margin: 1rem auto 3rem;
		color: var(--text);
	}
	h1 {
		margin: 0.4rem 0 0.8rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 400;
	}
	.block {
		margin: 1rem 0;
		padding: 1rem 1.1rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	h2 {
		margin: 0 0 0.4rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: 1.5rem;
		font-weight: 400;
		color: var(--ink);
	}
	.checked,
	.fine {
		font-size: 0.85rem;
		color: #4a5a6e;
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 0.7rem;
		margin: 0.6rem 0;
	}
	.tile {
		display: grid;
		align-content: start;
		gap: 0.15rem;
		padding: 0.7rem 0.8rem;
		background: #fff;
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	.tile b {
		font-family: 'Permanent Marker', sans-serif;
		font-size: 2rem;
		font-weight: 400;
		line-height: 1;
	}
	.tile span {
		font-weight: 800;
	}
	.tile small {
		color: #4a5a6e;
		font-weight: 600;
	}
	.funnel {
		display: grid;
		gap: 0.45rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.funnel li {
		display: grid;
		grid-template-columns: 11rem 1fr 3.5rem 12rem;
		gap: 0.6rem;
		align-items: center;
		font-weight: 700;
	}
	.funnel .bar {
		height: 0.8rem;
		background: #e3ecf4;
	}
	.funnel .bar span {
		display: block;
		height: 100%;
		background: #2f6db5;
		border-radius: 0 4px 4px 0;
	}
	.pct {
		font-size: 0.8rem;
		color: #4a5a6e;
	}
	table {
		border-collapse: collapse;
		margin-top: 0.4rem;
	}
	th,
	td {
		padding: 0.3rem 1rem 0.3rem 0;
		text-align: left;
		border-bottom: 1px solid #d9e3ec;
	}
	.num {
		font-family: 'Space Mono', monospace;
		text-align: right;
	}
	.list summary {
		cursor: pointer;
		font-weight: 800;
	}
	@media (max-width: 720px) {
		.funnel li {
			grid-template-columns: 1fr 3rem;
		}
		.funnel .bar,
		.funnel .pct {
			grid-column: 1 / -1;
		}
	}
</style>
