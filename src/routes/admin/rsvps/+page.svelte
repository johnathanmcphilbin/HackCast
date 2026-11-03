<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const questionCount = $derived(data.rows.filter((row) => row.question && row.question.trim()).length);
	const pickError = $derived(form && 'pickError' in form ? form.pickError : '');
</script>

<Seo title="RSVPs | Hackcast" description="Hackcast RSVP list." />

<div class="admin">
	<p class="kicker">the booth · list</p>
	<h1>rsvps</h1>
	{#if data.unavailable}
		<p>The list isn't reachable right now.</p>
	{:else}
		<p>{data.rows.length} on the list. {questionCount} in the hat.</p>
		<div class="tools">
			<a class="redbtn" href="/admin/rsvps.csv">download csv</a>
			<form method="POST" action="?/pick">
				<button class="redbtn" type="submit">pick a random question</button>
			</form>
		</div>
		{#if pickError}<p class="warn">{pickError}</p>{/if}
		{#if data.pick}
			<div class="picked">
				<p class="kicker ink">pulled from the hat</p>
				<blockquote>{data.pick.question}</blockquote>
				<p class="who">{data.pick.name} · {data.pick.email}</p>
				<p class="when">{data.pick.pickedAt}</p>
			</div>
		{:else}
			<p>nothing pulled yet. the draw only uses questions people actually sent.</p>
		{/if}
		<div class="sheet">
			<table>
				<thead>
					<tr>
						<th>name</th>
						<th>email</th>
						<th>question</th>
						<th>signed up</th>
						<th>slack</th>
						<th>status</th>
						<th>ysws</th>
					</tr>
				</thead>
				<tbody>
					{#each data.rows as row (`${row.email}|${row.createdAt}|${row.name}`)}
						<tr>
							<td>{row.name}</td>
							<td class="email">{row.email}</td>
							<td class="question">{row.question ?? ''}</td>
							<td class="when">{row.createdAt}</td>
							<td>{row.slackId ?? ''}</td>
							<td>{row.verificationStatus ?? ''}</td>
							<td>{row.yswsEligible === true ? 'yes' : row.yswsEligible === false ? 'no' : ''}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.admin {
		width: min(1100px, calc(100% - 2rem));
		margin: 1.5rem auto 3rem;
		color: var(--cream);
	}
	.kicker {
		font-family: 'Space Mono', monospace;
		font-weight: 700;
	}
	.kicker.ink {
		color: var(--ink);
		margin: 0;
	}
	h1 {
		margin: 0.3rem 0 0.8rem;
		font-family: 'Archivo Black', sans-serif;
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 400;
	}
	p {
		font-weight: 700;
	}
	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
		align-items: center;
		margin: 0.6rem 0 1rem;
	}
	button.redbtn {
		cursor: pointer;
		font-weight: 400;
	}
	.warn {
		display: inline-block;
		margin: 0 0 1rem;
		background: var(--red);
		color: #fff;
		font-weight: 800;
		padding: 0.35rem 0.6rem;
		border: 3px solid var(--shadow);
	}
	.picked {
		margin: 0 0 1.2rem;
		padding: 0.9rem 1rem 0.7rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		box-shadow: 6px 6px 0 var(--shadow);
	}
	.picked blockquote {
		margin: 0.45rem 0;
		font-family: 'Archivo Black', sans-serif;
		font-size: clamp(1.3rem, 2vw, 1.7rem);
		font-weight: 400;
		line-height: 1.25;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.who,
	.when {
		margin: 0.15rem 0;
	}
	.when {
		font-family: 'Space Mono', monospace;
		font-size: 0.85rem;
	}
	.sheet {
		overflow-x: auto;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		box-shadow: 6px 6px 0 var(--shadow);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-weight: 700;
	}
	th,
	td {
		padding: 0.55rem 0.7rem;
		text-align: left;
		border-bottom: 2px solid var(--shadow);
		color: var(--ink);
		vertical-align: top;
	}
	.email,
	.question {
		overflow-wrap: anywhere;
	}
	.question {
		min-width: 14rem;
		white-space: pre-wrap;
	}
</style>
