<script lang="ts">
	import { shopPrizes } from '#lib/content.ts';
	import SectionHeading from '../SectionHeading.svelte';
	import Sticker from '../Sticker.svelte';
	import Doodle from '../Doodle.svelte';

	const SLOTS = 4;
	const shelf = $derived(
		Array.from({ length: Math.max(SLOTS, shopPrizes.length) }, (_, i) => shopPrizes[i] ?? null)
	);
	const shelfTilts = [-3, 2, -1, 4];
</script>

<section id="rewards" class="relative bg-charcoal-2" aria-labelledby="rewards-title">
	<!-- Zig-zag "torn ticket" top edge -->
	<svg class="absolute -top-[15px] left-0 h-4 w-full text-charcoal-2" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true">
		<path d="M0 4 L2 0 L4 4 L6 0 L8 4 L10 0 L12 4 L14 0 L16 4 L18 0 L20 4 L22 0 L24 4 L26 0 L28 4 L30 0 L32 4 L34 0 L36 4 L38 0 L40 4 L42 0 L44 4 L46 0 L48 4 L50 0 L52 4 L54 0 L56 4 L58 0 L60 4 L62 0 L64 4 L66 0 L68 4 L70 0 L72 4 L74 0 L76 4 L78 0 L80 4 L82 0 L84 4 L86 0 L88 4 L90 0 L92 4 L94 0 L96 4 L98 0 L100 4 Z" fill="currentColor" />
	</svg>

	<div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
		<SectionHeading id="rewards-title">
			What you <span class="text-pink">get.</span>
		</SectionHeading>

		<div class="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
			<!-- Shop rewards: the headline reward -->
			<div class="relative lg:col-span-7">
				<p class="leading-[0.85] font-bold tracking-tighter">
					<span class="block text-[clamp(4.5rem,15vw,9rem)]">Hours</span>
					<span class="my-2 block -rotate-3 pl-[0.2em] font-marker text-[clamp(1.75rem,5vw,3rem)] font-normal tracking-normal text-teal">
						turn into
					</span>
					<span class="block text-[clamp(4.5rem,15vw,9rem)] text-pink">prizes.</span>
				</p>
				<p class="mt-8 max-w-md text-xl sm:text-2xl">
					Every approved hour you spend building earns shop credit to spend in the Hackcast shop.
				</p>
			</div>

			<div class="flex flex-col gap-12 lg:col-span-5">
				<!-- Every 5 hours: punch card -->
				<div>
					<h3 class="text-4xl font-bold">Every <span class="text-teal">5 hours</span></h3>
					<ol class="mt-5 flex gap-2" aria-label="Punch card: five approved hours">
						{#each [1, 2, 3, 4, 5] as hour (hour)}
							<li
								class="grid size-12 place-items-center border-3 font-mono font-bold sm:size-14 {hour === 5
									? 'border-pink bg-pink text-charcoal'
									: 'border-cream/40 text-cream/60'}"
							>
								{#if hour === 5}
									<Doodle kind="star" class="w-9 text-cream" />
									<span class="sr-only">Hour 5: unlocked</span>
								{:else}
									{hour}h
								{/if}
							</li>
						{/each}
					</ol>
					<p class="mt-5 text-lg sm:text-xl">
						Unlock the ability to submit a question for the podcast <strong class="text-teal">and</strong> earn an
						entry into the weekly prize wheel.
					</p>
				</div>

				<!-- Top builder of the week -->
				<div class="relative border-3 border-pink p-6 pt-8">
					<Sticker color="pink" tilt={-4} class="absolute -top-5 left-4 text-base">#1 this week</Sticker>
					<h3 class="text-4xl font-bold">Top builder of the week</h3>
					<p class="mt-3 text-lg sm:text-xl">
						Whoever ships the most approved hours that week gets to <strong class="text-pink">choose a topic</strong> or
						<strong class="text-pink">nominate a guest</strong> for a future Hackcast episode.
					</p>
				</div>
			</div>
		</div>

		<!-- Prize shelf: physical shop prizes go here once announced -->
		<div class="mt-24">
			<div class="flex flex-wrap items-baseline gap-x-5 gap-y-2">
				<h3 class="text-3xl font-bold">On the shop shelf</h3>
				<p class="font-marker text-lg text-teal">(the good stuff, announced soon)</p>
			</div>
			<ul class="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
				{#each shelf as prize, i (i)}
					<li class="relative bg-cream p-3 pb-10 text-charcoal" style:rotate="{shelfTilts[i % 4]}deg">
						<span class="tape -top-3 left-1/2 -translate-x-1/2 rotate-2" aria-hidden="true"></span>
						{#if prize}
							<img src={prize.image} alt={prize.alt} class="aspect-square w-full object-cover" />
							<p class="absolute bottom-2 left-3 font-marker">{prize.name}</p>
						{:else}
							<div class="grid aspect-square place-items-center border-3 border-dashed border-charcoal/40 text-center font-mono text-xs font-bold text-charcoal/60 uppercase">
								Prize photo<br />coming soon
							</div>
							<p class="absolute bottom-2 left-3 font-marker text-charcoal/70">???</p>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
