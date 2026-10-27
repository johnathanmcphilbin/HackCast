<script lang="ts">
	import SectionHeading from '../SectionHeading.svelte';
	import PrizeWheel from '../PrizeWheel.svelte';
	import Sticker from '../Sticker.svelte';

	const flow = [
		{ k: '5 hrs', t: 'Ship 5 approved hours', b: 'Every five approved hours unlocks one question.' },
		{ k: 'Q?', t: 'Send in your question', b: 'Ask the hosts anything: a hot take, a debate, a "how did you…".' },
		{ k: 'On air', t: 'Hear it on Hackcast', b: 'Selected questions are featured on the show, with a shoutout to you.' },
		{ k: 'Spin', t: 'Get a wheel entry', b: 'You also get an entry into the weekly prize wheel for a chance at extra rewards.' }
	];
</script>

<section id="questions" class="relative overflow-hidden bg-charcoal-2" aria-labelledby="questions-title">
	<div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
		<SectionHeading id="questions-title">
			Your question.<br /><span class="text-pink">Our mics.</span>
		</SectionHeading>

		<div class="mt-14 grid items-start gap-16 lg:grid-cols-[1.2fr_1fr]">
			<div>
				<!-- Example question slip -->
				<div class="relative max-w-md -rotate-2 bg-cream p-6 pt-8 text-charcoal shadow-[8px_8px_0_var(--color-pink)]">
					<span class="tape -top-3 left-8 -rotate-3" aria-hidden="true"></span>
					<p class="label text-charcoal/60">Question slip · example</p>
					<blockquote class="mt-3 font-marker text-2xl leading-snug sm:text-3xl">
						"What's the most cursed thing you've ever shipped, and would you ship it again?"
					</blockquote>
					<p class="mt-4 font-mono text-sm">
						from <strong>@you</strong> · 5 approved hours
					</p>
					<Sticker color="pink" tilt={12} class="absolute -right-4 -bottom-5 text-base">shoutout!</Sticker>
				</div>

				<ol class="mt-16 space-y-6">
					{#each flow as step, i (step.k)}
						<li class="flex gap-5">
							<span
								class="grid h-14 w-20 shrink-0 place-items-center border-3 font-mono text-sm font-bold uppercase {i === 2
									? 'border-pink bg-pink text-charcoal'
									: 'border-teal text-teal'}">{step.k}</span
							>
							<div>
								<h3 class="text-2xl font-bold">{step.t}</h3>
								<p class="mt-1 text-lg text-cream/80">{step.b}</p>
							</div>
						</li>
					{/each}
				</ol>
			</div>

			<div class="lg:sticky lg:top-28">
				<p class="mb-8 text-center text-2xl font-bold">
					The weekly <span class="text-teal">prize wheel</span>
				</p>
				<PrizeWheel />
			</div>
		</div>
	</div>
</section>
