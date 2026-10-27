<script lang="ts">
	import type { Faq } from '#lib/content.ts';

	let { items }: { items: Faq[] } = $props();
</script>

<ul class="border-t-3 border-cream">
	{#each items as item, i (item.q)}
		<li class="border-b-3 border-cream">
			<details class="group">
				<summary
					class="flex cursor-pointer list-none items-baseline gap-4 py-5 text-xl font-bold hover:text-pink sm:gap-6 sm:text-2xl [&::-webkit-details-marker]:hidden"
				>
					<span class="w-8 shrink-0 font-mono text-sm text-teal" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
					<span class="flex-1">{item.q}</span>
					<span
						class="grid size-8 shrink-0 place-items-center self-center border-3 border-current font-mono text-lg leading-none transition-transform group-open:rotate-45 group-open:text-pink"
						aria-hidden="true">+</span
					>
				</summary>
				<p class="max-w-2xl pb-6 pl-12 text-lg text-cream/85 sm:pl-14">{item.a}</p>
			</details>
		</li>
	{/each}
</ul>
