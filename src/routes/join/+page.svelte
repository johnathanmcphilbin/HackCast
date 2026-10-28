<script lang="ts">
	import { enhance } from '$app/forms';
	import { dev } from '$app/env';
	import closed from '#lib/boards/join-closed.svg?raw';
	import errored from '#lib/boards/join-error.svg?raw';
	import ok from '#lib/boards/join-success.svg?raw';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);
	let w = $state(1280);

	const values = $derived(form && 'values' in form ? form.values : undefined);
	const errors = $derived(
		(form && 'errors' in form && form.errors ? form.errors : {}) as Record<string, string | undefined>
	);
	const succeeded = $derived(Boolean(form && 'success' in form && form.success));
	const art = $derived(succeeded ? ok : errors.email ? errored : closed);

	const field =
		'display:block;width:100%;margin-top:6px;border:3px solid #0c1422;background:#fffaf0;color:#17171d;padding:12px 14px;font-size:21px;font-weight:600;border-radius:6px;font-family:Figtree,sans-serif';
</script>

<Seo title="Join Hackcast" description="Sign up for Hackcast. The form says when signups are still opening." />

<div class="desk">
	<section class="board" bind:clientWidth={w} style:height="{w ? (1080 * w) / 1920 : 720}px">
		<div class="canvas" style:transform="scale({w / 1920})">
			{@html art}
			<div class="abs" style="left:96px;top:150px;width:860px">
				<p class="mono" style="background:#6b3f24;display:inline-block;color:#f6e6cf;border:3px solid #0c1422;box-shadow:6px 6px 0 #0c1422;padding:10px 16px;font-family:Bungee,sans-serif">
					the booth · join
				</p>
				<h1 class="h2" style="margin-top:28px">
					{#if succeeded}
						you're<br /><span class="r">on the list.</span>
					{:else if errors.email}
						hmm, that <span class="r">clipped.</span>
					{:else}
						signups <span class="r">opening soon.</span>
					{/if}
				</h1>
				<p class="body cream" style="width:720px;margin-top:18px">
					{#if succeeded}
						You're on the list. Go build.
					{:else if errors.email}
						Fix the red field and try again.
					{:else}
						The form opens soon.
					{/if}
				</p>
			</div>

			<div class="abs" style="left:1040px;top:120px;width:760px">
				<div style="background:#a87958;border:3px solid #0c1422;box-shadow:12px 12px 0 #0c1422;border-radius:16px;padding:46px 22px 22px;position:relative">
					<div style="position:absolute;left:50%;top:-16px;width:180px;margin-left:-90px;height:36px;background:#c9b8a3;border:3px solid #0c1422;border-radius:8px"></div>
					<div class="paper" style="box-shadow:none;padding:22px 26px">
						{#if succeeded && form && 'name' in form}
							<div style="text-align:center;padding:20px 8px 10px">
								<p class="disp" style="font-size:40px;margin:0">welcome aboard, {form.name}</p>
								<p style="font-size:22px;font-weight:600;line-height:1.4">You're on the list. Go build.</p>
								<p class="disp" style="display:inline-block;border:5px solid #be1e3a;color:#be1e3a;font-size:36px;padding:6px 18px;transform:rotate(-6deg)">
									RECEIVED
								</p>
								<p><a href="/" style="color:#17171d;font-weight:800">← back to hackcast</a></p>
							</div>
						{:else}
							<p class="mono" style="display:flex;justify-content:space-between;font-size:18px">
								<span>HACKCAST SIGNUP SLIP</span><span>№ ______ · Hack Club</span>
							</p>
							<hr style="border:0;border-top:3px solid #0c1422;margin:10px 0 16px" />
							<form
								method="POST"
								use:enhance={() => {
									submitting = true;
									return async ({ update }) => {
										await update({ reset: false });
										submitting = false;
									};
								}}
								novalidate
							>
								<fieldset disabled={!data.signupsOpen || submitting} style="border:0;padding:0;margin:0">
									<label for="name" style="font-weight:800;font-size:20px;color:#17171d">your name</label>
									<input id="name" name="name" class="jfield" style={field} autocomplete="name" required value={values?.name ?? ''} aria-invalid={errors.name ? 'true' : undefined} />
									{#if errors.name}<p class="jerr">{errors.name}</p>{/if}

									<label for="email" style="font-weight:800;font-size:20px;color:#17171d">email</label>
									<input id="email" name="email" type="email" class="jfield" style={field} style:border-color={errors.email ? '#be1e3a' : undefined} style:border-width={errors.email ? '5px' : undefined} autocomplete="email" required value={values?.email ?? ''} placeholder="you@example.com" aria-invalid={errors.email ? 'true' : undefined} aria-describedby={errors.email ? 'email-error' : undefined} />
									{#if errors.email}<p id="email-error" class="jerr">✕ {errors.email}</p>{/if}

									<label for="slack" style="font-weight:800;font-size:20px;color:#17171d">Hack Club Slack handle <span style="font-weight:600">(optional)</span></label>
									<input id="slack" name="slack" class="jfield" style={field} value={values?.slack ?? ''} placeholder="@orpheus" />

									<label for="building" style="font-weight:800;font-size:20px;color:#17171d">what do you want to build? <span style="font-weight:600">(optional)</span></label>
									<input id="building" name="building" class="jfield" style={field} value={values?.building ?? ''} placeholder="a game, a robot, a website for my band…" />

									<div style="position:absolute;left:-9999px" aria-hidden="true">
										<label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
									</div>

									{#if !data.signupsOpen}
										<button type="submit" disabled class="wait">signups opening soon</button>
									{:else}
										<button class="redbtn" type="submit" disabled={submitting} style="margin-top:8px;cursor:pointer">
											{submitting ? 'sending…' : 'join hackcast →'}
										</button>
									{/if}
									{#if dev && !data.signupsOpen}
										<p class="mono" style="color:#17171d;font-size:14px;margin-top:10px">dev: set SIGNUP_WEBHOOK_URL to open this form.</p>
									{/if}
								</fieldset>
							</form>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<div class="phone">
	<p class="station-sign">the booth · join</p>
	{#if succeeded && form && 'name' in form}
		<h1>you're <span class="r">on the list.</span></h1>
		<p>You're on the list, {form.name}.</p>
		<p><a href="/">← back to hackcast</a></p>
	{:else}
		<h1>signups <span class="r">opening soon.</span></h1>
		<p>The form opens soon.</p>
		<div class="slip">
			<div class="slip-paper">
				<p class="mono">HACKCAST SIGNUP SLIP</p>
				<form method="POST" use:enhance novalidate>
					<fieldset disabled={!data.signupsOpen || submitting} style="border:0;padding:0">
						<label for="m-name">your name</label>
						<input id="m-name" name="name" class="field" value={values?.name ?? ''} />
						<label for="m-email">email</label>
						<input id="m-email" name="email" class="field" type="email" value={values?.email ?? ''} placeholder="you@example.com" aria-invalid={errors.email ? 'true' : undefined} />
						{#if errors.email}<p class="err">✕ {errors.email}</p>{/if}
						<label for="m-slack">Slack handle (optional)</label>
						<input id="m-slack" name="slack" class="field" value={values?.slack ?? ''} placeholder="@orpheus" />
						<label for="m-building">what will you build? (optional)</label>
						<input id="m-building" name="building" class="field" value={values?.building ?? ''} placeholder="a game, a robot…" />
						<div style="position:absolute;left:-9999px" aria-hidden="true"><input name="website" tabindex="-1" /></div>
						{#if !data.signupsOpen}
							<button class="ghost" type="submit" disabled>signups opening soon</button>
						{:else}
							<button class="redbtn" type="submit">join hackcast →</button>
						{/if}
					</fieldset>
				</form>
			</div>
		</div>
	{/if}
</div>

<style>
	.jfield::placeholder {
		color: #17171d;
		opacity: 1;
	}
	.jfield:disabled {
		background: #eadbc0;
		color: #17171d;
		opacity: 1;
	}
	.jerr {
		margin: 6px 0 0;
		color: #be1e3a;
		font-weight: 800;
		font-size: 20px;
	}
	.wait {
		display: inline-block;
		margin-top: 8px;
		padding: 12px 22px;
		border: 3px dashed #0c1422;
		background: #eadbc0;
		color: #17171d;
		font-family: 'Archivo Black', sans-serif;
		font-size: 26px;
		cursor: not-allowed;
	}
	h1 {
		font-weight: 400;
	}
</style>
