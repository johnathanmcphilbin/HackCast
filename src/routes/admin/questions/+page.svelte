<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const picked = $derived(data.people.flatMap((p) => p.questions.filter((q) => q.pickedHow).map((q) => ({ ...q, name: p.name }))));
</script>

<Seo title="Questions | Hackcast admin" description="Questions for the next guest, and the draw." />

<div class="admin">
	<h1>questions · episode {data.episode} · {data.guest}</h1>
	<p>
		Each hour-long episode asks the guest {data.perEpisode} questions, all from the community. The hours race leader
		gets a guaranteed question. Everyone else is in the hat with 5 free entries plus one per approved hour, so 3
		approved hours is 8 entries. Someone who asked more than one question stays in the hat until all of theirs are
		picked.
	</p>
	{#if form?.message}<p class="note" role="status">{form.message}</p>{/if}

	{#if data.unavailable}
		<p>The questions aren't reachable right now.</p>
	{:else}
		<section class="block">
			<h2>the draw</h2>
			<p>
				Guaranteed: {data.leader ? `${data.leader.name}, leading the hours race with ${data.leader.hours}` : 'nobody yet. Nobody has hours on a linked project.'}
			</p>
			<p class="count">
				{data.picked} of {data.perEpisode} picked.{data.picked >= data.perEpisode ? ' All picked.' : ''}
			</p>
			<div class="row">
				{#if data.picked < data.perEpisode}
					<form method="POST" action="?/draw"><button class="redbtn" type="submit">Draw a question</button></form>
					<form method="POST" action="?/fill"><button class="plain" type="submit">Draw the rest</button></form>
				{/if}
				{#if picked.length}
					<form method="POST" action="?/reset"><button class="plain" type="submit">Clear picks</button></form>
				{/if}
			</div>
			{#if picked.length}
				<h3>picked</h3>
				<ol>
					{#each picked as q (q.id)}
						<li><b>{q.name}</b> ({q.pickedHow}): {q.body}</li>
					{/each}
				</ol>
			{/if}
		</section>

		<section class="block">
			<h2>everyone who asked</h2>
			{#if data.people.length === 0}
				<p>No questions yet.</p>
			{:else}
				<table>
					<thead><tr><th>who</th><th>approved</th><th>entries</th><th>chance</th><th>questions</th></tr></thead>
					<tbody>
						{#each data.people as person (person.askerId)}
							<tr class:lead={person.guaranteed}>
								<td class="who">{person.name}</td>
								<td class="num">{person.approved}</td>
								<td class="num">{person.guaranteed ? 'guaranteed' : person.entries}</td>
								<td class="num">{person.chance == null ? '—' : `${person.chance}%`}</td>
								<td>
									<ul>
										{#each person.questions as q (q.id)}
											<li>
												{q.body}
												{#if q.pickedHow}<span class="tag">{q.pickedHow}</span>{/if}
												{#if person.guaranteed && !q.pickedHow && data.picked < data.perEpisode}
													<form method="POST" action="?/guarantee" class="inline">
														<input type="hidden" name="questionId" value={q.id} />
														<button type="submit">use this one</button>
													</form>
												{/if}
											</li>
										{/each}
									</ul>
								</td>
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
		font-size: clamp(1.8rem, 4.5vw, 2.8rem);
		font-weight: 400;
	}
	.admin > p {
		max-width: 50rem;
		font-weight: 700;
	}
	.note {
		padding: 0.7rem 0.9rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		border-left: 10px solid var(--red-text);
	}
	.block {
		margin: 1rem 0;
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
	h3 {
		margin: 1rem 0 0.3rem;
		font-size: 1rem;
	}
	.block p {
		font-weight: 700;
	}
	.block .count {
		font-family: 'Space Mono', monospace;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
		align-items: center;
	}
	.row form,
	.inline {
		margin: 0;
	}
	button {
		cursor: pointer;
	}
	.plain,
	.inline button {
		padding: 0.25rem 0.55rem;
		border: 2px solid var(--shadow);
		background: #fff;
		color: var(--ink);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.inline {
		display: inline;
		margin-left: 0.4rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 0.45rem 0.8rem 0.45rem 0;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid #d9e3ec;
	}
	tr.lead {
		background: #fde4f3;
	}
	.who {
		font-weight: 800;
		white-space: nowrap;
	}
	.num {
		font-family: 'Space Mono', monospace;
		white-space: nowrap;
	}
	td ul {
		margin: 0;
		padding-left: 1rem;
	}
	td li {
		margin-bottom: 0.3rem;
	}
	.tag {
		margin-left: 0.35rem;
		padding: 0 0.35rem;
		background: var(--red);
		color: var(--on-red);
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
	}
</style>
