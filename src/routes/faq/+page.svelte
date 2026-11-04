<script lang="ts">
	import p1 from '#lib/boards/faq-p1.html?raw';
	import p2 from '#lib/boards/faq-p2.html?raw';
	import { faqs } from '#lib/content.ts';
	import { JOIN_HREF } from '#lib/site.ts';
	import Board from '#lib/components/Board.svelte';
	import Seo from '#lib/components/Seo.svelte';
</script>

<Seo title="FAQ | Hackcast" description="Questions about Hackcast, the Hack Club You Ship, We Ship podcast. Some rules are still being finalised." />

<div class="desk">
	<Board html={p1} />
	<Board html={p2} />
</div>

<div class="phone">
	<p class="station-sign">the log book · faq</p>
	<h1>frequently asked <span class="r">questions.</span></h1>
	{#each faqs as item (item.id)}
		<details class="card">
			<summary>{item.q}</summary>
			<p>{item.a}</p>
		</details>
	{/each}
	<p><a class="redbtn" href={JOIN_HREF}>rsvp for hackcast →</a></p>
</div>

<style>
	summary {
		cursor: pointer;
		font-family: 'Archivo Black', sans-serif;
	}
</style>
