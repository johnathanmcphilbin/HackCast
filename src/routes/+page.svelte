<script lang="ts">
	import { episodes, home, hourTiers, published, rewardLine, shop, steps } from '#lib/content.ts';
	import Mixer from '#lib/components/Mixer.svelte';
	import Turntable from '#lib/components/Turntable.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { JOIN_HREF } from '#lib/site.ts';
</script>

<Seo />

<div class="home">
	<section class="hero">
		<div class="hero-copy">
			<h1>HACKCAST</h1>
			<p class="lede">{home.lede}</p>
			<p class="cta-row">
				<a class="redbtn cta" href={JOIN_HREF}>join hackcast →</a>
			</p>
		</div>
		<div class="hero-visual">
			<Turntable />
		</div>
	</section>

	<section class="band" id="how">
		<div class="how">
			<div class="how-copy">
				<p class="kicker">how it works</p>
				<h2>Build. Log hours. <span class="r">Ship it.</span></h2>
				<p>{home.howIntro}</p>
				<p>{home.who}</p>
				<ol class="steps">
					{#each steps as step (step.n)}
						<li>
							<p class="mono">{step.n}</p>
							<h3>{step.title}</h3>
							<p>{step.body}</p>
						</li>
					{/each}
				</ol>
				<!-- One statement of the hours mechanic. Tier cards replace it once numbers are real. -->
				{#if published.hourTiers}
					<ul class="tiers">
						{#each hourTiers as tier (tier.id)}
							<li>
								<p class="mono">{tier.channel} · {tier.label}</p>
								<h3>{tier.title}</h3>
								<p>{tier.detail}</p>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mechanic" id="rewards">{rewardLine}</p>
				{/if}
				{#if published.shop}
					<div class="shop">
						<h3>the hackcast shop</h3>
						<p>{shop.blurb}</p>
						<ul>
							{#each shop.sleeves as sleeve (sleeve.id)}
								<li>{sleeve.title} · {sleeve.note}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
			<div class="how-visual">
				<Mixer />
			</div>
		</div>
	</section>

	<section class="show" id="show">
		<div class="show-inner">
			<p class="kicker">the show</p>
			<h2>{home.showTitle}</h2>
			{#each home.show as paragraph, i (i)}
				<p>{paragraph}</p>
			{/each}
			{#if published.tracklist}
				<ol class="tracklist">
					{#each episodes as episode (episode.id)}
						<li>
							<span class="mono">{episode.id}</span>
							{episode.title}
							<span class="mono">{episode.status}</span>
						</li>
					{/each}
				</ol>
			{/if}
		</div>
	</section>

	<section class="finale">
		<p class="onair" aria-hidden="true"><span class="onair-lit">ON AIR</span></p>
		<h2>{home.finaleTitle}</h2>
		<p>{home.finale}</p>
		<p class="cta-row">
			<a class="redbtn cta" href={JOIN_HREF}>join hackcast →</a>
		</p>
	</section>
</div>

<style>
	.home {
		background-color: var(--bg);
		background-image: radial-gradient(#314664 1.3px, transparent 1.5px);
		background-size: 28px 28px;
		color: var(--cream);
	}
	.hero,
	.how,
	.show-inner,
	.finale {
		width: min(1120px, calc(100% - 2.4rem));
		margin-inline: auto;
	}
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(240px, 0.85fr);
		gap: 1.5rem 2rem;
		align-items: center;
		min-height: calc(100vh - 6.5rem);
		padding: 1.5rem 0 2.5rem;
	}
	h1 {
		margin: 0;
		font-family: Bungee, sans-serif;
		font-size: clamp(3.4rem, 8vw, 6.4rem);
		font-weight: 400;
		line-height: 0.9;
		letter-spacing: 0.01em;
		color: var(--cream);
	}
	.lede {
		margin: 1rem 0 0;
		max-width: 18ch;
		font-size: clamp(1.35rem, 2.4vw, 1.85rem);
		font-weight: 800;
		line-height: 1.25;
		color: var(--cream);
	}
	.cta-row {
		margin: 1.4rem 0 0;
	}
	.cta {
		font-size: 1.35rem;
		padding: 0.85rem 1.25rem;
		cursor: pointer;
	}
	.cta:hover {
		transform: translate(2px, 2px);
		box-shadow: 3px 3px 0 var(--shadow);
	}
	.hero-visual {
		max-width: 460px;
		margin-inline: auto;
	}
	.band {
		background: #152033;
		border-block: 3px solid var(--shadow);
	}
	.how {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.9fr);
		gap: 2rem 2.5rem;
		align-items: center;
		padding: 4.2rem 0;
	}
	.kicker {
		margin: 0 0 0.7rem;
		font-family: 'Space Mono', monospace;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--cream);
	}
	h2 {
		margin: 0 0 0.9rem;
		font-family: 'Archivo Black', sans-serif;
		font-size: clamp(2.1rem, 4.6vw, 3.4rem);
		font-weight: 400;
		line-height: 1.02;
		color: var(--cream);
	}
	.how-copy > p,
	.show-inner > p,
	.finale > p {
		margin: 0 0 0.9rem;
		max-width: 42rem;
		font-size: 1.08rem;
		font-weight: 700;
		line-height: 1.5;
		color: var(--cream);
	}
	.steps,
	.tiers,
	.tracklist {
		list-style: none;
		margin: 1.2rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.75rem;
	}
	.steps li,
	.tiers li,
	.tracklist li {
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		box-shadow: 6px 6px 0 var(--shadow);
		padding: 0.85rem 1rem 0.95rem;
	}
	.steps .mono,
	.tiers .mono,
	.tracklist .mono {
		color: var(--red);
		font-size: 0.85rem;
	}
	.steps h3,
	.tiers h3,
	.shop h3 {
		margin: 0.1rem 0 0.3rem;
		font-family: 'Archivo Black', sans-serif;
		font-size: 1.45rem;
		font-weight: 400;
		color: var(--ink);
	}
	.steps p,
	.tiers p,
	.shop p,
	.shop li {
		margin: 0;
		color: var(--ink);
		font-weight: 700;
		line-height: 1.45;
	}
	.mechanic {
		margin-top: 1.1rem;
		padding: 0.9rem 1rem;
		background: var(--red);
		color: #fff;
		border: 3px solid var(--shadow);
		box-shadow: 6px 6px 0 var(--shadow);
		font-weight: 800;
	}
	.shop {
		margin-top: 1rem;
	}
	.shop ul {
		margin: 0.4rem 0 0;
		padding-left: 1.1rem;
	}
	.show {
		padding: 4.2rem 0 3.2rem;
	}
	.tracklist {
		margin-top: 1.4rem;
	}
	.finale {
		padding: 3.5rem 0 4.8rem;
		text-align: left;
	}
	.onair {
		display: inline-block;
		margin: 0 0 1rem;
		padding: 0.45rem 0.85rem;
		background: var(--red);
		color: #fff;
		border: 3px solid var(--shadow);
		box-shadow: 6px 6px 0 var(--shadow);
		border-radius: 8px;
		font-family: Bungee, sans-serif;
		font-size: 1.55rem;
		letter-spacing: 0.14em;
	}
	@media (max-width: 800px) {
		.hero,
		.how {
			grid-template-columns: 1fr;
			min-height: 0;
		}
		.hero {
			padding-top: 0.6rem;
		}
		.hero-visual {
			max-width: 320px;
			order: 2;
		}
		.lede {
			max-width: 16ch;
		}
		.cta {
			display: flex;
			justify-content: center;
			width: 100%;
			box-sizing: border-box;
		}
		.how,
		.show,
		.finale {
			padding-top: 2.4rem;
			padding-bottom: 2.4rem;
		}
		.how {
			padding-bottom: 2.6rem;
		}
	}
</style>
