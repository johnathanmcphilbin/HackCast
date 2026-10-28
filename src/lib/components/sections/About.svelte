<script lang="ts">
	import { segments, showBlurb } from '#lib/content.ts';
	import { latestEpisodeEmbed } from '#lib/site.ts';
	import DisplayHeading from '../DisplayHeading.svelte';
	import EpisodePlayer from '../EpisodePlayer.svelte';
	import Frame from '../Frame.svelte';
</script>

<section id="show" class="section" aria-labelledby="show-title">
	<div class="wrap">
		<div class="split">
			<div class="title">
				<DisplayHeading
					id="show-title"
					lines={[
						{ text: 'Teens.' },
						{ text: 'Microphones.' },
						{ text: 'Opinions.', accent: true }
					]}
				/>
				<span class="rule" aria-hidden="true"></span>
				<p>{showBlurb}</p>
			</div>
			<Frame>
				<div class="order">
				<p class="kicker">Running order</p>
				<ol>
					{#each segments as seg (seg.cue)}
						<li>
							<span>{seg.cue}</span>
							<strong>{seg.title}</strong>
						</li>
					{/each}
				</ol>
				</div>
			</Frame>
		</div>
		<div class="player">
			<EpisodePlayer embedUrl={latestEpisodeEmbed} />
		</div>
	</div>
</section>

<style>
	.split {
		display: grid;
		gap: 1.25rem;
	}
	.title {
		padding: 0.25rem 0 0.5rem;
	}
	.rule {
		display: block;
		width: 4.5rem;
		height: 4px;
		margin: 1.1rem 0 0.9rem;
		background: var(--mag);
	}
	p {
		max-width: 42ch;
		margin: 0;
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.78rem;
		letter-spacing: 0.08em;
		line-height: 1.55;
		text-transform: uppercase;
	}
	.order {
		padding: 0.85rem 1rem 0.4rem;
	}
	ol {
		margin: 0.35rem 0 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 0.75rem;
		align-items: baseline;
		padding: 0.7rem 0;
		border-top: 1px solid var(--line);
	}
	li span {
		color: var(--cyan);
		font-family: 'Tektur', sans-serif;
		font-size: 1.45rem;
		font-weight: 700;
		line-height: 1;
	}
	li strong {
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.78rem;
		font-weight: 400;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.player {
		margin-top: 1.25rem;
	}
	@media (min-width: 900px) {
		.split {
			grid-template-columns: 1.05fr 0.95fr;
			gap: 1.5rem;
			align-items: stretch;
		}
		.title {
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			padding-right: 1rem;
			border-right: 4px solid var(--cyan);
		}
	}
</style>
