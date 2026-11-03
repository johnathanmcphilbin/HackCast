<script lang="ts">
	import { faqs } from '#lib/content.ts';
	import { JOIN_HREF } from '#lib/site.ts';
	import Seo from '#lib/components/Seo.svelte';
</script>

<Seo title="FAQ | Hackcast" description="Questions about Hackcast. Some rules are still being finalised." />

<div class="desk">
	<div class="faq">
		<p class="sticker">the log book · faq</p>
		<h1>frequently asked <span class="r">questions.</span></h1>
		<p class="note">Some rules go up before launch.</p>
		<dl>
			{#each faqs as item (item.id)}
				<div>
					<dt>{item.q}</dt>
					<dd>{item.a}</dd>
				</div>
			{/each}
		</dl>
		<p class="cta">
			<a class="redbtn" href={JOIN_HREF}>join hackcast →</a>
		</p>
	</div>
</div>

<div class="phone">
	<p class="station-sign">the log book · faq</p>
	<h1>frequently asked <span class="r">questions.</span></h1>
	<p>Some rules go up before launch.</p>
	{#each faqs as item, i (item.id)}
		<details class="card">
			<summary><span class="mono">CUE CARD · Q{String(i + 1).padStart(2, '0')}</span> {item.q}</summary>
			<p>{item.a}</p>
		</details>
	{/each}
	<p><a class="redbtn" href={JOIN_HREF}>join hackcast →</a></p>
</div>

<style>
	.faq {
		width: min(40rem, calc(100% - 3rem));
		margin: 2.4rem auto 4.5rem;
	}
	.sticker {
		display: inline-block;
		margin: 0 0 1.1rem;
		padding: 0.4rem 0.7rem;
		background: var(--pink);
		color: var(--ink);
		border: 3px solid var(--ink);
		box-shadow: 4px 4px 0 var(--ink);
		font-family: Bungee, sans-serif;
		font-size: 0.85rem;
	}
	.faq h1 {
		margin: 0;
		max-width: 11ch;
		font-family: 'Archivo Black', sans-serif;
		font-size: clamp(2.4rem, 5vw, 3.6rem);
		font-weight: 400;
		line-height: 0.98;
		color: var(--cream);
	}
	.note {
		margin: 1.2rem 0 0;
		color: var(--cream);
		font-weight: 700;
	}
	dl {
		margin: 1.8rem 0 0;
	}
	dl div + div {
		margin-top: 1.35rem;
	}
	dt {
		margin: 0;
		font-family: 'Archivo Black', sans-serif;
		font-size: 1.25rem;
		font-weight: 400;
		line-height: 1.2;
		color: var(--cream);
	}
	dd {
		margin: 0.3rem 0 0;
		color: var(--cream);
		font-weight: 600;
		line-height: 1.45;
	}
	.cta {
		margin: 2.2rem 0 0;
	}
	summary {
		cursor: pointer;
		font-family: 'Archivo Black', sans-serif;
	}
</style>
