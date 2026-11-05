<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title="Questions | Hackcast admin" description="Questions for the next guest." />

<div class="admin">
	<h1>questions for {data.guest}</h1>
	<p>Most hours first. The top asker's question is the guaranteed one when hours lock.</p>
	<section class="block">
		{#if data.unavailable}
			<p>The questions aren't reachable right now.</p>
		{:else if data.questions.length === 0}
			<p>No questions yet.</p>
		{:else}
			<table>
				<thead><tr><th>question</th><th>asked by</th><th>their hours</th></tr></thead>
				<tbody>
					{#each data.questions as question, i (i)}
						<tr>
							<td>{question.body}</td>
							<td>{question.asker}</td>
							<td class="num">{question.hours}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
</div>

<style>
	.admin {
		width: min(1120px, calc(100% - 2rem));
		margin: 1rem auto 3rem;
		color: var(--text);
	}
	h1 {
		margin: 0.4rem 0 0.4rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 400;
	}
	.admin > p {
		font-weight: 700;
	}
	.block {
		margin: 1rem 0;
		padding: 1rem 1.1rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 0.4rem 0.8rem 0.4rem 0;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid #d9e3ec;
	}
	.num {
		font-family: 'Space Mono', monospace;
		white-space: nowrap;
	}
</style>
