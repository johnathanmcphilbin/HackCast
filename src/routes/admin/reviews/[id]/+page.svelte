<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const s = $derived(data.submission);
	const LABEL = {
		pending: 'waiting for review',
		changes_requested: 'needs changes',
		rejected: 'rejected',
		approved: 'approved, not sent to Airtable',
		sent: 'approved and sent to Airtable'
	} as const;
	const DECISION = { approved: 'approved', changes_requested: 'asked for changes', rejected: 'rejected' } as const;
	const when = (iso: string) =>
		new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
</script>

<Seo title="{s.projectName} | Hackcast review" description="Review a Hackcast submission." />

<div class="admin">
	<p><a href="/admin/reviews">← back to the queue</a></p>
	<h1>{s.projectName}</h1>
	<p class="status">{LABEL[s.status]} · submitted {when(s.submittedAt)}</p>
	{#if form?.message}<p class="note" role="status">{form.message}</p>{/if}

	<div class="cols">
		<section class="block">
			<h2>the project</h2>
			<dl>
				<dt>builder</dt>
				<dd>{s.builderName}{s.builderSlackId ? ` · ${s.builderSlackId}` : ''}</dd>
				<dt>kind</dt>
				<dd>{s.kind}</dd>
				<dt>hours</dt>
				<dd>
					{s.tracked} {s.kind === 'software' ? `on Hackatime (${s.hackatimeProject}) when submitted` : 'from the build journal'}
					{#if data.live}<br />{data.live} on Hackatime now{/if}
				</dd>
				{#if data.languages.length}
					<dt>languages</dt>
					<dd>{data.languages.join(', ')}</dd>
				{/if}
				<dt>code</dt>
				<dd><a href={s.codeUrl} target="_blank" rel="noopener noreferrer">{s.codeUrl}</a></dd>
				<dt>demo</dt>
				<dd><a href={s.demoUrl} target="_blank" rel="noopener noreferrer">{s.demoUrl}</a></dd>
				{#if s.githubUsername}
					<dt>github</dt>
					<dd>{s.githubUsername}</dd>
				{/if}
				<dt>country</dt>
				<dd>{s.country}</dd>
			</dl>
			<p class="desc">{s.description}</p>
			<a href={s.screenshotUrl} target="_blank" rel="noopener noreferrer">
				<img src={s.screenshotUrl} alt="Screenshot of {s.projectName}" loading="lazy" />
			</a>
		</section>

		<section class="block">
			{#if s.status === 'pending'}
				<h2>decide</h2>
				<form method="POST" action="?/decide">
					<label class="choice"><input type="radio" name="decision" value="approved" required /> approve</label>
					<label>
						hours to approve
						<input name="approvedHours" type="number" min="0" max="500" step="0.1" value={s.trackedHours} />
					</label>
					<label class="choice"><input type="radio" name="decision" value="changes_requested" /> needs changes</label>
					<label class="choice"><input type="radio" name="decision" value="rejected" /> reject</label>
					<label>
						feedback for the builder
						<textarea name="feedback" maxlength="2000" placeholder="Needed for changes or a rejection. Goes to Airtable on approval."></textarea>
					</label>
					<button class="redbtn" type="submit">save decision</button>
				</form>
			{:else}
				<h2>decision</h2>
				<p>{LABEL[s.status]}{s.approved ? `, ${s.approved}` : ''}{s.reviewerName ? ` by ${s.reviewerName}` : ''}</p>
				{#if s.feedback}<p class="desc">{s.feedback}</p>{/if}
				{#if s.status === 'approved'}
					<form method="POST" action="?/send"><button class="redbtn" type="submit">send to Airtable</button></form>
				{/if}
				{#if s.status === 'rejected' && data.role === 'admin'}
					<form method="POST" action="?/requeue"><button class="redbtn" type="submit">move back to queue</button></form>
				{/if}
			{/if}

			{#if data.log.length}
				<h2 class="log-title">history</h2>
				<ul class="log">
					{#each data.log as entry (entry.decidedAt)}
						<li>
							<b>{entry.reviewerName}</b>
							{DECISION[entry.decision]}{entry.approved ? `, ${entry.approved}` : ''} · {when(entry.decidedAt)}
							{#if entry.feedback}<br /><span>{entry.feedback}</span>{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</div>

<style>
	.admin {
		width: min(1120px, calc(100% - 2rem));
		margin: 1rem auto 3rem;
		color: var(--text);
	}
	.admin > p a {
		color: var(--text);
		font-weight: 800;
	}
	h1 {
		margin: 0.4rem 0 0.2rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 400;
	}
	.status {
		font-weight: 800;
	}
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		gap: 1rem;
		align-items: start;
	}
	.block {
		padding: 1rem 1.1rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	h2 {
		margin: 0 0 0.5rem;
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
	dl {
		display: grid;
		grid-template-columns: 6.5rem 1fr;
		gap: 0.35rem 0.75rem;
		margin: 0 0 0.8rem;
	}
	dt {
		font-family: 'Space Mono', monospace;
		font-weight: 700;
		color: var(--red-text);
	}
	dd {
		margin: 0;
		font-weight: 700;
		overflow-wrap: anywhere;
	}
	dd a {
		color: var(--ink);
	}
	.desc {
		white-space: pre-wrap;
		font-weight: 600;
	}
	img {
		display: block;
		max-width: 100%;
		max-height: 420px;
		border: 3px solid var(--shadow);
	}
	form {
		display: grid;
		gap: 0.5rem;
	}
	label {
		display: grid;
		gap: 0.25rem;
		font-weight: 800;
	}
	.choice {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
	}
	input[type='number'],
	textarea {
		padding: 0.5rem 0.6rem;
		border: 3px solid var(--shadow);
		background: #fff;
		font: inherit;
		font-weight: 600;
	}
	textarea {
		min-height: 7rem;
	}
	button {
		justify-self: start;
		cursor: pointer;
	}
	.log-title {
		margin-top: 1.2rem;
	}
	.log {
		margin: 0;
		padding-left: 1.1rem;
		font-size: 0.92rem;
	}
	.log li {
		margin-bottom: 0.5rem;
	}
	@media (max-width: 820px) {
		.cols {
			grid-template-columns: 1fr;
		}
	}
</style>
