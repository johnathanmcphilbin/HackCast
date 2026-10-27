<script lang="ts">
	import { enhance } from '$app/forms';
	import { dev } from '$app/env';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let submitting = $state(false);

	const values = $derived(form && 'values' in form ? form.values : undefined);
	const errors: Record<string, string | undefined> = $derived(
		form && 'errors' in form && form.errors ? form.errors : {}
	);
	const message = $derived(form && 'message' in form ? form.message : null);

	const field =
		'mt-1 block w-full border-2 border-charcoal bg-white px-3 py-2.5 text-lg text-charcoal placeholder:text-[#5c5862] disabled:cursor-not-allowed';

	const deal = [
		'Build what you want. A site, a game, hardware, a tool.',
		'Every approved hour earns shop credit.',
		'Five approved hours: one question, and one prize-wheel entry.',
		'Most approved hours in a week: you pick the topic or the guest.'
	];
</script>

<Seo
	title="Join Hackcast"
	description="Sign up for Hackcast. Build projects, earn shop credit for every approved hour, and spend hours on a weekly podcast made by teenagers."
/>

<div class="wrap grid gap-12 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-20">
	<div>
		<p class="label text-teal">Hack Club YSWS</p>
		<h1 class="mt-3 text-[clamp(3.25rem,8vw,5.5rem)] leading-[0.9] font-bold tracking-tight">Join Hackcast</h1>
		<p class="mt-6 max-w-md text-xl leading-snug">
			We’ll email you how to log hours. Time on the show comes after those hours are approved.
		</p>
		<ul class="mt-8 max-w-md border-t border-cream/20">
			{#each deal as item, i (item)}
				<li class="border-b border-cream/20 py-4 text-lg leading-snug">
					<span class="mr-3 font-mono text-sm font-bold text-teal">{String(i + 1).padStart(2, '0')}</span>{item}
				</li>
			{/each}
		</ul>
	</div>

	<div>
		{#if form && 'success' in form && form.success}
			<div class="on-paper bg-cream text-charcoal" role="status">
				<div class="h-1.5 bg-pink" aria-hidden="true"></div>
				<div class="p-6 sm:p-8">
					<h2 class="text-3xl font-bold tracking-tight">Signed up, {form.name}.</h2>
					<p class="mt-3 text-lg">Watch your inbox for how to log hours.</p>
					<a href="/" class="mt-6 inline-block font-bold underline decoration-2 underline-offset-4">Back to Hackcast</a>
				</div>
			</div>
		{:else}
			<form
				method="POST"
				class="on-paper bg-cream text-charcoal"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update({ reset: false });
						submitting = false;
					};
				}}
				novalidate
			>
				<div class="h-1.5 bg-pink" aria-hidden="true"></div>
				<div class="p-6 sm:p-8">
					<h2 class="text-2xl font-bold">Signup</h2>

					{#if !data.signupsOpen}
						<div class="mt-5 border-l-4 border-pink pl-4" role="note">
							<p class="font-bold">Not open yet</p>
							<p class="mt-1 text-lg leading-snug">
								This form isn’t hooked up, so it can’t save a signup. The fields stay off until it can.
							</p>
							{#if dev}
								<p class="mt-3 font-mono text-sm">
									Dev: set <code class="font-bold">SIGNUP_WEBHOOK_URL</code> in <code>.env</code> (see
									<code>.env.example</code> and <code>src/lib/server/signup.ts</code>) to enable this form.
								</p>
							{/if}
						</div>
					{/if}

					{#if message}
						<p class="mt-5 border-2 border-charcoal bg-white px-4 py-3 font-bold" role="alert">{message}</p>
					{/if}

					<fieldset disabled={!data.signupsOpen || submitting} class="mt-6 space-y-5">
						<legend class="sr-only">Your details</legend>

						<div>
							<label for="name" class="font-bold">Your name</label>
							<input
								id="name"
								name="name"
								autocomplete="name"
								required
								maxlength="100"
								value={values?.name ?? ''}
								class={field}
								aria-invalid={errors.name ? 'true' : undefined}
								aria-describedby={errors.name ? 'name-error' : undefined}
							/>
							{#if errors.name}<p id="name-error" class="mt-1 text-sm font-bold text-danger">{errors.name}</p>{/if}
						</div>

						<div>
							<label for="email" class="font-bold">Email</label>
							<input
								id="email"
								name="email"
								type="email"
								autocomplete="email"
								required
								value={values?.email ?? ''}
								class={field}
								aria-invalid={errors.email ? 'true' : undefined}
								aria-describedby={errors.email ? 'email-error' : undefined}
							/>
							{#if errors.email}<p id="email-error" class="mt-1 text-sm font-bold text-danger">{errors.email}</p>{/if}
						</div>

						<div>
							<label for="slack" class="font-bold"
								>Hack Club Slack <span class="font-normal">(optional)</span></label
							>
							<input
								id="slack"
								name="slack"
								placeholder="@orpheus"
								maxlength="80"
								value={values?.slack ?? ''}
								class={field}
								aria-invalid={errors.slack ? 'true' : undefined}
								aria-describedby={errors.slack ? 'slack-error' : undefined}
							/>
							{#if errors.slack}<p id="slack-error" class="mt-1 text-sm font-bold text-danger">{errors.slack}</p>{/if}
						</div>

						<div>
							<label for="building" class="font-bold"
								>What do you want to build? <span class="font-normal">(optional)</span></label
							>
							<textarea
								id="building"
								name="building"
								rows="3"
								maxlength="1000"
								placeholder="a game, a robot, a site for my band"
								class={field}
								aria-invalid={errors.building ? 'true' : undefined}
								aria-describedby={errors.building ? 'building-error' : undefined}
								>{values?.building ?? ''}</textarea
							>
							{#if errors.building}<p id="building-error" class="mt-1 text-sm font-bold text-danger">{errors.building}</p>{/if}
						</div>

						<!-- Honeypot. People never see this field. -->
						<div class="hidden" aria-hidden="true">
							<label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
						</div>

						<button
							type="submit"
							class="btn mt-2 w-full px-5 py-3 text-lg"
							class:btn-closed={!data.signupsOpen}
						>
							{#if !data.signupsOpen}
								Not open yet
							{:else if submitting}
								Sending…
							{:else}
								Join Hackcast <span aria-hidden="true">→</span>
							{/if}
						</button>
					</fieldset>
				</div>
			</form>
		{/if}
	</div>
</div>
