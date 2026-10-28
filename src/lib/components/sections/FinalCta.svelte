<script lang="ts">
	import { cta } from '#lib/content.ts';
	import { JOIN_HREF } from '#lib/site.ts';
	import DisplayHeading from '../DisplayHeading.svelte';
</script>

<section class="cta" aria-labelledby="cta-title">
	<div class="copy">
		<p class="kicker">A Hack Club YSWS programme · Ages 13–18</p>
		<DisplayHeading
			id="cta-title"
			lines={[{ text: 'Your turn' }, { text: 'on the' }, { text: 'mic.', accent: true }]}
		/>
		<p class="lede">{cta.lede}</p>
		<a class="btn-hit btn-ghost" href={JOIN_HREF}>
			<span class="btn-face">Join Hackcast <span aria-hidden="true">→</span></span>
		</a>
	</div>
	<div class="art">
		<img src="/brand/skyline.png" alt="" width="1920" height="1080" />
		<img class="word" src="/brand/wm-big.png" alt="Hackcast" width="855" height="522" />
		<div class="slash" aria-hidden="true"></div>
	</div>
</section>

<style>
	.cta {
		display: grid;
		overflow: hidden;
	}
	.copy {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.15rem;
		padding: 2.5rem var(--gutter) 1.5rem;
	}
	.art {
		position: relative;
		min-height: 240px;
		overflow: hidden;
	}
	.art img:first-child {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		object-fit: cover;
		object-position: 70% 40%;
	}
	.word {
		position: relative;
		z-index: 1;
		display: block;
		width: min(460px, 86%);
		margin: 2.2rem auto;
	}
	.slash {
		display: none;
	}
	@media (min-width: 900px) {
		.cta {
			grid-template-columns: 1fr 1fr;
			align-items: stretch;
		}
		.copy {
			justify-content: center;
			padding: 4rem var(--gutter);
		}
		.art {
			min-height: 460px;
			clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%);
		}
		.slash {
			display: block;
			position: absolute;
			top: -4%;
			bottom: -4%;
			left: 5%;
			z-index: 2;
			width: 16px;
			background: linear-gradient(90deg, #ff2e88 0 42%, #0b0b12 42% 58%, #2de2e6 58% 100%);
			transform: rotate(9deg);
		}
	}
	@media (max-width: 899px) {
		.copy :global(.btn-hit) {
			width: 100%;
		}
	}
</style>
