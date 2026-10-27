<script lang="ts">
	import type { Snippet } from 'svelte';

	// A rotated, die-cut-looking sticker. Purely decorative unless given readable content.
	let {
		color = 'pink',
		tilt = -6,
		class: className = '',
		children
	}: {
		color?: 'pink' | 'teal' | 'cream';
		tilt?: number;
		class?: string;
		children: Snippet;
	} = $props();

	const colors = {
		pink: 'bg-pink text-charcoal',
		teal: 'bg-teal text-charcoal',
		cream: 'bg-cream text-charcoal'
	};
</script>

<span
	class="inline-block border-3 border-charcoal px-3 py-1 font-marker text-lg leading-tight shadow-[3px_3px_0_var(--color-charcoal)] outline-3 outline-cream transition-transform duration-200 hover:rotate-0 {colors[
		color
	]} {className}"
	style:rotate="{tilt}deg"
>
	{@render children()}
</span>
