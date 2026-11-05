<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { AIRTABLE_SUBMIT_EMBED, AIRTABLE_SUBMIT_HEIGHT } from '#lib/submit.ts';
</script>

<Seo title="Submit | Hackcast" description="Send your Hackcast project in." />

<div class="booth">
	<p class="sign">the booth · submit</p>
	<h1>send it in.</h1>
	<p class="lede">This form is the submission. It goes to Hack Club.</p>
	<p><a class="back" href="/dashboard">back to the dashboard</a></p>
	<iframe
		class="airtable-embed"
		title="Hackcast project submission"
		src={AIRTABLE_SUBMIT_EMBED}
		width="100%"
		height={AIRTABLE_SUBMIT_HEIGHT}
		style="background: transparent; border: 1px solid #ccc;"
	></iframe>
</div>

<style>
	.booth {
		width: min(960px, calc(100% - 2rem));
		margin: 1.4rem auto 3rem;
		color: var(--text);
	}
	.sign {
		display: inline-block;
		margin: 0;
		padding: 0.35rem 0.7rem;
		background: #6b3f24;
		color: #f6e6cf;
		border: 3px solid var(--shadow);
		font-family: Bungee, sans-serif;
		font-size: 0.78rem;
	}
	h1 {
		margin: 0.55rem 0 0.4rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: clamp(2.2rem, 5vw, 3.4rem);
		font-weight: 400;
		line-height: 1;
		color: var(--text);
	}
	.lede {
		margin: 0 0 0.7rem;
		max-width: 36rem;
		font-weight: 700;
	}
	.back {
		color: var(--text);
		font-family: 'Permanent Marker', sans-serif;
		font-size: 1.15rem;
	}
	iframe {
		display: block;
		width: 100%;
		height: 533px;
		margin-top: 1rem;
		background: transparent;
		border: 1px solid #ccc;
	}
</style>
