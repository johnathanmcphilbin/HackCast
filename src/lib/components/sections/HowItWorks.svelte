<script lang="ts">
	import { steps } from '#lib/content.ts';
	import SectionHeading from '../SectionHeading.svelte';
	import Doodle from '../Doodle.svelte';

	// Each row steps in a little further, like a hand-written running order.
	const indents = ['md:ml-0', 'md:ml-12', 'md:ml-24', 'md:ml-8'];
	const tilts = [-4, 3, -2, 5];
</script>

<section id="how-it-works" class="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28" aria-labelledby="how-title">
	<div class="flex flex-wrap items-end justify-between gap-6">
		<SectionHeading id="how-title">
			Four steps.<br /><span class="text-pink">Zero fluff.</span>
		</SectionHeading>
		<p class="max-w-xs font-marker text-xl -rotate-2 text-cream/80">
			the whole programme fits on the back of a cassette ↓
		</p>
	</div>

	<ol class="mt-14 border-t-3 border-dashed border-charcoal-2">
		{#each steps as step, i (step.n)}
			<li
				class="group relative grid grid-cols-[auto_1fr] items-baseline gap-x-5 border-b-3 border-dashed border-charcoal-2 py-8 sm:gap-x-8 md:grid-cols-[8rem_16rem_1fr] {indents[i]}"
			>
				<span
					class="outline-text row-span-2 text-6xl leading-none font-bold text-pink transition-colors group-hover:[-webkit-text-fill-color:var(--color-pink)] sm:text-8xl md:row-span-1"
					aria-hidden="true">{step.n}</span
				>
				<h3 class="text-4xl font-bold sm:text-5xl">
					<span class="sr-only">Step {step.n}: </span>{step.title}
				</h3>
				<div class="col-start-2 md:col-start-3">
					<p class="max-w-md text-lg text-cream/90 sm:text-xl">{step.body}</p>
					<p
						class="mt-3 inline-block font-marker text-lg text-teal"
						style:rotate="{tilts[i]}deg"
						aria-hidden="true"
					>
						{step.note}
					</p>
				</div>
			</li>
		{/each}
	</ol>

	<Doodle kind="sparkle" class="absolute right-6 bottom-10 hidden w-10 text-pink md:block" />
</section>
