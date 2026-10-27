<script lang="ts">
	import { site } from '#lib/site.ts';
	import JoinButton from '../JoinButton.svelte';
	import Logo from '../Logo.svelte';
	import Doodle from '../Doodle.svelte';
</script>

<section class="relative overflow-hidden border-y-3 border-charcoal bg-pink text-charcoal" aria-labelledby="cta-title">
	<div class="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_auto] md:py-28">
		<div>
			<h2 id="cta-title" class="text-[clamp(3rem,9vw,6.5rem)] leading-[0.88] font-bold tracking-tight">
				Your turn<br />on the mic.
			</h2>
			<p class="mt-6 max-w-lg text-xl font-bold sm:text-2xl">
				Join Hackcast, start building, and turn your hours into rewards and a say in the show.
			</p>
			<JoinButton size="lg" variant="dark" class="mt-10" />
			<a href={site.hackClubUrl} class="mt-12 flex w-fit -rotate-1 items-center gap-3 bg-charcoal py-2 pr-4 pl-2 text-cream hover:underline">
				<img src={site.hackClubFlag} alt="Hack Club" width="112" height="63" class="w-16" />
				<span class="label">A Hack Club YSWS programme</span>
			</a>
		</div>

		<div class="relative mx-auto w-56 sm:w-72">
			<div class="rotate-6 border-3 border-charcoal bg-charcoal p-5 shadow-[10px_10px_0_var(--color-cream)]">
				<Logo decorative />
			</div>
			<Doodle kind="star" class="absolute -top-8 -left-8 w-16 -rotate-12 text-teal" />
		</div>
	</div>
</section>
