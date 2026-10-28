<script lang="ts">
	import { fiveRate, hourRate, weekRate, shopEmpty, shopPrizes } from '#lib/content.ts';
	import PrizeWheel from '../PrizeWheel.svelte';
</script>

<section id="rewards" class="on-paper bg-cream text-charcoal" aria-labelledby="rewards-title">
	<div class="h-1.5 bg-pink" aria-hidden="true"></div>
	<div class="wrap py-16 md:py-24">
		<h2
			id="rewards-title"
			class="max-w-3xl text-[clamp(2.35rem,5vw,4.25rem)] leading-[0.95] font-bold tracking-tight text-balance"
		>
			{fiveRate.title}
		</h2>
		<p class="mt-5 max-w-xl text-xl leading-snug">{fiveRate.body}</p>

		<div class="mt-12 grid gap-10 border-t border-charcoal/15 pt-8 md:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)] md:items-start">
			<PrizeWheel />
			<div>
				<p class="font-mono text-sm font-bold">{hourRate.label}</p>
				<h3 class="mt-2 text-2xl font-bold">{hourRate.title}</h3>
				<p class="mt-2 text-lg leading-snug">{hourRate.body}</p>
				{#if shopPrizes.length === 0}
					<p class="mt-2 text-lg leading-snug">{shopEmpty}</p>
				{/if}
			</div>
			<div>
				<p class="font-mono text-sm font-bold">{weekRate.label}</p>
				<h3 class="mt-2 text-2xl font-bold">{weekRate.title}</h3>
				<p class="mt-2 text-lg leading-snug">{weekRate.body}</p>
			</div>
		</div>

		{#if shopPrizes.length}
			<ul class="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
				{#each shopPrizes as prize (prize.name)}
					<li>
						<img src={prize.image} alt={prize.alt} class="aspect-square w-full border-2 border-charcoal object-cover" />
						<p class="mt-2 font-bold">{prize.name}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
