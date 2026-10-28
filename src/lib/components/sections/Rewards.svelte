<script lang="ts">
	import { hourTiers, shopLine, shopPrizes, shopSlotCount } from '#lib/content.ts';
	import DisplayHeading from '../DisplayHeading.svelte';
	import Frame from '../Frame.svelte';
	import PrizeWheel from '../PrizeWheel.svelte';

	const shelf = $derived(
		Array.from({ length: Math.max(shopSlotCount, shopPrizes.length) }, (_, i) => shopPrizes[i] ?? null)
	);
</script>

<section id="rewards" class="section" aria-labelledby="rewards-title">
	<div class="wrap">
		<div class="top">
			<div class="title">
				<DisplayHeading
					id="rewards-title"
					lines={[{ text: 'Hours in.' }, { text: 'Prizes out.', accent: true }]}
				/>
				<p class="shop-line">{shopLine}</p>
				<div class="hatch" aria-hidden="true"></div>
			</div>

			<Frame>
				<div class="rates">
				<p class="kicker head">Spend hours on the show</p>
				<ul>
					{#each hourTiers as tier (tier.id)}
						<li>
							<span class="hours">{tier.label}</span>
							{#if tier.id === 'guest'}
								<span class="tag tag-acid-line">{tier.action}</span>
							{:else}
								<span class="action">{tier.action}</span>
							{/if}
						</li>
					{/each}
				</ul>
				</div>
			</Frame>
		</div>

		<div class="band" aria-hidden="true"><i></i><i></i></div>

		<div class="shelf">
			<p class="kicker">On the shop shelf — announced soon</p>
			<ul>
				{#each shelf as prize, i (i)}
					<li class="frame frame-mag">
						<span class="frame-c tl" aria-hidden="true"></span>
						<span class="frame-c tr" aria-hidden="true"></span>
						<span class="frame-c bl" aria-hidden="true"></span>
						<span class="frame-c br" aria-hidden="true"></span>
						{#if prize}
							<img src={prize.image} alt={prize.alt} />
							<span class="name">{prize.name}</span>
						{:else}
							<span class="tba">Prize [TBA]</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>

		<Frame>
			<div class="wheel-row">
			<div>
				<p class="kicker">Prize wheel</p>
				<p class="wheel-note">Spun on the show. Prizes land when the shop does.</p>
			</div>
			<PrizeWheel />
			</div>
		</Frame>
	</div>
</section>

<style>
	.top {
		display: grid;
		gap: 1.5rem;
	}
	.title {
		position: relative;
		overflow: hidden;
		padding-bottom: 0.5rem;
	}
	.hatch {
		display: none;
		position: absolute;
		top: 8%;
		right: 0;
		width: 34%;
		height: 78%;
		background: repeating-linear-gradient(-72deg, transparent 0 14px, #ff2e88 14px 22px);
		opacity: 0.9;
		pointer-events: none;
	}
	.title :global(.display) {
		position: relative;
		z-index: 1;
	}
	.shop-line {
		position: relative;
		z-index: 1;
		max-width: 28ch;
		margin: 1rem 0 0;
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		line-height: 1.5;
		text-transform: uppercase;
	}
	.rates {
		padding: 0.9rem 1rem 0.3rem;
	}
	.head {
		margin-bottom: 0.35rem;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.rates li {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.75rem 1.25rem;
		align-items: center;
		padding: 0.85rem 0;
		border-top: 1px solid var(--line);
	}
	.hours {
		color: var(--cyan);
		font-family: 'Tektur', sans-serif;
		font-size: clamp(1.15rem, 2vw, 1.55rem);
		white-space: nowrap;
		font-weight: 700;
		letter-spacing: 0.03em;
		line-height: 1;
		text-transform: uppercase;
	}
	.action {
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.78rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.band {
		display: flex;
		gap: 8px;
		height: 8px;
		margin: 1.4rem 0 1.5rem;
		transform: skewX(-18deg);
	}
	.band i:first-child {
		flex: 1.4;
		background: var(--mag);
	}
	.band i:last-child {
		flex: 0.5;
		background: var(--cyan);
	}
	.shelf > ul {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
		margin-top: 0.8rem;
	}
	.shelf li {
		display: grid;
		min-height: 130px;
		place-items: center;
		padding: 0.8rem;
		background: var(--void);
	}
	.shelf img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
	}
	.tba,
	.name {
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.wheel-row {
		display: grid;
		gap: 1.25rem;
		margin-top: 1.75rem;
		padding: 1.25rem;
	}
	.wheel-note {
		max-width: 36ch;
		margin: 0.45rem 0 0;
		color: #fff;
	}
	@media (min-width: 800px) {
		.shelf > ul {
			grid-template-columns: repeat(4, 1fr);
		}
		.shelf li {
			min-height: 160px;
		}
	}
	@media (min-width: 900px) {
		.hatch {
			display: block;
		}
		.top {
			grid-template-columns: 1.05fr 0.95fr;
			gap: 1.75rem;
			align-items: center;
		}
		.wheel-row {
			grid-template-columns: 1fr auto;
			align-items: center;
		}
	}
</style>
