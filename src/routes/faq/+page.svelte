<script lang="ts">
	import { faqs } from '#lib/content.ts';
	import Seo from '#lib/components/Seo.svelte';
	import FaqList from '#lib/components/FaqList.svelte';
	import JoinButton from '#lib/components/JoinButton.svelte';
	import Doodle from '#lib/components/Doodle.svelte';
</script>

<Seo title="FAQ | Hackcast" description="Answers to common questions about Hackcast, the Hack Club You Ship, We Ship podcast programme." />

<div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
	<h1 class="text-[clamp(3rem,9vw,6rem)] leading-[0.9] font-bold tracking-tight">
		Frequently asked <span class="relative inline-block text-pink"
			>questions<Doodle kind="underline" class="absolute -bottom-2 left-0 h-3 w-full text-teal" /></span
		>
	</h1>
	<p class="mt-6 max-w-xl font-marker text-xl -rotate-1 text-cream/80">
		Some rules are still being finalised. We'll update these answers before launch.
	</p>

	<div class="mt-12">
		<FaqList items={faqs} />
	</div>

	<div class="mt-16 flex flex-wrap items-center gap-6">
		<p class="text-2xl font-bold">Seen enough?</p>
		<JoinButton />
	</div>
</div>
