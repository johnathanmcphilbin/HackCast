<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { episodes, home, hourTiers, published, rewardLine, shop, steps } from '#lib/content.ts';
	import HackClubSignup from '#lib/components/HackClubSignup.svelte';
	import OnAir from '#lib/components/OnAir.svelte';
	import Sleeve from '#lib/components/Sleeve.svelte';
	import { rsvpCountLabel } from '#lib/rsvp.ts';
	import Seo from '#lib/components/Seo.svelte';
	import { JOIN_HREF, site } from '#lib/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// /auth/login and /auth/callback land here with ?rsvp=done|soon|error.
	const notices = {
		done: { title: "you're on the list.", body: "We'll notify you when Hackcast opens." },
		soon: { title: 'sign-in opens soon.', body: 'Check back in a bit.' },
		error: { title: "that sign-in didn't land.", body: 'Give it another go.' }
	} as const;
	type Notice = keyof typeof notices;

	const param = page.url.searchParams.get('rsvp');
	let notice = $state<Notice | null>(param && param in notices ? (param as Notice) : null);

	$effect(() => {
		if (param) replaceState(page.url.pathname + page.url.hash, {});
	});
</script>

<Seo />

{#if notice}
	<div class="notice-backdrop" role="presentation" onclick={() => (notice = null)}>
		<div class="notice paper" role="dialog" aria-modal="true" aria-labelledby="notice-title" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && (notice = null)}>
			<h2 id="notice-title">{notice === 'done' && data.firstName ? `hello, ${data.firstName}!` : notices[notice].title}</h2>
			{#if notice === 'done' && data.firstName}<p>You're on the list.</p>{/if}
			<p>{notices[notice].body}</p>
			{#if notice === 'error'}
				<p><a class="redbtn" href={JOIN_HREF}>try again →</a></p>
			{/if}
			<button class="redbtn" type="button" onclick={() => (notice = null)}>got it</button>
		</div>
	</div>
{/if}

<div class="home">
	<section class="hero">
		<div class="hero-copy">
			<h1>HACKCAST</h1>
			<p class="tagline">{home.tagline}</p>
			<p class="cta-row">
				{#if data.firstName}
					<span class="redbtn cta">hello, {data.firstName}. you're on the list.</span>
				{:else}
					<a class="redbtn cta" href={JOIN_HREF}>rsvp for hackcast →</a>
				{/if}
			</p>
			{#if !data.firstName}<p class="soon">{home.notLive}</p>{/if}
			{#if !data.firstName}<HackClubSignup />{/if}
			{#if data.count}<p class="count">{rsvpCountLabel(data.count)}</p>{/if}
		</div>
		<div class="hero-visual">
			<Sleeve />
		</div>
		<figure class="polaroid">
			<img src="/photos/hackclubbers.jpg" alt="Hack Clubbers building together" width="400" height="250" />
			<figcaption>Hack Clubbers, building</figcaption>
		</figure>
	</section>

	<section class="band" id="how" aria-labelledby="how-title">
		<h2 id="how-title" class="visually-hidden">how it works</h2>
		<div class="how">
			<div class="how-visual">
				<OnAir />
			</div>
			<div class="how-copy">
				<ol class="steps">
					{#each steps as step (step.n)}
						<li id="step-{step.title}">
							<p class="mono">{step.n}</p>
							<h3>{step.title}</h3>
							<p>{step.body}</p>
						</li>
					{/each}
				</ol>
				<!-- One statement of the hours mechanic. Tier cards replace it once numbers are real. -->
				{#if published.hourTiers}
					<ul class="tiers">
						{#each hourTiers as tier (tier.id)}
							<li>
								<p class="mono">{tier.channel} · {tier.label}</p>
								<h3>{tier.title}</h3>
								<p>{tier.detail}</p>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mechanic" id="rewards">{rewardLine}</p>
				{/if}
				{#if published.shop}
					<div class="shop">
						<h3>the hackcast shop</h3>
						<p>{shop.blurb}</p>
						<ul>
							{#each shop.sleeves as sleeve (sleeve.id)}
								<li>{sleeve.title} · {sleeve.note}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</section>

	<section class="finale">
		<p class="onair" aria-hidden="true"><span class="onair-lit">ON AIR</span></p>
		<p>{home.finale}</p>
		<p class="cta-row">
			{#if data.firstName}
				<span class="redbtn cta">hello, {data.firstName}. you're on the list.</span>
			{:else}
				<a class="redbtn cta" href={JOIN_HREF}>rsvp for hackcast →</a>
			{/if}
		</p>
		{#if !data.firstName}<p class="soon">{home.notLive}</p>{/if}
		{#if !data.firstName}<HackClubSignup />{/if}
	</section>

	<section class="show" id="show">
		<div class="show-inner">
			<h2>
				episodes go up on <a class="ext" href={site.youtubeUrl} target="_blank" rel="noopener">YouTube</a>.
			</h2>
			{#if published.tracklist}
				<ol class="tracklist">
					{#each episodes as episode (episode.id)}
						<li>
							<span class="mono">{episode.id}</span>
							{episode.title}
							<span class="mono">{episode.status}</span>
						</li>
					{/each}
				</ol>
			{/if}
		</div>
	</section>
</div>

<style>
	.notice-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: grid;
		place-items: center;
		padding: 16px;
		background: rgb(12 20 34 / 0.7);
	}
	.notice {
		width: min(440px, 100%);
		padding: 1.5rem 1.6rem 1.6rem;
		transform: rotate(-1deg);
	}
	.notice h2 {
		margin: 0 0 0.5rem;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 1.7rem;
		line-height: 1.15;
		color: var(--ink);
	}
	.notice p {
		margin: 0 0 1rem;
		font-size: 1.1rem;
		font-weight: 600;
	}
	.notice .redbtn {
		padding: 0.8rem 1.6rem;
		font-size: 1.15rem;
		cursor: pointer;
	}
	.home {
		color: var(--cream);
	}
	.hero,
	.how,
	.show-inner,
	.finale {
		width: min(1120px, calc(100% - 3rem));
		margin-inline: auto;
	}
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 0.82fr) minmax(300px, 1.18fr);
		grid-template-areas: 'copy art' 'photo art';
		gap: 0.6rem 1.5rem;
		align-items: center;
		min-height: calc(100vh - 6.5rem);
		padding: 1.2rem 0 2.2rem;
	}
	.hero-copy {
		grid-area: copy;
	}
	.hero-visual {
		grid-area: art;
		max-width: none;
		margin-inline: 0;
	}
	.polaroid {
		grid-area: photo;
		justify-self: start;
		width: min(380px, 100%);
		margin: 0.4rem 0 0.2rem;
		padding: 0.65rem 0.65rem 0.4rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		transform: rotate(-2.5deg);
		transition: transform 0.25s ease;
	}
	.polaroid:hover {
		transform: rotate(0.5deg) scale(1.04);
	}
	.polaroid img {
		display: block;
		width: 100%;
		height: 230px;
		object-fit: cover;
		border: 3px solid var(--shadow);
	}
	.polaroid figcaption {
		margin: 0.4rem 0 0.15rem;
		text-align: center;
		font-family: 'Space Mono', monospace;
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--ink);
	}
	h1 {
		margin: 0;
		padding-left: 0.04em;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: clamp(2.6rem, 5.6vw, 5rem);
		font-weight: 400;
		line-height: 0.92;
		color: var(--wave);
	}
	.tagline {
		margin: 0.85rem 0 0;
		font-family: 'Space Mono', monospace;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: var(--cream);
	}
	.cta-row {
		margin: 1.4rem 0 0;
	}
	.count {
		margin: 0.85rem 0 0;
		font-family: 'Space Mono', monospace;
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--cream);
	}
	.soon {
		margin: 0.85rem 0 0;
		max-width: 28rem;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.45;
		color: var(--cream);
	}
	.cta {
		font-size: 1.35rem;
		padding: 0.85rem 1.25rem;
		cursor: pointer;
	}
	.band {
		background: #152033;
		border-block: 3px solid var(--shadow);
	}
	.how {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.6rem;
		padding: 2.2rem 0 2.6rem;
	}
	.how-visual {
		width: min(100%, 960px);
	}
	.how-copy {
		width: 100%;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	h2 {
		margin: 0 0 0.9rem;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: clamp(2.1rem, 4.6vw, 3.4rem);
		font-weight: 400;
		line-height: 1.02;
		color: var(--wave);
	}
	.how-copy > p,
	.finale > p {
		margin: 0 0 0.9rem;
		max-width: 42rem;
		font-size: 1.08rem;
		font-weight: 700;
		line-height: 1.5;
		color: var(--cream);
	}
	.steps,
	.tiers,
	.tracklist {
		list-style: none;
		margin: 1.2rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.75rem;
	}
	.steps {
		margin: 0;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}
	.steps li,
	.tiers li,
	.tracklist li {
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		padding: 0.85rem 1rem 0.95rem;
	}
	/* Hand-cut cards in the mic art's colours, so they read as part of the drawing. */
	.steps li {
		--bubble: var(--cream);
		position: relative;
		padding: 1rem 1.2rem 1.15rem;
		border-radius: 24px 6px 28px 8px / 8px 26px 6px 22px;
		background: var(--bubble);
		transform: rotate(-1.5deg);
	}
	.steps li:nth-child(2) {
		--bubble: #d7a750;
		border-radius: 8px 28px 10px 24px / 26px 8px 24px 6px;
		transform: rotate(1.2deg) translateY(8px);
	}
	.steps li:nth-child(3) {
		--bubble: #43c8b4;
		border-radius: 28px 10px 22px 6px / 6px 22px 10px 28px;
		transform: rotate(-0.7deg);
	}
	.steps .mono,
	.tiers .mono,
	.tracklist .mono {
		color: var(--red);
		font-size: 0.85rem;
	}
	.steps h3,
	.tiers h3,
	.shop h3 {
		margin: 0.1rem 0 0.3rem;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 1.45rem;
		font-weight: 400;
		color: var(--ink);
	}
	.steps p,
	.tiers p,
	.shop p,
	.shop li {
		margin: 0;
		color: var(--ink);
		font-weight: 700;
		line-height: 1.45;
	}
	.steps .mono {
		font-family: Bungee, sans-serif;
		font-weight: 400;
		font-size: 2rem;
		line-height: 1;
		color: var(--ink);
	}
	.how-copy > .mechanic {
		--bubble: var(--red);
		position: relative;
		width: fit-content;
		max-width: 100%;
		box-sizing: border-box;
		margin: 1.9rem auto 0;
		padding: 0.8rem 1.5rem;
		background: var(--bubble);
		color: var(--cream);
		border: 3px solid var(--shadow);
		border-radius: 6px 18px 4px 16px / 16px 4px 18px 6px;
		transform: rotate(0.8deg);
		font-size: 1.15rem;
		font-weight: 800;
	}
	.shop {
		margin-top: 1rem;
	}
	.shop ul {
		margin: 0.4rem 0 0;
		padding-left: 1.1rem;
	}
	.show {
		padding: 1.2rem 0 4.8rem;
	}
	.show-inner a.ext {
		color: inherit;
		font-weight: 800;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.tracklist {
		margin-top: 1.4rem;
	}
	.finale {
		padding: 3.2rem 0 1.2rem;
		text-align: left;
	}
	.onair {
		display: inline-block;
		margin: 0 0 1rem;
		padding: 0.45rem 0.85rem;
		background: var(--red);
		color: #fff;
		border: 3px solid var(--shadow);
		border-radius: 8px;
		font-family: Bungee, sans-serif;
		font-size: 1.55rem;
		letter-spacing: 0.14em;
	}
	@media (max-width: 800px) {
		.hero,
		.how {
			grid-template-columns: 1fr;
			min-height: 0;
		}
		.hero {
			grid-template-areas: 'copy' 'art' 'photo';
		}
		.hero {
			padding-top: 0.6rem;
		}
		.hero-visual {
			max-width: 100%;
		}
		.polaroid {
			width: min(340px, 90%);
		}
		.cta {
			display: flex;
			justify-content: center;
			width: 100%;
			box-sizing: border-box;
		}
		.how,
		.show,
		.finale {
			padding-top: 2.4rem;
			padding-bottom: 2.4rem;
		}
		.how {
			padding-bottom: 2.6rem;
		}
		.steps {
			grid-template-columns: 1fr;
			gap: 1.35rem;
		}
		.how-copy > .mechanic {
			margin-top: 1.6rem;
		}
	}
</style>
