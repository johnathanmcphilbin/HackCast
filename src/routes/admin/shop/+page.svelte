<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { redemptionStatuses } from '#lib/shop.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const filters = ['all', ...redemptionStatuses] as const;
	const href = (status: string) => (status === 'all' ? '/admin/shop' : `/admin/shop?status=${status}`);
	const current = $derived(data.status ?? 'all');
	const when = (iso: string) =>
		new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
</script>

<Seo title="Shop | Hackcast admin" description="Hackcast shop redemptions." />

<div class="admin">
	<h1>shop</h1>
	<p>Pending, approved, and fulfilled redemptions hold the hours. Rejected gives them back.</p>
	{#if data.saved}<p class="note" role="status">Status saved.</p>{/if}
	{#if form?.message}<p class="note" role="alert">{form.message}</p>{/if}

	{#if data.unavailable}
		<p>The shop list is not reachable right now.</p>
	{:else}
		{#if data.totals}
			<div class="tiles">
				<div class="tile"><b>{data.totals.reserved}</b><span>hours reserved</span></div>
				<div class="tile"><b>{data.totals.committed}</b><span>dollars committed</span></div>
				<div class="tile"><b>{data.totals.pending}</b><span>pending</span></div>
				<div class="tile"><b>{data.totals.approved}</b><span>approved</span></div>
				<div class="tile"><b>{data.totals.fulfilled}</b><span>fulfilled</span></div>
				<div class="tile"><b>{data.totals.rejected}</b><span>rejected</span></div>
			</div>
		{/if}

		<p class="filters">
			{#each filters as status (status)}
				<a href={href(status)} aria-current={current === status ? 'page' : undefined}>{status}</a>
			{/each}
		</p>

		<section class="block">
			<h2>redemptions ({data.rows.length})</h2>
			{#if data.rows.length === 0}
				<p>Nothing in this list.</p>
			{:else}
				<table>
					<thead>
						<tr>
							<th>when</th>
							<th>person</th>
							<th>item</th>
							<th>hours</th>
							<th>grant</th>
							<th>status</th>
							<th>note</th>
						</tr>
					</thead>
					<tbody>
						{#each data.rows as row (row.id)}
							<tr>
								<td class="num">{when(row.createdAt)}</td>
								<td>
									{row.name}
									{#if row.email}<br /><span class="fine">{row.email}</span>{/if}
								</td>
								<td>
									{row.title}
									{#if row.stackable}<span class="tag">credit</span>{/if}
									{#if row.question}<div class="fine">{row.question}</div>{/if}
									{#if row.address}<div class="fine">{row.address}</div>{/if}
								</td>
								<td class="num">{row.hours}</td>
								<td class="num">{row.grantLabel}</td>
								<td>
									<form method="POST" action="?/update">
										<input type="hidden" name="id" value={row.id} />
										<select name="status">
											{#each redemptionStatuses as status (status)}
												<option value={status} selected={row.status === status}>{status}</option>
											{/each}
										</select>
										<button class="redbtn small" type="submit">Save</button>
									</form>
								</td>
								<td>
									<form method="POST" action="?/update">
										<input type="hidden" name="id" value={row.id} />
										<input type="hidden" name="status" value={row.status} />
										<input name="note" maxlength="500" value={row.note ?? ''} placeholder="Note" />
										<button class="redbtn small" type="submit">Save note</button>
									</form>
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
	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.7rem;
		margin: 0.8rem 0;
	}
	.tile {
		padding: 0.7rem 0.8rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	.tile b {
		display: block;
		font-family: 'Space Mono', monospace;
		font-size: 1.2rem;
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.9rem;
		font-weight: 800;
	}
	.filters a {
		color: var(--ink);
	}
	.filters a[aria-current='page'] {
		background: var(--red);
		color: var(--on-red);
		padding: 0.1rem 0.35rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 0.45rem 0.7rem 0.45rem 0;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid #d9e3ec;
	}
	.num {
		font-family: 'Space Mono', monospace;
		white-space: nowrap;
	}
	.fine {
		font-size: 0.82rem;
		font-weight: 700;
	}
	.tag {
		margin-left: 0.35rem;
		padding: 0.05rem 0.3rem;
		background: var(--red);
		color: var(--on-red);
		font-family: 'Space Mono', monospace;
		font-size: 0.72rem;
	}
	form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		align-items: center;
	}
	select,
	input {
		padding: 0.3rem 0.4rem;
		border: 3px solid var(--shadow);
		background: #fff;
		color: var(--ink);
		font: inherit;
		font-weight: 700;
	}
	.small {
		padding: 0.25rem 0.45rem;
		font-size: 0.85rem;
	}
</style>
