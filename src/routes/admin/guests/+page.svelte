<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const CATEGORIES = [
		{ key: 'hq', title: 'Hack Club HQ' },
		{ key: 'outside', title: 'Outside Hack Club' }
	] as const;
	const SECTIONS = [
		{ key: 'new', title: 'to review' },
		{ key: 'shortlisted', title: 'shortlisted' },
		{ key: 'dismissed', title: 'dismissed' }
	] as const;
	const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
</script>

<Seo title="Guest requests | Hackcast admin" description="Review who builders want on the show." />

<div class="admin">
	<h1>guest votes · episode {data.episode}</h1>
	<p>
		Who builders want on episode {data.episode}. Everyone gets one vote for someone at HQ and one from outside.
		Spellings of the same name are matched and counted together, so capitals, punctuation and small typos don't split
		the vote. Shortlist the ones worth chasing, dismiss the rest.
	</p>
	{#if form?.message}<p class="note">{form.message}</p>{/if}

	{#if data.unavailable}
		<p>The requests aren't reachable right now.</p>
	{:else}
		<div class="cols">
			{#each CATEGORIES as category (category.key)}
				<section class="block">
					<h2>{category.title}</h2>
					{#each SECTIONS as section (section.key)}
						{@const rows = data.groups.filter((r) => r.category === category.key && r.status === section.key)}
						{#if rows.length || section.key === 'new'}
							<details open={section.key !== 'dismissed'}>
								<summary>{section.title} ({rows.length})</summary>
								{#if rows.length === 0}
									<p class="fine">Nothing new.</p>
								{:else}
									<ul class="list">
										{#each rows as row (row.ids[0])}
											<li>
												<div>
													<b>{row.name}</b>
													<span class="count">{row.votes} {row.votes === 1 ? 'vote' : 'votes'}</span>
													{#if row.spellings.length}
														<span class="fine">also typed: {row.spellings.join(', ')}</span>
													{/if}
													<span class="fine">{row.voters.join(', ')} · last {day(row.lastAt)}</span>
												</div>
												<form method="POST" action="?/status" class="actions">
													<input type="hidden" name="ids" value={row.ids.join(',')} />
													{#if row.status !== 'shortlisted'}
														<button name="status" value="shortlisted">shortlist</button>
													{/if}
													{#if row.status !== 'dismissed'}
														<button name="status" value="dismissed">dismiss</button>
													{/if}
													{#if row.status !== 'new'}
														<button name="status" value="new">back to review</button>
													{/if}
												</form>
											</li>
										{/each}
									</ul>
								{/if}
							</details>
						{/if}
					{/each}
				</section>
			{/each}
		</div>

		<section class="block">
			<h2>latest votes, as typed</h2>
			{#if data.latest.length === 0}
				<p class="fine">Nobody has voted yet.</p>
			{:else}
				<table>
					<thead><tr><th>guest</th><th>from</th><th>asked by</th><th>when</th></tr></thead>
					<tbody>
						{#each data.latest as item, i (i)}
							<tr>
								<td>{item.name}</td>
								<td>{item.category === 'hq' ? 'HQ' : 'outside'}</td>
								<td>{item.voter}</td>
								<td>{day(item.at)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
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
		margin: 0.4rem 0 0.4rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 400;
	}
	.admin > p {
		max-width: 46rem;
		font-weight: 700;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
		gap: 1rem;
	}
	.block {
		margin-bottom: 1rem;
		padding: 1rem 1.1rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		overflow-x: auto;
	}
	h2 {
		margin: 0 0 0.5rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: 1.5rem;
		font-weight: 400;
		color: var(--ink);
	}
	summary {
		margin: 0.5rem 0 0.3rem;
		font-weight: 800;
		cursor: pointer;
	}
	.list {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.list li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.8rem;
		align-items: center;
		justify-content: space-between;
		padding: 0.45rem 0;
		border-bottom: 1px solid #d9e3ec;
	}
	.count {
		margin-left: 0.3rem;
		padding: 0 0.35rem;
		background: var(--red);
		color: var(--on-red);
		font-family: 'Space Mono', monospace;
		font-size: 0.8rem;
	}
	.fine {
		display: block;
		font-size: 0.82rem;
		color: #4a5a6e;
	}
	.actions {
		display: flex;
		gap: 0.35rem;
		margin: 0;
	}
	.actions button {
		padding: 0.2rem 0.5rem;
		border: 2px solid var(--shadow);
		background: #fff;
		color: var(--ink);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 700;
		cursor: pointer;
	}
	.note {
		font-weight: 800;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 0.35rem 0.8rem 0.35rem 0;
		text-align: left;
		border-bottom: 1px solid #d9e3ec;
	}
</style>
