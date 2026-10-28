<script lang="ts">
	import { site } from '#lib/site.ts';
	import Logo from '../Logo.svelte';
	import ScribbleButton from '../ScribbleButton.svelte';
	import runTheShow from '#lib/assets/run-the-show.svg';

	const facts = ['25–40 min', 'Every week', 'Teen hosts'];
</script>

<section class="wrap py-10 sm:py-14 lg:py-16" aria-labelledby="hero-title">
	<div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">
		<div class="w-full max-w-[36rem]">
			<p class="flex items-center gap-3">
				<img src={site.hackClubFlag} alt="" width="112" height="63" class="w-11" />
				<span class="label text-teal">A Hack Club YSWS</span>
			</p>

			<h1 id="hero-title" class="mt-5">
				<img
					src={runTheShow}
					alt="Run the show"
					width="720"
					height="485"
					class="h-auto w-full"
				/>
			</h1>

			<p class="mt-5 max-w-xl text-xl leading-snug">
				A weekly podcast by teenagers. Build a project, log your hours, and spend the ones that get approved.
			</p>

			<div class="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
				<ScribbleButton />
				<a href="#rewards" class="py-2 font-bold underline decoration-2 underline-offset-4 hover:text-pink">
					What the hours get you
				</a>
			</div>
		</div>

		<Logo class="hidden w-48 shrink-0 lg:block xl:w-56" decorative />
	</div>

	<ul class="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-cream/20 pt-4 font-mono text-sm font-bold">
		{#each facts as fact (fact)}
			<li>{fact}</li>
		{/each}
	</ul>
</section>
