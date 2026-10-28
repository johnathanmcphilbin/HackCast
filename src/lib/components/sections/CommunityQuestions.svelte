<script lang="ts">
	import { questionExample, questionSteps } from '#lib/content.ts';
	import DisplayHeading from '../DisplayHeading.svelte';
	import Frame from '../Frame.svelte';
</script>

<section id="questions" class="section" aria-labelledby="questions-title">
	<div class="wrap split">
		<div>
			<DisplayHeading
				id="questions-title"
				lines={[{ text: 'Your question.' }, { text: 'Our mics.', accent: true }]}
			/>
			<Frame corner="mag">
				<div class="slip">
				<span class="tag tag-acid">On air</span>
				<blockquote>
					<span class="mark" aria-hidden="true">“</span>{questionExample.quote}<span aria-hidden="true">”</span>
				</blockquote>
				<p class="from">
					From {questionExample.from}
					<span aria-hidden="true"> · </span>
					{questionExample.hours} approved hours
				</p>
				</div>
			</Frame>
		</div>
		<ol class="flow">
			{#each questionSteps as step, i (step.n)}
				<li>
					<span class="num">{step.n}</span>
					<p>{step.title}</p>
					{#if i < questionSteps.length - 1}
						<span class="arrow" aria-hidden="true">↓</span>
					{/if}
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.split {
		display: grid;
		gap: 1.75rem;
	}
	.slip {
		max-width: 34rem;
		margin-top: 1.25rem;
		padding: 1rem 1rem 0.85rem;
		background: var(--void);
	}
	.tag {
		float: right;
	}
	blockquote {
		margin: 0.4rem 0 0;
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: clamp(0.95rem, 2vw, 1.2rem);
		letter-spacing: 0.04em;
		line-height: 1.45;
		text-transform: uppercase;
	}
	.from {
		margin: 0.9rem 0 0;
		padding-top: 0.75rem;
		border-top: 1px solid var(--line);
		color: var(--cyan);
		font-family: 'Space Mono', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.flow {
		display: grid;
		gap: 0.35rem;
		margin: 0;
		padding: 1rem 0.25rem;
		list-style: none;
		border-left: 4px solid var(--cyan);
	}
	.flow li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.15rem 0.9rem;
		align-items: center;
		padding: 0.35rem 0 0.35rem 1rem;
	}
	.num {
		color: var(--cyan);
		font-family: 'Tektur', sans-serif;
		font-size: clamp(2rem, 4vw, 2.8rem);
		font-weight: 700;
		line-height: 1;
	}
	.flow p {
		margin: 0;
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.78rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.arrow {
		grid-column: 1;
		color: var(--cyan);
		font-size: 1.1rem;
		line-height: 1;
	}
	@media (min-width: 900px) {
		.split {
			grid-template-columns: 1.15fr 0.85fr;
			gap: 2rem;
			align-items: end;
		}
		.flow {
			align-content: center;
			min-height: 100%;
			padding-left: 0.5rem;
		}
	}
</style>
