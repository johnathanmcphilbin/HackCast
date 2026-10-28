<script lang="ts">
	import { steps } from '#lib/content.ts';
	import DisplayHeading from '../DisplayHeading.svelte';
	import Frame from '../Frame.svelte';
</script>

<section id="how-it-works" class="section" aria-labelledby="how-title">
	<div class="wrap grid">
		<div class="title">
			<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
			<DisplayHeading
				id="how-title"
				lines={[{ text: 'Four steps.' }, { text: 'Zero fluff.', accent: true }]}
			/>
			<span class="edge" aria-hidden="true"></span>
		</div>
		<Frame class="sheet">
			<ol>
				{#each steps as step (step.n)}
					<li>
						<span class="num">{step.n}</span>
						<h3>{step.title}</h3>
						<p>{step.body}</p>
					</li>
				{/each}
			</ol>
		</Frame>
	</div>
</section>

<style>
	.grid {
		display: grid;
		gap: 1.25rem;
	}
	.title {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		min-height: 180px;
		padding: 1.25rem 1.5rem 1.4rem 1.25rem;
		overflow: hidden;
		background: #000;
	}
	.eq {
		display: flex;
		gap: 4px;
		align-items: flex-end;
		height: 16px;
		margin-bottom: auto;
	}
	.eq i {
		display: block;
		width: 8px;
		background: var(--cyan);
	}
	.eq i:nth-child(1) {
		height: 6px;
	}
	.eq i:nth-child(2) {
		height: 12px;
	}
	.eq i:nth-child(3) {
		height: 8px;
	}
	.eq i:nth-child(4) {
		height: 16px;
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
	ol {
		margin: 0;
		padding: 0.35rem 0;
		list-style: none;
	}
	li {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-areas:
			'num title'
			'num body';
		gap: 0.15rem 0.9rem;
		padding: 0.95rem 1rem;
		border-bottom: 1px solid var(--line);
	}
	li:last-child {
		border-bottom: 0;
	}
	.num {
		grid-area: num;
		align-self: center;
		color: var(--cyan);
		font-family: 'Tektur', sans-serif;
		font-size: clamp(1.8rem, 4vw, 2.6rem);
		font-weight: 700;
		line-height: 1;
	}
	h3 {
		grid-area: title;
		margin: 0;
		color: #fff;
		font-family: 'Chakra Petch', sans-serif;
		font-size: 1.35rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		line-height: 1.1;
		text-transform: uppercase;
	}
	p {
		grid-area: body;
		margin: 0;
		color: #fff;
		font-size: 1rem;
		line-height: 1.45;
	}
	@media (min-width: 900px) {
		.grid {
			grid-template-columns: minmax(240px, 0.78fr) 1.25fr;
			gap: 1.5rem;
			align-items: stretch;
		}
		.title {
			min-height: 100%;
			padding: 1.5rem 1.75rem 1.75rem;
		}
		li {
			grid-template-columns: 4.5rem 13.5rem 1fr;
			grid-template-areas: 'num title body';
			align-items: center;
			padding: 1.15rem 1.25rem;
		}
		h3 {
			padding-left: 0.9rem;
			border-left: 1px solid var(--line);
			white-space: nowrap;
		}
		p {
			font-size: 1.05rem;
		}
	}
</style>
