<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const LABEL = {
		pending: 'waiting',
		changes_requested: 'needs changes',
		rejected: 'rejected',
		approved: 'approved, not sent',
		sent: 'approved and sent'
	} as const;

	function waited(iso: string): string {
		const hours = (Date.now() - new Date(iso).getTime()) / 3_600_000;
		return hours < 48 ? `${Math.round(hours)}h` : `${(hours / 24).toFixed(1)}d`;
	}
	const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
</script>

<Seo title="Reviews | Hackcast" description="Hackcast review queue." />

<div class="admin">
	<h1>review queue</h1>
	{#if form?.message}<p class="note" role="status">{form.message}</p>{/if}

	{#if data.unavailable}
		<p>The queue isn't reachable right now.</p>
	{:else}
		<section class="block">
			<h2>waiting ({data.pending.length})</h2>
			{#if data.pending.length === 0}
				<p>Nothing waiting. Nice.</p>
			{:else}
				<table>
					<thead><tr><th>project</th><th>builder</th><th>kind</th><th>hours</th><th>waited</th><th></th></tr></thead>
					<tbody>
						{#each data.pending as item (item.id)}
							<tr>
								<td>{item.projectName}</td>
								<td>{item.builder}</td>
								<td>{item.kind}</td>
								<td class="num">{item.tracked}</td>
								<td class="num">{waited(item.submittedAt)}</td>
								<td><a class="redbtn small" href="/admin/reviews/{item.id}">review</a></td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</section>

		{#if data.unsent.length}
			<section class="block">
				<h2>approved, not sent to Airtable ({data.unsent.length})</h2>
				<table>
					<thead><tr><th>project</th><th>builder</th><th>approved</th><th></th></tr></thead>
					<tbody>
						{#each data.unsent as item (item.id)}
							<tr>
								<td><a href="/admin/reviews/{item.id}">{item.projectName}</a></td>
								<td>{item.builder}</td>
								<td class="num">{item.approved}</td>
								<td>
									<form method="POST" action="?/send">
										<input type="hidden" name="id" value={item.id} />
										<button class="redbtn small" type="submit">send to Airtable</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		{/if}

		<section class="block">
			<h2>recently decided</h2>
			<table>
				<thead><tr><th>project</th><th>builder</th><th>decision</th><th>hours</th><th>by</th><th>when</th></tr></thead>
				<tbody>
					{#each data.decided as item (item.id)}
						<tr>
							<td><a href="/admin/reviews/{item.id}">{item.projectName}</a></td>
							<td>{item.builder}</td>
							<td>{LABEL[item.status]}</td>
							<td class="num">{item.approved ?? '—'}</td>
							<td>{item.reviewer ?? ''}</td>
							<td>{item.decidedAt ? day(item.decidedAt) : ''}</td>
						</tr>
					{/each}
				</tbody>
			</table>
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
		overflow-x: auto;
	}
	h2 {
		margin: 0 0 0.4rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: 1.5rem;
		font-weight: 400;
		color: var(--ink);
	}
	.note {
		padding: 0.7rem 0.9rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		border-left: 10px solid var(--red);
		font-weight: 800;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 0.4rem 0.8rem 0.4rem 0;
		text-align: left;
		border-bottom: 1px solid #d9e3ec;
	}
	td a {
		color: var(--ink);
	}
	.num {
		font-family: 'Space Mono', monospace;
	}
	.small {
		padding: 0.3rem 0.6rem;
		font-size: 0.9rem;
		cursor: pointer;
	}
	form {
		margin: 0;
	}
</style>
