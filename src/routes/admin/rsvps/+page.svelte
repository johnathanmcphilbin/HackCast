<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title="RSVPs | Hackcast" description="Hackcast RSVP list." />

<div class="admin">
	<p class="kicker">the booth · list</p>
	<h1>rsvps</h1>
	{#if data.unavailable}
		<p>The list isn't reachable right now.</p>
	{:else}
		<p>{data.rows.length} on the list.</p>
		<p><a class="redbtn" href="/admin/rsvps.csv">download csv</a></p>
		<div class="sheet">
			<table>
				<thead>
					<tr>
						<th>name</th>
						<th>email</th>
						<th>slack</th>
						<th>status</th>
						<th>ysws</th>
					</tr>
				</thead>
				<tbody>
					{#each data.rows as row (row.email + row.createdAt)}
						<tr>
							<td>{row.name}</td>
							<td>{row.email}</td>
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
		width: min(960px, calc(100% - 2rem));
		margin: 1.5rem auto 3rem;
		color: var(--cream);
	}
	.kicker {
		font-family: 'Space Mono', monospace;
		font-weight: 700;
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
	}
</style>
