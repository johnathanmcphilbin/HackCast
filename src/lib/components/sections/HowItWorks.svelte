<script lang="ts">
	import { steps } from '#lib/content.ts';
</script>

<section id="how-it-works" class="border-t border-cream/20" aria-labelledby="how-title">
	<div class="wrap grid gap-8 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 lg:py-24">
		<div>
			<h2 id="how-title" class="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
			<p class="mt-3 text-lg">Build something, log it, spend the hours.</p>
		</div>

		<ol class="border-t border-cream/20">
			{#each steps as step (step.n)}
				<li
					class="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 border-b border-cream/20 py-6 md:grid-cols-[4rem_minmax(10rem,14rem)_minmax(0,1fr)] md:items-start"
				>
					<span class="pt-1.5 font-mono text-sm font-bold text-teal" aria-hidden="true">{step.n}</span>
					<h3 class="text-2xl font-bold tracking-tight">
						<span class="sr-only">Step {step.n}: </span>{step.title}
					</h3>
					<p class="col-start-2 mt-1 text-lg leading-snug md:col-start-3 md:mt-0.5">{step.body}</p>
				</li>
			{/each}
		</ol>
	</div>
</section>
