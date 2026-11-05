<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// What the fields start with: what they just sent if it bounced, else their last try after "needs changes".
	const value = (key: string) => String(((form?.values ?? data.previous ?? {}) as Record<string, unknown>)[key] ?? '');
	let projectId = $state(value('projectId'));
	let kind = $state(value('kind') || 'software');
	const errors = $derived((form?.errors ?? {}) as Record<string, string | undefined>);

	const STATUS = {
		pending: 'waiting for review',
		changes_requested: 'needs changes',
		rejected: 'rejected',
		approved: 'approved',
		sent: 'approved'
	} as const;
	const open = $derived(data.projects.filter((project) => !project.status || project.status === 'changes_requested'));
	const chosen = $derived(data.projects.find((project) => project.id === projectId));
</script>

<Seo title="Submit | Hackcast" description="Send your Hackcast project in for review." />

<div class="booth">
	<p class="sign">the booth · submit</p>
	<h1>send it in.</h1>
	<p class="lede">A reviewer checks it and approves your hours. Approved hours go into the shop.</p>
	<p><a class="back" href="/dashboard">back to the dashboard</a></p>

	{#if form?.message}
		<p class="note" role="alert">{form.message}</p>
	{/if}
	{#if data.previous?.feedback}
		<p class="note" role="status">Reviewer asked for changes: {data.previous.feedback}</p>
	{/if}

	{#if data.unavailable}
		<p>The submission form isn't reachable right now. Try again in a minute.</p>
	{:else if data.projects.length === 0}
		<p>Add a HackCast project first.</p>
		<p><a class="redbtn" href="/onboarding?add=1">add a HackCast project</a></p>
	{:else if open.length === 0}
		<p>Every one of your projects is already in. Check how they're doing on your dashboard.</p>
	{:else}
		<form method="POST">
			<fieldset>
				<legend>the project</legend>
				{#each open as project (project.id)}
					<label class="choice">
						<input type="radio" name="projectId" value={project.id} bind:group={projectId} required />
						{project.name}
						<span class="meta">
							{project.hackatimeProject ? `Hackatime: ${project.hours ?? 'hours unavailable'}` : 'no Hackatime project'}
							{project.status ? ` · ${STATUS[project.status]}` : ''}
						</span>
					</label>
				{/each}
				{#if errors.projectId}<p class="err">{errors.projectId}</p>{/if}
				<p class="hint">Software hours come from Hackatime. Hardware hours come from your build journal.</p>
				<label class="choice"><input type="radio" name="kind" value="software" bind:group={kind} /> software</label>
				<label class="choice"><input type="radio" name="kind" value="hardware" bind:group={kind} /> hardware</label>
				{#if kind === 'software' && chosen && !chosen.hackatimeProject}
					<p class="err">Link a Hackatime project to {chosen.name} on your dashboard first.</p>
				{/if}
				{#if kind === 'hardware'}
					<label>
						hours from your journal
						<input name="claimedHours" type="number" min="0.5" max="500" step="0.5" value={value('claimedHours')} required />
						{#if errors.claimedHours}<span class="err">{errors.claimedHours}</span>{/if}
					</label>
				{/if}
				<label>
					what it is
					<textarea name="description" maxlength="2000" required>{value('description')}</textarea>
					{#if errors.description}<span class="err">{errors.description}</span>{/if}
				</label>
				<div class="grid">
					<label>
						open source code or design
						<input name="codeUrl" type="url" placeholder="https://github.com/..." value={value('codeUrl')} required />
						{#if errors.codeUrl}<span class="err">{errors.codeUrl}</span>{/if}
					</label>
					<label>
						working demo
						<input name="demoUrl" type="url" placeholder="https://..." value={value('demoUrl')} required />
						{#if errors.demoUrl}<span class="err">{errors.demoUrl}</span>{/if}
					</label>
					<label>
						screenshot or photo link
						<input name="screenshotUrl" type="url" placeholder="https://..." value={value('screenshotUrl')} required />
						{#if errors.screenshotUrl}<span class="err">{errors.screenshotUrl}</span>{/if}
					</label>
					<label>
						GitHub username
						<input name="githubUsername" value={value('githubUsername')} />
					</label>
				</div>
			</fieldset>

			<fieldset>
				<legend>you</legend>
				<p class="hint">Hack Club needs these to ship prizes. Your address and birthday are deleted from Hackcast once the project is approved and sent on.</p>
				<div class="grid">
					<label>
						first name
						<input name="firstName" autocomplete="given-name" value={value('firstName')} required />
						{#if errors.firstName}<span class="err">{errors.firstName}</span>{/if}
					</label>
					<label>
						last name
						<input name="lastName" autocomplete="family-name" value={value('lastName')} required />
						{#if errors.lastName}<span class="err">{errors.lastName}</span>{/if}
					</label>
					<label>
						birthday
						<input name="birthday" type="date" autocomplete="bday" value={value('birthday')} required />
						{#if errors.birthday}<span class="err">{errors.birthday}</span>{/if}
					</label>
				</div>
				<div class="grid">
					<label>
						address
						<input name="addressLine1" autocomplete="address-line1" value={value('addressLine1')} required />
						{#if errors.addressLine1}<span class="err">{errors.addressLine1}</span>{/if}
					</label>
					<label>
						address line 2
						<input name="addressLine2" autocomplete="address-line2" value={value('addressLine2')} />
					</label>
					<label>
						city
						<input name="city" autocomplete="address-level2" value={value('city')} required />
						{#if errors.city}<span class="err">{errors.city}</span>{/if}
					</label>
					<label>
						state, province or region
						<input name="state" autocomplete="address-level1" value={value('state')} required />
						{#if errors.state}<span class="err">{errors.state}</span>{/if}
					</label>
					<label>
						postal code
						<input name="postalCode" autocomplete="postal-code" value={value('postalCode')} required />
						{#if errors.postalCode}<span class="err">{errors.postalCode}</span>{/if}
					</label>
					<label>
						country
						<input name="country" autocomplete="country-name" value={value('country')} required />
						{#if errors.country}<span class="err">{errors.country}</span>{/if}
					</label>
				</div>
			</fieldset>
			<button class="redbtn" type="submit">submit for review →</button>
		</form>
	{/if}
</div>

<style>
	.booth {
		width: min(960px, calc(100% - 2rem));
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
		font-size: clamp(2.2rem, 5vw, 3.4rem);
		font-weight: 400;
		line-height: 1;
		color: var(--text);
	}
	.lede {
		margin: 0 0 0.7rem;
		max-width: 36rem;
		font-weight: 700;
	}
	.back {
		color: var(--text);
		font-family: 'Permanent Marker', sans-serif;
		font-size: 1.15rem;
	}
	.note {
		padding: 0.7rem 0.9rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		border-left: 10px solid var(--red);
		font-weight: 800;
	}
	form {
		display: grid;
		gap: 1rem;
		margin-top: 1rem;
	}
	fieldset {
		margin: 0;
		padding: 1rem 1.1rem 1.2rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	legend {
		padding: 0 0.3rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: 1.3rem;
	}
	.hint {
		margin: 0 0 0.6rem;
		font-size: 0.92rem;
		font-weight: 600;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 0.8rem 1rem;
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
		margin: 0.3rem 0;
	}
	input:not([type='radio']),
	textarea {
		padding: 0.55rem 0.7rem;
		border: 3px solid var(--shadow);
		background: #fff;
		color: var(--ink);
		font: inherit;
		font-weight: 600;
	}
	textarea {
		min-height: 7rem;
		resize: vertical;
	}
	.err {
		color: var(--red-text);
		font-size: 0.88rem;
	}
	.meta {
		font-family: 'Space Mono', monospace;
		font-size: 0.8rem;
	}
	button {
		justify-self: start;
		cursor: pointer;
	}
</style>
