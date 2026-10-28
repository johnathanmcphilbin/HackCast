<script lang="ts">
	import { faqs } from '#lib/content.ts';
	import FaqList from '../FaqList.svelte';
</script>

<section id="faq" class="border-t border-cream/20" aria-labelledby="faq-title">
	<div class="wrap py-16 md:py-24">
		<h2 id="faq-title" class="text-3xl font-bold tracking-tight md:text-4xl">FAQ</h2>
		<p class="mt-3 max-w-xl text-lg">Some answers aren’t final. The ones that aren’t say so.</p>
		<div class="mt-8 max-w-3xl">
			<FaqList items={faqs} />
		</div>
	</div>
</section>
