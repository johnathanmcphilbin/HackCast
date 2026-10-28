<script lang="ts">
	import { segments, topics } from '#lib/content.ts';
	import { latestEpisodeEmbed } from '#lib/site.ts';
	import EpisodePlayer from '../EpisodePlayer.svelte';

	const topicList =
		topics.length <= 1
			? (topics[0] ?? '')
			: `${topics.slice(0, -1).join(', ')}, and ${topics[topics.length - 1]}`;
</script>

<section id="show" aria-labelledby="show-title">
	<div class="wrap grid gap-x-16 gap-y-12 py-16 lg:grid-cols-2 lg:py-28">
		<div>
			<h2 id="show-title" class="text-3xl font-bold tracking-tight md:text-4xl">The show</h2>
			<p class="mt-4 max-w-xl text-xl leading-snug">
				Teenagers, 25–40 minutes, every week. They talk about {topicList}. The release day is announced with the
				first episode.
			</p>
		</div>

		<div class="lg:row-span-2">
			<h3 class="text-2xl font-bold">Every episode</h3>
			<ol class="mt-5 border-t border-l-2 border-t-cream/20 border-l-pink">
				{#each segments as seg (seg.cue)}
					<li class="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 border-b border-cream/20 py-4 pl-4">
						<span class="font-mono text-lg font-bold text-pink" aria-hidden="true">{seg.cue}</span>
						<div>
							<h4 class="text-xl font-bold">{seg.title}</h4>
							<p class="mt-1 leading-snug">{seg.body}</p>
						</div>
					</li>
				{/each}
			</ol>
		</div>

		<EpisodePlayer embedUrl={latestEpisodeEmbed} />
	</div>
</section>
