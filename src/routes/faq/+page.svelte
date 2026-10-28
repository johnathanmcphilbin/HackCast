<script lang="ts">
	import { faqs } from '#lib/content.ts';
	import { JOIN_HREF } from '#lib/site.ts';
	import Seo from '#lib/components/Seo.svelte';
	import DisplayHeading from '#lib/components/DisplayHeading.svelte';
	import FaqList from '#lib/components/FaqList.svelte';
	import Frame from '#lib/components/Frame.svelte';

	const first = faqs.slice(0, 5);
	const rest = faqs.slice(5);
</script>

<Seo
	title="FAQ | Hackcast"
	description="Answers about Hackcast, the Hack Club You Ship, We Ship podcast. Some rules are still being finalised."
/>

<div class="page">
	<div class="layout">
		<div class="intro">
			<p class="kicker">// FAQ</p>
			<DisplayHeading
				as="h1"
				size="lg"
				lines={[{ text: 'Frequently' }, { text: 'asked' }, { text: 'questions', accent: true }]}
			/>
			<span class="rule" aria-hidden="true"></span>
			<p class="note">Some rules are still being finalised. We'll update these answers before launch.</p>
			<img class="word" src="/brand/wm-big.png" alt="" width="855" height="522" />
		</div>

		<div class="col">
			<Frame>
				<div class="pad">
					<FaqList items={first} openFirst />
				</div>
			</Frame>

			<div class="more">
				<DisplayHeading size="md" lines={[{ text: 'More' }, { text: 'answers', accent: true }]} />
				<p class="kicker path">Hackcast / FAQ</p>
			</div>

			<Frame>
				<div class="pad">
					<FaqList items={rest} start={6} />
				</div>
			</Frame>
		</div>
	</div>

	<section class="close" aria-labelledby="seen-title">
		<Frame>
			<div class="panel">
			<DisplayHeading id="seen-title" lines={[{ text: 'Seen' }, { text: 'enough?', accent: true }]} />
			<span class="rule" aria-hidden="true"></span>
			<a class="btn-hit btn-ghost" href={JOIN_HREF}>
				<span class="btn-face">Join Hackcast <span aria-hidden="true">→</span></span>
			</a>
			</div>
		</Frame>
	</section>
</div>

<style>
	.page {
		padding: 1.5rem var(--gutter) 2.5rem;
	}
	.layout {
		display: grid;
		gap: 1.5rem;
	}
	.intro {
		position: relative;
	}
	.intro::before {
		content: '';
		position: absolute;
		top: 0;
		left: -0.9rem;
		width: 4px;
		height: 5.5rem;
		background: var(--mag);
	}
	.rule {
		display: block;
		width: 4.5rem;
		height: 4px;
		margin: 1rem 0;
		background: var(--mag);
	}
	.note {
		max-width: 32ch;
		margin: 0;
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		line-height: 1.5;
		text-transform: uppercase;
	}
	.word {
		display: block;
		width: min(240px, 70%);
		margin-top: 1.5rem;
	}
	.pad {
		padding: 0.25rem 0.9rem;
	}
	.more {
		padding: 1.75rem 0 0.4rem;
	}
	.path {
		margin-top: 0.8rem;
	}
	.close {
		margin-top: 2rem;
	}
	.panel {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		padding: 1.5rem 1.15rem 1.6rem;
	}
	@media (min-width: 900px) {
		.layout {
			grid-template-columns: minmax(240px, 340px) minmax(0, 1fr);
			gap: 1.75rem;
			align-items: start;
		}
		.intro {
			position: sticky;
			top: 5.5rem;
		}
	}
	@media (max-width: 899px) {
		.close :global(.btn-hit) {
			width: 100%;
		}
	}
</style>
