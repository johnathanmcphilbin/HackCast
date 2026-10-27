<script lang="ts">
	// Shows an embedded episode when `embedUrl` is set, otherwise a "no signal" placeholder.
	let { embedUrl = null, title = 'Latest Hackcast episode' }: { embedUrl?: string | null; title?: string } =
		$props();
</script>

<div class="border-3 border-cream bg-charcoal-2 p-3 shadow-[8px_8px_0_var(--color-teal)]">
	<div class="mb-3 flex items-center justify-between font-mono text-xs font-bold uppercase">
		<span class="flex items-center gap-2">
			<span class="size-2.5 rounded-full {embedUrl ? 'animate-blink bg-pink' : 'bg-cream/30'}"></span>
			{embedUrl ? 'Now playing' : 'Standby'}
		</span>
		<span class="text-cream/60">Ch. 01</span>
	</div>

	{#if embedUrl}
		<iframe
			src={embedUrl}
			{title}
			class="aspect-video w-full border-0"
			loading="lazy"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			allowfullscreen
		></iframe>
	{:else}
		<div
			class="relative grid aspect-video place-items-center overflow-hidden bg-charcoal text-center"
			role="img"
			aria-label="Episode player placeholder: the first episode isn't out yet"
		>
			<!-- TV test-card bars, solid blocks only -->
			<div class="absolute inset-x-0 top-0 flex h-2/3 opacity-25" aria-hidden="true">
				{#each ['bg-cream', 'bg-teal', 'bg-pink', 'bg-charcoal-2', 'bg-teal', 'bg-cream', 'bg-pink'] as c, i (i)}
					<span class="flex-1 {c}"></span>
				{/each}
			</div>
			<div class="relative px-4">
				<p class="font-marker text-3xl text-pink sm:text-5xl">No signal (yet)</p>
				<p class="label mt-3 text-cream/80">Episode 01 drops here soon</p>
			</div>
		</div>
	{/if}
</div>
