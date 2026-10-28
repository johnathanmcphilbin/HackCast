<script lang="ts">
	import { enhance } from '$app/forms';
	import { dev } from '$app/env';
	import { joinPerks } from '#lib/content.ts';
	import Seo from '#lib/components/Seo.svelte';
	import DisplayHeading from '#lib/components/DisplayHeading.svelte';
	import Frame from '#lib/components/Frame.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);

	const values = $derived(form && 'values' in form ? form.values : undefined);
	const errors: Record<string, string | undefined> = $derived(
		form && 'errors' in form && form.errors ? form.errors : {}
	);
	const message = $derived(form && 'message' in form ? form.message : null);
	const succeeded = $derived(form && 'success' in form && form.success);
</script>

<Seo
	title="Join Hackcast"
	description="Sign up for Hackcast. Build projects, earn shop credit for approved hours, and spend hours on the weekly show."
/>

<div class="page">
	{#if succeeded && form && 'name' in form}
		<Frame>
			<div class="success">
			<span class="tag tag-acid">Transmission received</span>
			<DisplayHeading
				as="h1"
				size="lg"
				lines={[
					{ text: 'Welcome' },
					{ parts: [{ text: 'aboard, ' }, { text: `${form.name}.`, accent: true }] }
				]}
			/>
			<span class="rule" aria-hidden="true"></span>
			<p class="confirm">You're on the list. We'll email you everything you need to start building and logging hours.</p>
			<a class="btn-hit btn-secondary" href="/faq">
				<span class="btn-face">Read the FAQ <span aria-hidden="true">→</span></span>
			</a>
			</div>
		</Frame>
	{:else}
		<p class="kicker slash">// Join</p>
		<div class="grid">
			<div class="pitch">
				<DisplayHeading
					as="h1"
					size="xl"
					lines={[{ text: 'Get on' }, { text: 'the' }, { text: 'show.', accent: true }]}
				/>
				<p class="lede">Sign up and we'll send you everything you need to start building and logging hours.</p>
				<span class="ticks" aria-hidden="true"><i></i><i></i><i></i></span>
				<ol>
					{#each joinPerks as perk (perk.n)}
						<li>
							<span>{perk.n}</span>
							{perk.text}
						</li>
					{/each}
				</ol>
			</div>

			<div class="art" aria-hidden="true">
				<img src="/brand/skyline.png" alt="" width="1920" height="1080" />
			</div>

			<div class="form-col">
				{#if !data.signupsOpen}
					<div class="banner" role="note">
						<span class="tag tag-acid">Status: not open yet</span>
						<p>Signups aren't open yet. The form below is a preview.</p>
						{#if dev}
							<p class="dev">
								Dev: set <code>SIGNUP_WEBHOOK_URL</code> in <code>.env</code> to enable this form. See
								<code>.env.example</code>.
							</p>
						{/if}
					</div>
				{/if}

				<form
					method="POST"
					class="slip"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update({ reset: false });
							submitting = false;
						};
					}}
					novalidate
				>
					<div class="slip-head">
						<p class="kicker">Hackcast signup slip // Form-01</p>
						<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
					</div>

					{#if message}
						<p class="banner-msg" role="alert">{message}</p>
					{/if}

					<fieldset disabled={!data.signupsOpen || submitting}>
						<legend class="sr-only">Your details</legend>

						<div>
							<label class="field-label" for="name">Your name</label>
							<input
								id="name"
								name="name"
								class="field"
								autocomplete="name"
								required
								value={values?.name ?? ''}
								aria-invalid={errors.name ? 'true' : undefined}
								aria-describedby={errors.name ? 'name-error' : undefined}
							/>
							{#if errors.name}<p id="name-error" class="field-error">{errors.name}</p>{/if}
						</div>

						<div>
							<label class="field-label" for="email">Email</label>
							<input
								id="email"
								name="email"
								type="email"
								class="field"
								autocomplete="email"
								required
								value={values?.email ?? ''}
								aria-invalid={errors.email ? 'true' : undefined}
								aria-describedby={errors.email ? 'email-error' : undefined}
							/>
							{#if errors.email}<p id="email-error" class="field-error">{errors.email}</p>{/if}
						</div>

						<div>
							<label class="field-label" for="slack">Hack Club Slack handle (optional)</label>
							<input
								id="slack"
								name="slack"
								class="field"
								placeholder="@orpheus"
								value={values?.slack ?? ''}
								aria-invalid={errors.slack ? 'true' : undefined}
								aria-describedby={errors.slack ? 'slack-error' : undefined}
							/>
							{#if errors.slack}<p id="slack-error" class="field-error">{errors.slack}</p>{/if}
						</div>

						<div>
							<label class="field-label" for="building">What do you want to build? (optional)</label>
							<textarea
								id="building"
								name="building"
								class="field"
								rows="3"
								placeholder="a game, a robot, a website for my band…"
								aria-invalid={errors.building ? 'true' : undefined}
								aria-describedby={errors.building ? 'building-error' : undefined}
								>{values?.building ?? ''}</textarea
							>
							{#if errors.building}<p id="building-error" class="field-error">{errors.building}</p>{/if}
						</div>

						<div class="hp" aria-hidden="true">
							<label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
						</div>

						{#if !data.signupsOpen}
							<button class="btn-hit block" type="submit" disabled>
								<span class="btn-face">Signups opening soon</span>
							</button>
						{:else}
							<button class="btn-hit btn-primary block" type="submit" disabled={submitting}>
								<span class="btn-face">
									{submitting ? 'Sending…' : 'Join Hackcast'}
									{#if !submitting}<span aria-hidden="true">→</span>{/if}
								</span>
							</button>
						{/if}
					</fieldset>
				</form>
			</div>
		</div>
	{/if}
</div>

<style>
	.page {
		padding: 1.5rem var(--gutter) 3rem;
	}
	.slash {
		margin-bottom: 0.8rem;
	}
	.grid {
		display: grid;
		gap: 1.5rem;
	}
	.pitch {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
	}
	.ticks {
		display: flex;
		gap: 6px;
		width: 7rem;
	}
	.ticks i {
		display: block;
		width: 1.4rem;
		height: 4px;
		transform: skewX(-24deg);
		background: var(--cyan);
	}
	.ticks i:nth-child(2) {
		background: var(--mag);
	}
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
		width: min(100%, 28rem);
	}
	li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.75rem;
		align-items: baseline;
		padding: 0.7rem 0;
		border-top: 1px solid var(--line);
		color: #fff;
		font-size: 1.05rem;
	}
	li span {
		color: var(--cyan);
		font-family: 'Tektur', sans-serif;
		font-weight: 700;
	}
	.art {
		display: none;
	}
	.banner {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem 0.9rem;
		align-items: center;
		margin-bottom: 0.9rem;
		padding: 0.65rem 0.75rem;
		border: 1px solid var(--line);
	}
	.banner p {
		margin: 0;
		color: #fff;
		font-size: 1rem;
	}
	.dev {
		flex-basis: 100%;
		color: var(--cyan);
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		line-height: 1.45;
	}
	.dev code {
		color: #fff;
	}
	.slip {
		padding: 1rem 1rem 1.15rem;
		border: 1px solid var(--line);
		background: color-mix(in srgb, var(--panel) 75%, transparent);
	}
	.slip-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.eq {
		display: flex;
		gap: 3px;
	}
	.eq i {
		width: 10px;
		height: 6px;
		background: var(--cyan);
	}
	fieldset {
		display: grid;
		gap: 1rem;
		margin: 0;
		padding: 0;
		border: 0;
	}
	.sr-only {
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
	.hp {
		position: absolute;
		left: -9999px;
		height: 0;
		overflow: hidden;
	}
	.banner-msg {
		margin: 0 0 0.8rem;
		padding: 0.7rem 0.8rem;
		border: 1.5px solid var(--mag);
		color: #fff;
		font-weight: 600;
	}
	.success {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
		max-width: 920px;
		margin: 1rem auto 2rem;
		padding: 1.5rem 1.25rem 1.75rem;
	}
	.rule {
		display: block;
		width: 6rem;
		height: 3px;
		background: var(--acid);
	}
	.confirm {
		max-width: 42ch;
		margin: 0;
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.85rem;
		letter-spacing: 0.06em;
		line-height: 1.55;
		text-transform: uppercase;
	}
	@media (min-width: 980px) {
		.grid {
			grid-template-columns: minmax(0, 1fr) 120px minmax(320px, 1.05fr);
			gap: 1.25rem;
			align-items: start;
		}
		.art {
			display: block;
			position: relative;
			align-self: stretch;
			min-height: 420px;
			overflow: hidden;
		}
		.art img {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			max-width: none;
			object-fit: cover;
			object-position: 68% center;
		}
		.art::before,
		.art::after {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			z-index: 1;
			width: 5px;
		}
		.art::before {
			left: 0;
			background: var(--mag);
		}
		.art::after {
			right: 0;
			background: var(--cyan);
		}
	}
</style>
