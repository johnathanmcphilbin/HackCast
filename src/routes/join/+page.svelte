<script lang="ts">
	import { enhance } from '$app/forms';
	import { dev } from '$app/env';
	import closed from '#lib/boards/join-closed.svg?raw';
	import errored from '#lib/boards/join-error.svg?raw';
	import ok from '#lib/boards/join-success.svg?raw';
	import { rsvpCountLabel } from '#lib/rsvp.ts';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let saving = $state(false);
	let w = $state(1280);

	const mode = $derived(data.mode);
	const onList = $derived(mode === 'in' || mode === 'held');
	const art = $derived(onList ? ok : mode === 'auth-error' ? errored : closed);
	const questionError = $derived(form && 'questionError' in form ? form.questionError : '');

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
					{#if mode === 'in'}
						you're<br /><span class="r">on the list.</span>
					{:else if mode === 'held'}
						saved.<br /><span class="r">not eligible yet.</span>
					{:else if mode === 'auth-error'}
						hmm, that <span class="r">clipped.</span>
					{:else}
						signups <span class="r">opening soon.</span>
					{/if}
				</h1>
				<p class="body cream" style="width:720px;margin-top:18px">{data.note}</p>
				{#if data.count}<p class="mono" style="color:#f6e6cf">{rsvpCountLabel(data.count)}</p>{/if}
			</div>

			<div class="abs" style="left:1040px;top:120px;width:760px">
				<div style="background:#a87958;border:3px solid #0c1422;box-shadow:12px 12px 0 #0c1422;border-radius:16px;padding:46px 22px 22px;position:relative">
					<div style="position:absolute;left:50%;top:-16px;width:180px;margin-left:-90px;height:36px;background:#c9b8a3;border:3px solid #0c1422;border-radius:8px"></div>
					<div class="paper" style="box-shadow:none;padding:22px 26px">
						{#if onList}
							<div style="text-align:center;padding:12px 8px 4px">
								<p class="disp" style="font-size:40px;margin:0">welcome aboard, {data.name}</p>
								<p style="font-size:22px;font-weight:600;line-height:1.4">{data.note}</p>
								{#if mode === 'in'}
									<p class="disp" style="display:inline-block;border:5px solid #be1e3a;color:#be1e3a;font-size:36px;padding:6px 18px;transform:rotate(-6deg)">
										RECEIVED
									</p>
								{/if}
								<form
									method="POST"
									action="?/question"
									use:enhance={() => {
										saving = true;
										return async ({ update }) => {
											await update();
											saving = false;
										};
									}}
									style="text-align:left;margin-top:16px"
								>
									<label for="question" style="font-weight:800;font-size:20px;color:#17171d">what would you ask on the show?</label>
									<input id="question" name="question" class="jfield" style={field} maxlength="200" value={data.question ?? ''} />
									{#if questionError}<p class="jerr">{questionError}</p>{/if}
									<button class="redbtn" type="submit" disabled={saving} style="margin-top:8px;cursor:pointer">{saving ? 'saving…' : 'save'}</button>
								</form>
								<p><a href="/" style="color:#17171d;font-weight:800">← back to hackcast</a></p>
								<form method="POST" action="/auth/logout"><button class="linkish" type="submit">sign out</button></form>
							</div>
						{:else if mode === 'auth-error'}
							<p style="font-size:22px;font-weight:700">That sign-in didn't land.</p>
							<p><a class="redbtn" href="/auth/login">try again →</a></p>
						{:else}
							<p class="mono" style="display:flex;justify-content:space-between;font-size:18px">
								<span>HACKCAST SIGNUP SLIP</span><span>№ ______ · Hack Club</span>
							</p>
							<hr style="border:0;border-top:3px solid #0c1422;margin:10px 0 16px" />
							<form method="POST" novalidate>
								<fieldset disabled style="border:0;padding:0;margin:0">
									<label for="name" style="font-weight:800;font-size:20px;color:#17171d">your name</label>
									<input id="name" name="name" class="jfield" style={field} autocomplete="name" value="" />

									<label for="email" style="font-weight:800;font-size:20px;color:#17171d">email</label>
									<input id="email" name="email" type="email" class="jfield" style={field} autocomplete="email" value="" placeholder="you@example.com" />

									<label for="slack" style="font-weight:800;font-size:20px;color:#17171d">Hack Club Slack handle <span style="font-weight:600">(optional)</span></label>
									<input id="slack" name="slack" class="jfield" style={field} value="" placeholder="@orpheus" />

									<label for="building" style="font-weight:800;font-size:20px;color:#17171d">what do you want to build? <span style="font-weight:600">(optional)</span></label>
									<input id="building" name="building" class="jfield" style={field} value="" placeholder="a game, a robot, a website for my band…" />

									<div style="position:absolute;left:-9999px" aria-hidden="true">
										<label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
									</div>

									<button type="submit" disabled class="wait">signups opening soon</button>
									{#if dev}
										<p class="mono" style="color:#17171d;font-size:14px;margin-top:10px">dev: set the HCA and database env vars to open sign-in.</p>
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
	{#if onList}
		<h1>{mode === 'in' ? "you're" : 'saved.'} <span class="r">{mode === 'in' ? 'on the list.' : 'not eligible yet.'}</span></h1>
		<p>welcome aboard, {data.name}. {data.note}</p>
		{#if data.count}<p class="mono">{rsvpCountLabel(data.count)}</p>{/if}
		<form method="POST" action="?/question" use:enhance>
			<label for="m-question">what would you ask on the show?</label>
			<input id="m-question" name="question" class="field" maxlength="200" value={data.question ?? ''} />
			{#if questionError}<p class="err">{questionError}</p>{/if}
			<button class="redbtn" type="submit">save</button>
		</form>
		<p><a href="/">← back to hackcast</a></p>
		<form method="POST" action="/auth/logout"><button class="linkish" type="submit">sign out</button></form>
	{:else if mode === 'auth-error'}
		<h1>hmm, that <span class="r">clipped.</span></h1>
		<p>That sign-in didn't land.</p>
		<p><a class="redbtn" href="/auth/login">try again →</a></p>
	{:else}
		<h1>signups <span class="r">opening soon.</span></h1>
		<p>The form opens soon.</p>
		<div class="slip">
			<div class="slip-paper">
				<p class="mono">HACKCAST SIGNUP SLIP</p>
				<form method="POST" use:enhance novalidate>
					<fieldset disabled style="border:0;padding:0">
						<label for="m-name">your name</label>
						<input id="m-name" name="name" class="field" value="" />
						<label for="m-email">email</label>
						<input id="m-email" name="email" class="field" type="email" value="" placeholder="you@example.com" />
						<label for="m-slack">Slack handle (optional)</label>
						<input id="m-slack" name="slack" class="field" value="" placeholder="@orpheus" />
						<label for="m-building">what will you build? (optional)</label>
						<input id="m-building" name="building" class="field" value="" placeholder="a game, a robot…" />
						<div style="position:absolute;left:-9999px" aria-hidden="true"><input name="website" tabindex="-1" /></div>
						<button class="ghost" type="submit" disabled>signups opening soon</button>
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
	.linkish {
		background: none;
		border: 0;
		padding: 0;
		color: inherit;
		font: inherit;
		font-weight: 800;
		text-decoration: underline;
		cursor: pointer;
	}
</style>
