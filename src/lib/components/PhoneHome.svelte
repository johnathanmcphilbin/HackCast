<script lang="ts">
	import { episodeRuntime, faqs, hourTiers, prizeWheel, steps } from '#lib/content.ts';
	import { JOIN_HREF } from '#lib/site.ts';
</script>

<div class="phone">
	<p class="mono" style="color:#f6e6cf">a Hack Club YSWS · weekly podcast</p>
	<h1>build. log hours. <span class="r">get on air.</span></h1>
	<p>
		hackcast is a weekly podcast powered by the things you build. make projects, earn rewards, submit questions, and help decide what happens on the show.
	</p>
	<p class="mono">ON AIR · signups opening soon</p>
	<img class="photo" src="/photos/hackclubbers.webp" alt="Hack Clubbers building together" />

	<p class="station-sign">station 01 · log hours</p>
	<h2>build stuff. <span class="r">log the hours.</span></h2>
	{#each steps as step (step.n)}
		<article class="card">
			<p class="mono">STEP {step.n}</p>
			<h3>{step.title}</h3>
			<p>{step.body}</p>
		</article>
	{/each}

	<p class="station-sign">station 02 · the mixer</p>
	<h2>hours in. <span class="r">rewards out.</span></h2>
	{#each hourTiers as tier (tier.id)}
		<article class="card">
			<span class="tbc">TBC</span>
			<p class="mono">{tier.channel}</p>
			<h3>{tier.label}</h3>
			<p>{tier.title}</p>
			<p>{tier.detail}</p>
		</article>
	{/each}
	<p class="mono">tiers still TBC: final numbers before launch</p>

	<p class="station-sign">station 03 · wheel + shop</p>
	<h2>spin the wheel. <span class="r">raid the shop.</span></h2>
	<article class="card">
		<h3>weekly prize wheel</h3>
		<p>{prizeWheel.blurb}</p>
	</article>
	<article class="card">
		<h3>the hackcast shop</h3>
		<p>every approved hour earns shop credit. the shop and its prizes will be announced soon.</p>
	</article>

	<p class="station-sign">station 04 · the show</p>
	<h2>teenagers. mics. <span class="r">opinions.</span></h2>
	<p>
		a weekly podcast featuring teenagers talking about technology, building projects, Hack Club, internet culture and community debates.
	</p>
	<article class="card">
		<p class="mono">SLEEVE NOTES</p>
		<p><b>RUNTIME</b> {episodeRuntime.label}</p>
		<p><b>SCHEDULE</b> {episodeRuntime.schedule}</p>
		<p><b>HOSTS</b> {episodeRuntime.hosts} ({episodeRuntime.hostsNote})</p>
	</article>

	<p class="station-sign">station 05 · questions</p>
	<h2>your questions. <span class="r">our mics.</span></h2>
	<article class="card">
		<p class="mono">QUESTION SLIP · EXAMPLE</p>
		<h3>"what's the most cursed thing you've ever shipped, and would you ship it again?"</h3>
		<p class="mono">— @you · 5 approved hours</p>
	</article>

	<p class="station-sign">station 06 · on air</p>
	<h2>ship it. <span class="r">you're on air.</span></h2>
	<p>build something, log the hours, and your name ends up on the show: a question, a topic, maybe even a guest spot.</p>
	<p><a class="redbtn" href={JOIN_HREF}>join hackcast →</a></p>
	<p><a href="/faq">read the faq →</a></p>

	<h2 id="m-faq">frequently asked <span class="r">questions.</span></h2>
	{#each faqs as item, i (item.id)}
		<details class="card">
			<summary><span class="mono">Q{String(i + 1).padStart(2, '0')}</span> {item.q}</summary>
			<p>{item.a}</p>
		</details>
	{/each}
</div>

<style>
	summary {
		cursor: pointer;
		font-family: 'Archivo Black', sans-serif;
		font-size: 1.05rem;
	}
	a {
		color: #f6e6cf;
		font-weight: 800;
	}
</style>
