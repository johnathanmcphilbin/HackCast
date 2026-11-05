<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { hackatimeContinueHref, hackatimeStatusCopy } from '#lib/hackatime-recovery.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const connectHref = $derived(hackatimeContinueHref(data.notice, data.ready));
</script>

<Seo title="Dashboard | Hackcast" description="Your Hackcast booth: Hackatime hours and the submission form." />

<div class="booth">
	<header class="head">
		<div>
			<p class="sign">the booth</p>
			<h1>hello, {data.firstName}.</h1>
			<p class="lede">Log the hours on Hackatime, then send the project in.</p>
		</div>
		<a class="redbtn ship" href="/submit">submit your project →</a>
	</header>

	{#if data.notice}
		<p class="note" role="status">{hackatimeStatusCopy(data.notice, 'dashboard')}</p>
	{/if}
	{#if data.submitted}
		<p class="note" role="status">Sent in. A reviewer will look at it soon.</p>
	{/if}
	{#if data.approvedHours}
		<p class="balance"><span>{data.approvedHours}</span> approved hours to spend in the shop</p>
	{/if}

	<section class="panel" aria-labelledby="ht-title">
		<h2 id="ht-title">your HackCast project</h2>
		{#if data.unavailable}
			<p>We couldn't load your HackCast project.</p>
		{:else if !data.ready || !data.connected}
			{#if !data.ready}
				<p>Hackatime sign-in isn't set up on this server. You can still start a HackCast project.</p>
			{:else if !data.notice}
				<p>Hackatime isn't connected yet. Connect it later, or keep going without it.</p>
			{/if}
			<p class="action">
				{#if connectHref}
					<a class="redbtn" href={connectHref}>connect Hackatime</a>
				{/if}
				<a class="redbtn" href="/onboarding?add=1">
					{data.linked.length === 0 ? 'start a project without Hackatime' : 'add a HackCast project'}
				</a>
				{#if data.notice === 'taken'}
					<a href="/auth/logout">sign out and use the other account</a>
				{/if}
			</p>
			{#if data.linked.length > 0}
				<ul class="linked">
					{#each data.linked as project (project.id)}
						<li><span class="tag">HackCast</span>{project.name}</li>
					{/each}
				</ul>
			{/if}
		{:else}
			{#if data.linked.length === 0}
				<p>No HackCast project yet. Link the Hackatime project you're building.</p>
				<p class="action"><a class="redbtn" href="/onboarding?add=1">add a HackCast project</a></p>
			{:else}
				{#if form?.message}
					<p class="note" role="alert">{form.message}</p>
				{/if}
				<ul class="linked">
					{#each data.linked as project (project.id)}
						<li>
							<span class="tag">HackCast</span>{project.name}
							{#if data.reviews[project.id]}
								{@const review = data.reviews[project.id]}
								<span class="review {review.status}">
									{#if review.status === 'pending'}
										waiting for review
									{:else if review.status === 'changes_requested'}
										needs changes: {review.feedback}
										<a href="/submit?project={project.id}">edit and resubmit</a>
									{:else if review.status === 'rejected'}
										not approved{review.feedback ? `: ${review.feedback}` : ''}
									{:else}
										approved, {review.approvedHours}
									{/if}
								</span>
							{/if}
							{#if project.hackatimeProject && project.hackatimeProject !== project.name}
								<span class="tracks">tracks {project.hackatimeProject} on Hackatime</span>
							{:else if !project.hackatimeProject}
								{#if data.projects && data.projects.length > 0}
									<form method="POST" action="?/link" class="attach">
										<input type="hidden" name="projectId" value={project.id} />
										<label>
											<span class="visually-hidden">Hackatime project for {project.name}</span>
											<select name="hackatimeProject" required>
												<option value="">link a Hackatime project…</option>
												{#each data.projects as option (option.name)}
													<option value={option.name}>{option.name} ({option.hours})</option>
												{/each}
											</select>
										</label>
										<button type="submit">link</button>
									</form>
								{:else}
									<span class="tracks">no Hackatime project yet. Log some hours, then link it here.</span>
								{/if}
							{/if}
						</li>
					{/each}
				</ul>
				<p class="again"><a href="/onboarding?add=1">add another HackCast project</a></p>
			{/if}
			<dl class="profile">
				{#if data.email}
					<dt>email</dt>
					<dd>{data.email}</dd>
				{/if}
				{#if data.githubUsername}
					<dt>github</dt>
					<dd>{data.githubUsername}</dd>
				{/if}
				{#if data.hackatimeUserId}
					<dt>hackatime</dt>
					<dd>{data.hackatimeUserId}</dd>
				{/if}
			</dl>
			{#if data.projects === null}
				<p>Hours aren't reachable right now.</p>
			{:else if data.projects.length === 0}
				<p>No project hours yet.</p>
			{:else}
				{#if data.totalHours}<p class="total">{data.totalHours} tracked</p>{/if}
				<table>
					<caption class="visually-hidden">Project hours from Hackatime</caption>
					<thead>
						<tr>
							<th>project</th>
							<th class="num">hours</th>
						</tr>
					</thead>
					<tbody>
						{#each data.projects as project (project.name)}
							<tr>
								<td>
									{project.name}
									{#if project.languages}<span class="langs">{project.languages}</span>{/if}
								</td>
								<td class="num hours">{project.hours}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
			<p class="again"><a href="/auth/hackatime?next=/dashboard">reconnect Hackatime</a></p>
		{/if}
	</section>
</div>

<style>
	.booth {
		width: min(880px, calc(100% - 2rem));
		margin: 1.4rem auto 3rem;
		color: var(--text);
	}
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem 1.5rem;
		margin-bottom: 1.15rem;
	}
	.sign {
		display: inline-block;
		margin: 0;
		padding: 0.35rem 0.7rem;
		background: #6b3f24;
		color: #f6e6cf;
		border: 3px solid var(--shadow);
		font-family: Bungee, sans-serif;
		font-size: 0.78rem;
	}
	h1 {
		margin: 0.55rem 0 0.35rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: clamp(2.2rem, 5vw, 3.4rem);
		font-weight: 400;
		line-height: 1;
		color: var(--text);
	}
	.lede,
	.panel p {
		margin: 0 0 0.75rem;
		max-width: 36rem;
		font-weight: 700;
		line-height: 1.45;
	}
	.lede {
		margin: 0;
		color: var(--text);
	}
	.ship {
		font-size: 1.25rem;
		padding: 0.8rem 1.1rem;
	}
	.note {
		margin: 0 0 1rem;
		padding: 0.7rem 0.9rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		border-left-width: 10px;
		border-left-color: var(--red-text);
		font-weight: 800;
	}
	.panel {
		padding: 1rem 1.1rem 1.15rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	.panel h2 {
		margin: 0 0 0.55rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: 1.8rem;
		font-weight: 400;
		color: var(--ink);
	}
	.action {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		align-items: center;
		margin: 0.2rem 0 0;
	}
	.linked {
		list-style: none;
		margin: 0 0 0.6rem;
		padding: 0;
	}
	.linked li {
		margin: 0 0 0.45rem;
		font-weight: 800;
	}
	.balance {
		margin: 0 0 1rem;
		font-weight: 800;
	}
	.balance span {
		font-family: 'Permanent Marker', sans-serif;
		font-size: 1.6rem;
		margin-right: 0.3rem;
	}
	.review {
		display: block;
		margin-top: 0.2rem;
		font-size: 0.9rem;
		font-weight: 700;
	}
	.review.changes_requested,
	.review.rejected {
		color: var(--red-text);
	}
	.tracks {
		display: block;
		margin-top: 0.2rem;
		font-family: 'Space Mono', monospace;
		font-size: 0.8rem;
		font-weight: 700;
	}
	.attach {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.35rem;
	}
	.attach select,
	.attach button {
		padding: 0.35rem 0.5rem;
		border: 3px solid var(--shadow);
		background: #fff;
		color: var(--ink);
		font: inherit;
		font-weight: 700;
	}
	.attach button {
		cursor: pointer;
	}
	.tag {
		display: inline-block;
		margin-right: 0.4rem;
		padding: 0.1rem 0.35rem;
		background: var(--red);
		color: var(--on-red);
		font-family: 'Space Mono', monospace;
		font-size: 0.72rem;
	}
	.profile {
		display: grid;
		grid-template-columns: 7.5rem 1fr;
		gap: 0.35rem 0.75rem;
		margin: 0 0 1rem;
	}
	.profile dt {
		font-family: 'Space Mono', monospace;
		font-weight: 700;
		color: var(--red-text);
	}
	.profile dd {
		margin: 0;
		font-weight: 800;
		overflow-wrap: anywhere;
	}
	.total,
	.hours,
	.langs,
	th {
		font-family: 'Space Mono', monospace;
		font-weight: 700;
	}
	.total {
		color: var(--red-text);
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 0.5rem 0.15rem;
		text-align: left;
		vertical-align: baseline;
		border-bottom: 2px solid var(--shadow);
		font-weight: 800;
	}
	th {
		font-size: 0.78rem;
	}
	.num {
		text-align: right;
		white-space: nowrap;
	}
	.hours {
		color: var(--red-text);
	}
	.langs {
		display: block;
		margin-top: 0.15rem;
		font-size: 0.78rem;
	}
	.again {
		margin: 0.9rem 0 0;
	}
	.again a {
		color: var(--ink);
		font-weight: 800;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	@media (max-width: 800px) {
		.head .ship {
			display: flex;
			justify-content: center;
			width: 100%;
			box-sizing: border-box;
		}
	}
</style>
