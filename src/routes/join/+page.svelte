<script lang="ts">
	import { enhance } from '$app/forms';
	import { dev } from '$app/env';
	import Seo from '#lib/components/Seo.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import Sticker from '#lib/components/Sticker.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let submitting = $state(false);

	const values = $derived(form && 'values' in form ? form.values : undefined);
	const errors: Record<string, string | undefined> = $derived(form && 'errors' in form && form.errors ? form.errors : {});
	const message = $derived(form && 'message' in form ? form.message : null);

	const field =
		'mt-1 block w-full border-3 border-charcoal bg-white px-3 py-2 text-lg text-charcoal placeholder:text-charcoal/40 focus-visible:outline-pink disabled:cursor-not-allowed disabled:bg-charcoal/5';
</script>

<Seo title="Join Hackcast" description="Sign up for Hackcast: build projects, earn shop rewards for every approved hour, and help run a weekly podcast made by teenagers." />

<div class="mx-auto grid max-w-6xl gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
	<div>
		<Logo class="mb-8 w-32 -rotate-6" decorative />
		<h1 class="text-[clamp(3rem,8vw,5.5rem)] leading-[0.9] font-bold tracking-tight">
			Get on<br /><span class="text-pink">the show.</span>
		</h1>
		<p class="mt-6 max-w-md text-xl text-cream/90">
			Sign up and we'll send you everything you need to start building and logging hours.
		</p>
		<ul class="mt-8 space-y-3 text-lg">
			<li class="flex gap-3"><span class="font-mono font-bold text-teal">01</span> Build anything you want</li>
			<li class="flex gap-3"><span class="font-mono font-bold text-teal">02</span> Shop rewards for every approved hour</li>
			<li class="flex gap-3"><span class="font-mono font-bold text-teal">03</span> Every 5 hours: a question + a prize wheel entry</li>
		</ul>
	</div>

	<div class="relative">
		{#if form && 'success' in form && form.success}
			<div class="relative rotate-1 bg-teal p-8 text-charcoal shadow-[8px_8px_0_var(--color-cream)]" role="status">
				<Sticker color="pink" tilt={-8} class="absolute -top-5 -left-3">you're in!</Sticker>
				<h2 class="mt-2 text-4xl font-bold">Welcome aboard, {form.name}.</h2>
				<p class="mt-4 text-xl">
					Your signup is in. Keep an eye on your inbox for next steps, and start thinking about what you'll build.
				</p>
				<a href="/" class="mt-6 inline-block font-bold underline decoration-2 underline-offset-4">← Back to Hackcast</a>
			</div>
		{:else}
			{#if !data.signupsOpen}
				<div class="mb-8 border-3 border-dashed border-pink p-5" role="note">
					<p class="label text-pink">Signups not open yet</p>
					<p class="mt-2 text-lg">
						The signup form isn't connected yet, so we can't take registrations right now. Check back soon!
					</p>
					{#if dev}
						<p class="mt-3 font-mono text-sm text-cream/70">
							Dev note: set <code class="text-teal">SIGNUP_WEBHOOK_URL</code> in <code>.env</code> (see
							<code>.env.example</code> and <code>src/lib/server/signup.ts</code>) to enable this form.
						</p>
					{/if}
				</div>
			{/if}

			<form
				method="POST"
				class="relative -rotate-1 bg-cream p-6 pt-10 text-charcoal shadow-[8px_8px_0_var(--color-pink)] sm:p-8 sm:pt-12"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update({ reset: false });
						submitting = false;
					};
				}}
				novalidate
			>
				<span class="tape -top-3 left-10 -rotate-3" aria-hidden="true"></span>
				<p class="label text-charcoal/60">Hackcast signup slip</p>

				{#if message}
					<p class="mt-4 border-3 border-pink bg-pink/15 px-4 py-3 font-bold" role="alert">{message}</p>
				{/if}

				<fieldset disabled={!data.signupsOpen || submitting} class="mt-6 space-y-5">
					<legend class="sr-only">Your details</legend>

					<div>
						<label for="name" class="font-bold">Your name</label>
						<input id="name" name="name" autocomplete="name" required value={values?.name ?? ''} class={field}
							aria-invalid={errors.name ? 'true' : undefined} aria-describedby={errors.name ? 'name-error' : undefined} />
						{#if errors.name}<p id="name-error" class="mt-1 font-bold text-[#b0175a]">{errors.name}</p>{/if}
					</div>

					<div>
						<label for="email" class="font-bold">Email</label>
						<input id="email" name="email" type="email" autocomplete="email" required value={values?.email ?? ''} class={field}
							aria-invalid={errors.email ? 'true' : undefined} aria-describedby={errors.email ? 'email-error' : undefined} />
						{#if errors.email}<p id="email-error" class="mt-1 font-bold text-[#b0175a]">{errors.email}</p>{/if}
					</div>

					<div>
						<label for="slack" class="font-bold">Hack Club Slack handle <span class="font-normal text-charcoal/60">(optional)</span></label>
						<input id="slack" name="slack" placeholder="@orpheus" value={values?.slack ?? ''} class={field}
							aria-invalid={errors.slack ? 'true' : undefined} aria-describedby={errors.slack ? 'slack-error' : undefined} />
						{#if errors.slack}<p id="slack-error" class="mt-1 font-bold text-[#b0175a]">{errors.slack}</p>{/if}
					</div>

					<div>
						<label for="building" class="font-bold">What do you want to build? <span class="font-normal text-charcoal/60">(optional)</span></label>
						<textarea id="building" name="building" rows="3" placeholder="a game, a robot, a website for my band…" class={field}
							aria-invalid={errors.building ? 'true' : undefined} aria-describedby={errors.building ? 'building-error' : undefined}
							>{values?.building ?? ''}</textarea>
						{#if errors.building}<p id="building-error" class="mt-1 font-bold text-[#b0175a]">{errors.building}</p>{/if}
					</div>

					<!-- Honeypot -->
					<div class="hidden" aria-hidden="true">
						<label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
					</div>

					<button type="submit" class="btn w-full justify-center !text-xl disabled:cursor-not-allowed disabled:opacity-60" style:box-shadow="5px 5px 0 var(--color-charcoal)">
						{#if !data.signupsOpen}Signups opening soon{:else if submitting}Sending…{:else}Join Hackcast <span aria-hidden="true">→</span>{/if}
					</button>
				</fieldset>
			</form>
		{/if}
	</div>
</div>
