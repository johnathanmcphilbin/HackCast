<script lang="ts">
	// Shows an embedded episode when `embedUrl` is set, otherwise a standby frame.
	let { embedUrl = null, title = 'Latest Hackcast episode' }: { embedUrl?: string | null; title?: string } =
		$props();
</script>

<div class="border border-cream/25">
	<div class="flex items-center justify-between gap-4 px-4 py-3 font-mono text-sm font-bold">
		<span class="flex items-center gap-2">
			<span class="size-2.5 rounded-full bg-teal {embedUrl ? 'animate-blink' : ''}" aria-hidden="true"></span>
			{embedUrl ? 'On air' : 'Standby'}
		</span>
		<span>Episode 01</span>
	</div>

	{#if embedUrl}
		<iframe
			src={embedUrl}
			{title}
			class="aspect-video w-full border-t border-cream/25"
			loading="lazy"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			allowfullscreen
		></iframe>
	{:else}
		<div class="grid aspect-video place-items-center border-t border-cream/25 px-6 text-center">
			<div>
				<p class="text-2xl font-bold tracking-tight sm:text-3xl">Nothing on air yet.</p>
				<p class="mt-2">The first episode will play here.</p>
			</div>
		</div>
	{/if}
</div>
