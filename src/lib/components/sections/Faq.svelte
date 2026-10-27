<script lang="ts">
	import { faqs } from '#lib/content.ts';
	import SectionHeading from '../SectionHeading.svelte';
	import FaqList from '../FaqList.svelte';
</script>

<section id="faq" class="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28" aria-labelledby="faq-title">
	<div class="grid gap-12 lg:grid-cols-[1fr_2fr]">
		<div>
			<SectionHeading id="faq-title">
				Questions?<br /><span class="text-pink">Answers.</span>
			</SectionHeading>
			<p class="mt-6 max-w-xs font-marker text-lg -rotate-1 text-teal">
				some rules are still being finalised. we'll update these before launch!
			</p>
		</div>
		<FaqList items={faqs} />
	</div>
</section>
