<script lang="ts">
	import { segments, topics } from '#lib/content.ts';
	import { latestEpisodeEmbed } from '#lib/site.ts';
	import SectionHeading from '../SectionHeading.svelte';
	import EpisodePlayer from '../EpisodePlayer.svelte';
	import Doodle from '../Doodle.svelte';
</script>

<section id="about" class="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28" aria-labelledby="about-title">
	<SectionHeading id="about-title">
		Teenagers. Microphones.<br /><span class="text-pink">Opinions.</span>
	</SectionHeading>

	<div class="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-12">
		<div>
			<p class="text-xl leading-relaxed sm:text-2xl">
				Hackcast is a weekly podcast featuring teenagers talking about
				{#each topics as topic, i (topic)}<span class="font-bold {i % 2 ? 'text-teal' : 'text-pink'}"
						>{topic}</span
					>{i < topics.length - 2 ? ', ' : i === topics.length - 2 ? ' and ' : '.'}{/each}
			</p>

			<dl class="mt-8 flex flex-wrap gap-3 font-mono text-sm font-bold uppercase">
				<div class="flex gap-2 border-3 border-cream px-3 py-2">
					<dt class="text-cream/60">Runtime</dt>
					<dd>25–40 min</dd>
				</div>
				<div class="flex gap-2 border-3 border-cream px-3 py-2">
					<dt class="text-cream/60">Schedule</dt>
					<dd>Weekly</dd>
				</div>
				<div class="flex gap-2 border-3 border-cream px-3 py-2">
					<dt class="text-cream/60">Hosts</dt>
					<dd>Teenagers</dd>
				</div>
			</dl>

			<div class="mt-12">
				<EpisodePlayer embedUrl={latestEpisodeEmbed} />
			</div>
		</div>

		<!-- The running order, like a cue sheet taped to the desk -->
		<div class="relative">
			<h3 class="flex items-center gap-3 text-3xl font-bold">
				Every episode
				<Doodle kind="arrow-down" class="h-12 text-teal" />
			</h3>
			<ol class="relative mt-6 border-l-3 border-pink pl-8">
				{#each segments as seg (seg.cue)}
					<li class="relative pb-8 last:pb-0">
						<span
							class="absolute top-0 -left-[3.15rem] grid size-9 place-items-center border-3 border-pink bg-charcoal font-mono font-bold text-pink"
							aria-hidden="true">{seg.cue}</span
						>
						<h4 class="text-2xl font-bold">{seg.title}</h4>
						<p class="mt-1 text-lg text-cream/80">{seg.body}</p>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>
