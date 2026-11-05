<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const notices = {
		connected: 'Hackatime is connected. Link the project you are building for HackCast.',
		denied: "Hackatime wasn't connected.",
		failed: "That connection didn't land. Try again.",
		taken: 'That Hackatime account is already connected to another Hackcast login.',
		soon: "Hackatime sign-in isn't set up on this server."
	} as const;
</script>

<Seo title="Add a HackCast project" description="Link a Hackatime project to HackCast." />

<div class="booth">
	<p class="sign">hackcast</p>
	<h1>add a HackCast project.</h1>
	<p class="lede">Signed in as {data.firstName}. Pick one of your top Hackatime projects, or start a new one.</p>

	{#if data.notice}
		<p class="note" role="status">{notices[data.notice]}</p>
	{/if}
	{#if form?.message}
		<p class="note" role="alert">{form.message}</p>
	{/if}

	{#if data.unavailable}
		<p>We couldn't load your Hackatime connection.</p>
	{:else if !data.connected}
		<p>Hackatime connects as part of sign-in. Continue to finish that step.</p>
		<p><a class="redbtn" href="/auth/hackatime?next=/onboarding">continue</a></p>
	{:else}
		{#if data.linked.length > 0}
			<p>Already in HackCast: {data.linked.map((project) => project.name).join(', ')}</p>
		{/if}
		{#if data.projects.length > 0}
			<form method="POST" action="?/pick" class="box">
				<fieldset>
					<legend>your top Hackatime projects</legend>
					{#each data.projects as project (project.name)}
						<label>
							<input type="radio" name="project" value={project.name} required />
							{project.name}
							<span class="hours">{project.hours}</span>
						</label>
					{/each}
				</fieldset>
				<button class="redbtn" type="submit">add to HackCast</button>
			</form>
		{/if}
		<form method="POST" action="?/create" class="box">
			<h2>{data.projects.length > 0 ? 'or start a new project' : 'start a new project'}</h2>
			<p>Name it now. Link a Hackatime project to it from your dashboard once you've logged some hours.</p>
			<label class="new-name">
				project name
				<input name="projectName" maxlength="200" autocomplete="off" required />
			</label>
			<button class="redbtn" type="submit">create HackCast project</button>
		</form>
	{/if}
</div>

<style>
	.booth {
		width: min(720px, calc(100% - 2rem));
		margin: 1.4rem auto 3rem;
		color: var(--text);
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
		margin: 0.55rem 0 0.4rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: clamp(2rem, 5vw, 3.1rem);
		font-weight: 400;
		line-height: 1;
	}
	.lede,
	p {
		max-width: 38rem;
		font-weight: 700;
		line-height: 1.45;
	}
	.note {
		padding: 0.7rem 0.9rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		border-left: 10px solid var(--red);
		font-weight: 800;
	}
	.box {
		margin: 1rem 0 0;
		padding: 1rem 1.1rem 1.2rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend,
	.box h2 {
		margin: 0 0 0.3rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: 1.4rem;
		font-weight: 400;
		color: var(--ink);
	}
	label {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
		margin: 0.45rem 0;
		font-weight: 800;
	}
	.hours {
		font-family: 'Space Mono', monospace;
		font-size: 0.85rem;
	}
	.new-name {
		flex-direction: column;
		align-items: stretch;
		max-width: 28rem;
		margin-top: 1rem;
	}
	.new-name input {
		margin-top: 0.3rem;
		padding: 0.55rem 0.7rem;
		border: 3px solid var(--shadow);
		font: inherit;
		font-weight: 700;
	}
	button {
		margin-top: 0.8rem;
		cursor: pointer;
	}
</style>
