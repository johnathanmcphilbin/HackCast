<script lang="ts">
	import { faqPreview } from '#lib/content.ts';
	import DisplayHeading from '../DisplayHeading.svelte';
	import FaqList from '../FaqList.svelte';
	import Frame from '../Frame.svelte';
</script>

<section id="answers" class="section" aria-labelledby="faq-title">
	<div class="wrap grid">
		<div class="intro">
			<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>
			<DisplayHeading id="faq-title" lines={[{ text: 'Questions?' }, { text: 'Answers.', accent: true }]} />
			<a class="more" href="/faq">All FAQs <span aria-hidden="true">→</span></a>
			<span class="edge" aria-hidden="true"></span>
		</div>
		<Frame>
			<div class="pad">
				<FaqList items={faqPreview} prefix="" openFirst />
			</div>
		</Frame>
	</div>
</section>

<style>
	.grid {
		display: grid;
		gap: 1.25rem;
	}
	.intro {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		min-height: 180px;
		padding: 1.2rem 1.4rem 1.4rem 1.2rem;
		overflow: hidden;
		background: #000;
	}
	.bars {
		display: flex;
		flex-direction: column;
		gap: 5px;
		width: 92px;
		margin-bottom: auto;
	}
	.bars i {
		display: block;
		height: 5px;
	}
	.bars i:nth-child(1) {
		width: 100%;
		background: var(--cyan);
	}
	.bars i:nth-child(2) {
		width: 72%;
		background: var(--mag);
	}
	.bars i:nth-child(3) {
		width: 48%;
		background: var(--cyan);
	}
	.more {
		margin-top: 1.25rem;
		color: var(--cyan);
		font-family: 'Space Mono', monospace;
		font-size: 0.78rem;
		letter-spacing: 0.12em;
		text-decoration: none;
		text-transform: uppercase;
	}
	.more:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.edge {
		position: absolute;
		top: -2%;
		right: 0;
		width: 8px;
		height: 104%;
		background: var(--mag);
		transform: skewX(-16deg);
	}
	.pad {
		padding: 0.35rem 0.9rem;
	}
	@media (min-width: 900px) {
		.grid {
			grid-template-columns: minmax(240px, 0.72fr) 1.28fr;
			gap: 1.5rem;
			align-items: stretch;
		}
		.intro {
			min-height: 100%;
		}
	}
</style>
