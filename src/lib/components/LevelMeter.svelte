<script lang="ts">
	// A little audio level meter, like the one on a mixing desk. Decorative.
	let { bars = 28, class: className = '' }: { bars?: number; class?: string } = $props();

	// Fixed pseudo-random heights so server and client render the same thing.
	const heights = $derived(
		Array.from({ length: bars }, (_, i) => 25 + ((i * 47 + 13) % 70))
	);
</script>

<div class="flex h-14 items-end gap-[3px] {className}" aria-hidden="true">
	{#each heights as h, i (i)}
		<span
			class="meter-bar flex-1 {h > 80 ? 'bg-pink' : 'bg-teal'}"
			style:height="{h}%"
			style:animation-delay="{(i % 7) * -0.17}s"
		></span>
	{/each}
</div>

<style>
	.meter-bar {
		transform-origin: bottom;
		animation: level 1.1s ease-in-out infinite alternate;
	}
	@keyframes level {
		from {
			transform: scaleY(0.35);
		}
		to {
			transform: scaleY(1);
		}
	}
</style>
