<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<Seo title="Team | Hackcast admin" description="Hackcast admins and reviewers." />

<div class="admin">
	<h1>team</h1>
	{#if form?.message}<p class="note" role="status">{form.message}</p>{/if}

	<section class="block">
		<h2>add someone</h2>
		<p>Reviewers can open the review queue. Admins also see the stats, the team and the RSVP list. They can be added before they've signed in.</p>
		<form method="POST" action="?/add" class="add">
			<label>
				Hack Club email
				<input name="email" type="email" required />
			</label>
			<label>
				role
				<select name="role">
					<option value="reviewer">reviewer</option>
					<option value="admin">admin</option>
				</select>
			</label>
			<button class="redbtn" type="submit">add</button>
		</form>
	</section>

	<section class="block">
		<h2>staff</h2>
		{#if data.unavailable}
			<p>The team list isn't reachable right now.</p>
		{:else}
			<table>
				<thead><tr><th>email</th><th>name</th><th>role</th><th></th></tr></thead>
				<tbody>
					{#each data.fixed as email (email)}
						<tr><td>{email}</td><td></td><td>admin</td><td class="fine">set on the server</td></tr>
					{/each}
					{#each data.staff as member (member.email)}
						<tr>
							<td>{member.email}</td>
							<td>{member.displayName}</td>
							<td>{member.role}</td>
							<td>
								<form method="POST" action="?/remove">
									<input type="hidden" name="email" value={member.email} />
									<button type="submit">remove</button>
								</form>
							</td>
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
	.add {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
		align-items: end;
	}
	label {
		display: grid;
		gap: 0.25rem;
		font-weight: 800;
	}
	input,
	select {
		padding: 0.5rem 0.6rem;
		border: 3px solid var(--shadow);
		background: #fff;
		font: inherit;
		font-weight: 600;
	}
	button {
		cursor: pointer;
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
	.fine {
		font-size: 0.85rem;
		color: #4a5a6e;
	}
	form {
		margin: 0;
	}
</style>
