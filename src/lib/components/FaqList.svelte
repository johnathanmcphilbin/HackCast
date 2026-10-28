<script lang="ts">
	import type { Faq } from '#lib/content.ts';

	let { items }: { items: Faq[] } = $props();
</script>

<ul class="border-t border-cream/20">
	{#each items as item, i (item.q)}
		<li class="border-b border-cream/20">
			<details class="group">
				<summary
					class="flex cursor-pointer list-none items-start gap-4 py-4 text-lg font-bold hover:text-pink sm:text-xl [&::-webkit-details-marker]:hidden"
				>
					<span class="mt-1 w-8 shrink-0 font-mono text-sm font-bold text-teal">{String(i + 1).padStart(2, '0')}</span>
					<span class="flex-1 group-open:text-pink">{item.q}</span>
					<span
						class="mt-0.5 shrink-0 font-mono text-2xl leading-none transition-transform group-open:rotate-45"
						aria-hidden="true">+</span
					>
				</summary>
				<p class="max-w-2xl pb-5 pl-12 text-lg leading-relaxed">{item.a}</p>
			</details>
		</li>
	{/each}
</ul>
