<script lang="ts">
	let { embedUrl = null, title = 'Latest Hackcast episode' }: { embedUrl?: string | null; title?: string } =
		$props();

	const bars = [8, 18, 12, 28, 16, 36, 22, 40, 14, 32, 20, 38, 10, 26, 18, 8];
</script>

<div class="player frame" role="group" aria-label={embedUrl ? title : 'Episode 01, coming soon'}>
	<span class="frame-c tl" aria-hidden="true"></span>
	<span class="frame-c tr" aria-hidden="true"></span>
	<span class="frame-c bl" aria-hidden="true"></span>
	<span class="frame-c br" aria-hidden="true"></span>

	{#if embedUrl}
		<iframe
			src={embedUrl}
			{title}
			class="embed"
			loading="lazy"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			allowfullscreen
		></iframe>
	{:else}
		<div class="standby">
			<div class="wave" aria-hidden="true">
				{#each bars as h, i (i)}
					<span style:height="{h}px"></span>
				{/each}
			</div>
			<p class="ep">
				<span>Ep. 01</span>
				<span class="soon">[Coming soon]</span>
			</p>
			<div class="transport" aria-hidden="true">
				<span class="time">00:00</span>
				<span class="track"></span>
				<span class="time">00:00</span>
				<span class="keys">
					<span>◀◀</span>
					<span class="play">▶</span>
					<span>▶▶</span>
				</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.player {
		background: var(--void);
	}
	.embed {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		border: 0;
	}
	.standby {
		display: grid;
		gap: 1rem;
		align-items: center;
		padding: 0.9rem;
	}
	.wave {
		display: flex;
		align-items: center;
		gap: 3px;
		width: 7.5rem;
		height: 3.25rem;
		padding: 0 0.4rem;
		border: 1px solid var(--line);
	}
	.wave span {
		flex: 1;
		background: var(--mag);
	}
	.ep {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem 1rem;
		align-items: baseline;
		margin: 0;
	}
	.ep span:first-child {
		color: var(--cyan);
		font-family: 'Space Mono', monospace;
		font-size: 0.8rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.soon {
		color: var(--acid);
		font-family: 'Tektur', sans-serif;
		font-size: clamp(1.4rem, 3vw, 2rem);
		font-weight: 900;
		letter-spacing: 0.02em;
		line-height: 1;
		text-transform: uppercase;
	}
	.transport {
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto auto;
		gap: 0.45rem 0.7rem;
		align-items: center;
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
	}
	.track {
		height: 1px;
		background: var(--line);
	}
	.time:last-of-type {
		grid-column: 3;
		grid-row: 1;
	}
	.keys {
		display: flex;
		gap: 0.7rem;
		grid-column: 1 / -1;
		justify-content: flex-end;
		color: var(--cyan);
		font-size: 0.85rem;
	}
	.play {
		display: grid;
		width: 2rem;
		height: 2rem;
		place-items: center;
		border: 1px solid var(--cyan);
	}
	@media (min-width: 800px) {
		.standby {
			grid-template-columns: auto 1fr auto;
			padding: 1rem 1.1rem;
		}
		.transport {
			grid-template-columns: auto 8rem auto;
			justify-items: end;
		}
		.keys {
			grid-column: 1 / -1;
		}
	}
</style>
