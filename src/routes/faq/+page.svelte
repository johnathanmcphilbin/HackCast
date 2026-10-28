<script lang="ts">
	import { faqs } from '#lib/content.ts';
	import Seo from '#lib/components/Seo.svelte';
	import FaqList from '#lib/components/FaqList.svelte';
	import JoinButton from '#lib/components/JoinButton.svelte';
</script>

<Seo
	title="FAQ | Hackcast"
	description="Answers about Hackcast, the Hack Club You Ship, We Ship podcast. Hours, the shop, the prize wheel, and what is still being decided."
/>

<div class="wrap py-14 md:py-20">
	<div class="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
		<div>
			<h1 class="text-[clamp(3.25rem,8vw,5.5rem)] leading-[0.9] font-bold tracking-tight">FAQ</h1>
			<p class="mt-4 text-lg leading-snug">
				Some rules aren’t final. Those answers say so, and they’ll be updated before launch.
			</p>
		</div>
		<FaqList items={faqs} />
	</div>

	<div class="mt-16 flex flex-col items-start gap-6 border-t border-cream/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
		<p class="text-2xl font-bold tracking-tight">Want to build toward the show?</p>
		<JoinButton />
	</div>
</div>
