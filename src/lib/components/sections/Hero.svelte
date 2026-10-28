<script lang="ts">
	import { episodeRuntime, hero } from '#lib/content.ts';
	import { JOIN_HREF } from '#lib/site.ts';
	import DisplayHeading from '../DisplayHeading.svelte';

	const specs = [
		{ dt: 'Runtime', dd: episodeRuntime.label },
		{ dt: 'Schedule', dd: episodeRuntime.schedule },
		{ dt: 'Hosts', dd: episodeRuntime.hosts }
	];
</script>

<section class="hero" aria-labelledby="hero-title">
	<div class="copy">
		<p class="kicker">{hero.kicker}</p>
		<DisplayHeading
			as="h1"
			id="hero-title"
			size="xl"
			glitch
			lines={[
				{ text: 'Build stuff.' },
				{ text: 'Get rewarded.' },
				{ text: 'Run the show.', accent: true }
			]}
		/>
		<p class="lede">{hero.lede}</p>
		<div class="actions">
			<a class="btn-hit btn-primary" href={JOIN_HREF}>
				<span class="btn-face">Join Hackcast <span aria-hidden="true">→</span></span>
			</a>
			<a class="btn-hit btn-secondary" href="#how-it-works">
				<span class="btn-face">How it works <span aria-hidden="true">↓</span></span>
			</a>
		</div>
		<dl class="specs-mobile">
			<div>
				<dt class="kicker">Runtime</dt>
				<dd>{episodeRuntime.label}</dd>
			</div>
			<div>
				<dt class="kicker">Schedule</dt>
				<dd>{episodeRuntime.schedule}</dd>
			</div>
			<div>
				<dt class="kicker">Hosts</dt>
				<dd>{episodeRuntime.hosts}</dd>
			</div>
		</dl>
	</div>

	<div class="stage">
		<div class="art">
			<img src="/brand/skyline.png" alt="Night skyline under a magenta sun." width="1920" height="1080" />
		</div>
		<div class="slash" aria-hidden="true"></div>
		<span class="corner tl" aria-hidden="true"></span>
		<span class="corner bl" aria-hidden="true"></span>
		<aside class="rec" aria-label="This episode">
			<header>
				<span class="tag tag-acid">Rec</span>
				<span class="kicker">{episodeRuntime.channel}</span>
			</header>
			<dl>
				{#each specs as row (row.dt)}
					<div>
						<dt>{row.dt}</dt>
						<dd>{row.dd}</dd>
					</div>
				{/each}
			</dl>
		</aside>
		<div class="stripes" aria-hidden="true"><i></i><i></i></div>
	</div>
</section>

<style>
	.hero {
		display: grid;
		align-items: stretch;
	}
	.copy {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.25rem;
		padding: 2.25rem var(--gutter) 1.5rem;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
	}
	.specs-mobile {
		display: grid;
		gap: 0.35rem;
		margin: 0.4rem 0 0;
		padding: 0.85rem 0.9rem;
		border: 1px solid var(--cyan);
	}
	.specs-mobile div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	.specs-mobile dd {
		margin: 0;
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.stage {
		position: relative;
		order: -1;
		min-height: 210px;
		overflow: hidden;
	}
	.art {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	.art img {
		width: 100%;
		height: 100%;
		max-width: none;
		object-fit: cover;
		object-position: 72% center;
	}
	.art::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, var(--void), transparent 42%);
	}
	.slash,
	.rec,
	.stripes,
	.corner {
		display: none;
	}
	@media (min-width: 900px) {
		.hero {
			grid-template-columns: minmax(0, 1.12fr) minmax(280px, 0.88fr);
			min-height: calc(100svh - 5.5rem);
		}
		.copy {
			padding: 3rem 2rem 3rem var(--gutter);
			gap: 1.5rem;
		}
		.specs-mobile {
			display: none;
		}
		.stage {
			order: 0;
			min-height: 100%;
		}
		.art {
			clip-path: polygon(12% 0, 100% 0, 100% 100%, 0 100%);
		}
		.art::after {
			background: linear-gradient(to right, rgb(11 11 18 / 0.2), transparent 30%);
		}
		.slash {
			display: block;
			position: absolute;
			top: -4%;
			bottom: -4%;
			left: 7%;
			z-index: 2;
			width: 16px;
			background: linear-gradient(90deg, #ff2e88 0 42%, #0b0b12 42% 58%, #2de2e6 58% 100%);
			transform: rotate(9deg);
			transform-origin: center;
		}
		.corner {
			display: block;
			position: absolute;
			z-index: 2;
			width: 18px;
			height: 18px;
			border-color: var(--cyan);
			border-style: solid;
		}
		.corner.tl {
			top: 14px;
			right: 14px;
			border-width: 2px 2px 0 0;
		}
		.corner.bl {
			bottom: 14px;
			left: 18%;
			border-width: 0 0 2px 2px;
		}
		.rec {
			display: block;
			position: absolute;
			right: 1.25rem;
			bottom: 1.6rem;
			z-index: 3;
			width: min(300px, 78%);
			padding: 0.85rem 0.95rem 0.35rem;
			border: 1px solid var(--line);
			background: rgb(11 11 18 / 0.92);
		}
		.rec header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 0.35rem;
		}
		.rec dl {
			margin: 0;
		}
		.rec div {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: 1rem;
			padding: 0.55rem 0;
			border-top: 1px solid var(--line);
		}
		.rec dt {
			color: var(--cyan);
			font-family: 'Space Mono', monospace;
			font-size: 0.72rem;
			letter-spacing: 0.12em;
			text-transform: uppercase;
		}
		.rec dd {
			margin: 0;
			color: #fff;
			font-family: 'Space Mono', monospace;
			font-size: 0.72rem;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}
		.stripes {
			display: flex;
			position: absolute;
			bottom: 1.4rem;
			left: 14%;
			z-index: 2;
			flex-direction: column;
			gap: 6px;
			width: 140px;
		}
		.stripes i {
			display: block;
			height: 6px;
			transform: skewX(-28deg);
		}
		.stripes i:first-child {
			width: 100%;
			background: var(--mag);
		}
		.stripes i:last-child {
			width: 62%;
			background: var(--cyan);
		}
	}
	@media (max-width: 899px) {
		.actions {
			flex-direction: column;
		}
		.actions :global(.btn-hit) {
			width: 100%;
		}
	}
</style>
