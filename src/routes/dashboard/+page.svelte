<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import Shop from '#lib/components/Shop.svelte';
	import { hackatimeContinueHref } from '#lib/hackatime-recovery.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const connectHref = $derived(hackatimeContinueHref(data.notice, data.ready));
	const project = $derived(data.project);
	const guest = $derived(data.guest);
</script>

<Seo title="Dashboard | Hackcast" description="Your HackCast project, your questions for the next guest, and the hours race." />

{#if data.popup}
	<div class="backdrop">
		<div class="popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
			{#if data.popup === 'name'}
				<h2 id="popup-title">Name your HackCast project</h2>
				<form method="POST" action="?/create">
					<label>
						<span class="visually-hidden">project name</span>
						<!-- svelte-ignore a11y_autofocus -->
						<input name="projectName" maxlength="200" autocomplete="off" required autofocus />
					</label>
					{#if form?.message}<p class="err" role="alert">{form.message}</p>{/if}
					<button class="redbtn" type="submit">Create project</button>
				</form>
			{:else if data.notice === 'taken'}
				<h2 id="popup-title">That Hackatime is tied to another Hack Club login.</h2>
				<div class="row">
					<a class="redbtn" href="/dashboard">Keep going without linking</a>
					<a class="plain" href="/auth/logout">Sign out</a>
				</div>
			{:else}
				<h2 id="popup-title">Link your Hackatime project</h2>
				{#if !data.connected}
					<p>Connect Hackatime to race for the guaranteed question. You can still ask questions without it.</p>
					<div class="row">
						{#if connectHref}
							<a class="redbtn" href={connectHref}>Connect Hackatime</a>
						{:else}
							<p>Hackatime sign-in isn't set up yet.</p>
						{/if}
						<a class="plain" href="/dashboard">Skip for now</a>
					</div>
				{:else if data.recent.length === 0}
					<p>No Hackatime projects yet. Code a little with Hackatime running, then link it from here.</p>
					<div class="row"><a class="redbtn" href="/dashboard">Got it</a></div>
				{:else}
					<p>The last {data.recent.length} you worked on. Pick the one that is {project?.name}.</p>
					<form method="POST" action="?/link">
						<input type="hidden" name="projectId" value={project?.id} />
						<fieldset>
							<legend class="visually-hidden">Hackatime projects</legend>
							{#each data.recent as item (item.name)}
								<label class="choice">
									<input type="radio" name="hackatimeProject" value={item.name} required />
									<span>{item.name}</span>
									<span class="hours">{item.hours}</span>
								</label>
							{/each}
						</fieldset>
						{#if form?.message}<p class="err" role="alert">{form.message}</p>{/if}
						<div class="row">
							<button class="redbtn" type="submit">Link project</button>
							<a class="plain" href="/dashboard">Skip for now</a>
						</div>
					</form>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<div class="booth">
	<section class="next" aria-labelledby="next-title">
		<p class="kicker">Episode {guest.episode}</p>
		<h1 id="next-title">{guest.name}</h1>
		<p>{guest.blurb}</p>
	</section>

	{#if data.unavailable}
		<p class="note">We couldn't load your dashboard. Try again in a minute.</p>
	{/if}
	{#if data.submitted}
		<p class="note" role="status">Sent in for review.</p>
	{/if}

	<div class="grid">
		<section class="panel" aria-labelledby="project-title">
			<h2 id="project-title">Your project</h2>
			{#if project}
				<p class="name">{project.name}</p>
				{#if project.hackatimeProject}
					<p class="hours-big">{project.hours ?? '0m'} <span>on Hackatime</span></p>
					<form method="POST" action="?/refresh"><button class="redbtn" type="submit">Refresh hours</button></form>
				{:else}
					<p>Link Hackatime if you want to race for the guaranteed question. You can still ask questions without it.</p>
					<a class="redbtn" href="/dashboard?step=link">Link Hackatime</a>
				{/if}
				{#if data.review}
					<p class="review {data.review.status}">
						{#if data.review.status === 'pending'}
							Waiting for review.
						{:else if data.review.status === 'changes_requested'}
							Needs changes: {data.review.feedback} <a href="/submit?project={project.id}">Edit and resubmit</a>
						{:else if data.review.status === 'rejected'}
							Not approved{data.review.feedback ? `: ${data.review.feedback}` : '.'}
						{:else}
							Approved, {data.review.approvedHours}.
						{/if}
					</p>
				{/if}
			{/if}
			{#if form?.message && !data.popup && !('area' in form && form.area === 'shop')}
				<p class="err" role="alert">{form.message}</p>
			{/if}
		</section>

		<section class="panel" aria-labelledby="ask-title">
			<h2 id="ask-title">Ask {guest.firstName} something</h2>
			{#if data.asked}
				<p class="got" role="status">Got it. It is in for {guest.firstName}'s episode.</p>
			{/if}
			<form method="POST" action="?/ask">
				<label>
					What do you want him to answer on the episode?
					<textarea name="question" maxlength="500" required></textarea>
				</label>
				<button class="redbtn" type="submit">Send question</button>
			</form>
			<p class="fine">
				{#if data.first}
					You are first right now. This can be your guaranteed question if you stay on top when we lock hours.
				{:else}
					Questions go into the hat. Everyone gets 5 entries free, and every approved hour adds one more: you have
					{data.entries} entries. Most hours wins a guaranteed question.
				{/if}
			</p>
		</section>

		<section class="panel" aria-labelledby="mine-title">
			<h2 id="mine-title">Your questions</h2>
			{#if data.questions.length === 0}
				<p>You have not asked anything yet.</p>
			{:else}
				<ul class="questions">
					{#each data.questions as question (question.id)}
						<li>{question.body}</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="panel" aria-labelledby="race-title">
			<h2 id="race-title">Hours race</h2>
			{#if data.race.length === 0}
				<p>Link Hackatime on your project to show up here.</p>
			{:else}
				<ol class="race">
					{#each data.race as entry, i (i)}
						<li class:you={entry.you}>
							<span class="num">{i + 1}</span>
							<span>{entry.you ? 'You' : entry.name}</span>
							<span class="num">{entry.hours}</span>
						</li>
					{/each}
				</ol>
				{#if data.you && data.you.rank > data.race.length}
					<p class="race-you">… You <b>{data.you.rank}</b> <span class="num">{data.you.hours}</span></p>
				{:else if !data.you}
					<p class="fine">Link Hackatime on your project to show up here.</p>
				{/if}
			{/if}
		</section>
		<section class="panel wide" aria-labelledby="vote-title">
			<h2 id="vote-title">Who should come on episode {data.voteEpisode}?</h2>
			<p>You get one vote for someone at Hack Club HQ and one for someone from outside. Vote again to change it.</p>
			{#if data.voted}
				<p class="got" role="status">Vote saved.</p>
			{/if}
			<div class="votes">
				{#each [['hq', 'Someone at Hack Club HQ'], ['outside', 'Someone from outside Hack Club']] as [key, label] (key)}
					{@const current = data.votes[key as 'hq' | 'outside']}
					<form method="POST" action="?/vote" class="vote">
						<input type="hidden" name="category" value={key} />
						<label>
							{label}
							<input name="guestName" maxlength="120" autocomplete="off" value={current ?? ''} required />
						</label>
						{#if current}<p class="fine">Your vote: <b>{current}</b></p>{/if}
						<button class="redbtn" type="submit">{current ? 'Change vote' : 'Vote'}</button>
					</form>
				{/each}
			</div>
		</section>
	</div>

	<footer class="ship">
		<p>Ready to ship a project for review</p>
		<a class="redbtn" href="/submit">Submit for review</a>
	</footer>

	<Shop
		approvedSeconds={data.shop.approvedSeconds}
		availableSeconds={data.shop.availableSeconds}
		redemptions={data.shop.redemptions}
		leading={data.first}
		unavailable={data.unavailable || data.shop.unavailable}
		hasAddress={data.shop.hasAddress}
		redeemed={data.redeemed}
		form={'area' in (form ?? {}) && form?.area === 'shop' ? form : null}
	/>
</div>

<style>
	.booth {
		width: min(980px, calc(100% - 2rem));
		margin: 1.4rem auto 3rem;
		color: var(--text);
	}
	.next {
		margin-bottom: 1.2rem;
	}
	.kicker {
		display: inline-block;
		margin: 0;
		padding: 0.25rem 0.6rem;
		background: var(--red);
		color: var(--on-red);
		border: 3px solid var(--shadow);
		font-family: 'Space Mono', monospace;
		font-weight: 700;
		font-size: 0.85rem;
	}
	h1 {
		margin: 0.45rem 0 0.35rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: clamp(2.4rem, 6vw, 3.8rem);
		font-weight: 400;
		line-height: 1;
	}
	.next p:last-child {
		max-width: 40rem;
		margin: 0;
		font-size: 1.1rem;
		font-weight: 700;
	}
	.note {
		margin: 0 0 1rem;
		padding: 0.7rem 0.9rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		border-left: 10px solid var(--red-text);
		font-weight: 800;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}
	.panel {
		padding: 1rem 1.1rem 1.15rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	h2 {
		margin: 0 0 0.55rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: 1.6rem;
		font-weight: 400;
		line-height: 1.1;
		color: var(--ink);
	}
	.panel p {
		margin: 0 0 0.75rem;
		font-weight: 700;
	}
	.name {
		font-size: 1.3rem;
		font-weight: 800;
	}
	.hours-big {
		font-family: 'Permanent Marker', sans-serif;
		font-size: 2rem;
	}
	.hours-big span {
		font-family: Figtree, sans-serif;
		font-size: 1rem;
		font-weight: 700;
	}
	.panel .review {
		margin-top: 0.8rem;
		font-size: 0.92rem;
	}
	.review.changes_requested,
	.review.rejected,
	.err {
		color: var(--red-text);
	}
	.review a {
		color: var(--ink);
	}
	form {
		display: grid;
		gap: 0.6rem;
	}
	label {
		display: grid;
		gap: 0.3rem;
		font-weight: 800;
	}
	textarea,
	input:not([type='radio']) {
		padding: 0.55rem 0.7rem;
		border: 3px solid var(--shadow);
		background: #fff;
		color: var(--ink);
		font: inherit;
		font-weight: 600;
	}
	textarea {
		min-height: 6rem;
		resize: vertical;
	}
	button {
		justify-self: start;
		cursor: pointer;
	}
	.panel .got {
		padding: 0.5rem 0.7rem;
		background: var(--red);
		color: var(--on-red);
	}
	.panel .fine {
		margin: 0.7rem 0 0;
		font-size: 0.88rem;
	}
	.questions {
		margin: 0;
		padding-left: 1.1rem;
		font-weight: 700;
	}
	.questions li {
		margin-bottom: 0.4rem;
	}
	.race {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.race li,
	.panel .race-you {
		display: grid;
		grid-template-columns: 2rem 1fr auto;
		gap: 0.5rem;
		margin: 0;
		padding: 0.3rem 0.3rem;
		border-bottom: 1px solid #d9e3ec;
		font-weight: 700;
	}
	.race li.you {
		background: var(--red);
		color: var(--on-red);
	}
	.panel .race-you {
		grid-template-columns: auto auto 1fr;
		border-bottom: 0;
	}
	.race-you .num {
		text-align: right;
	}
	.num {
		font-family: 'Space Mono', monospace;
	}
	.ship {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem 1.2rem;
		align-items: center;
		justify-content: space-between;
		margin-top: 1.2rem;
		padding-top: 1rem;
		border-top: 3px solid var(--shadow);
	}
	.ship p {
		margin: 0;
		font-weight: 800;
	}
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: grid;
		place-items: center;
		padding: 16px;
		background: rgb(12 20 34 / 0.6);
	}
	.popup {
		width: min(480px, 100%);
		padding: 1.4rem 1.5rem 1.5rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	.popup h2 {
		font-size: 1.7rem;
	}
	.popup p {
		margin: 0 0 0.8rem;
		font-weight: 700;
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
	}
	.wide {
		grid-column: 1 / -1;
	}
	.votes {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}
	.vote .fine {
		margin: 0;
	}
	@media (max-width: 720px) {
		.votes {
			grid-template-columns: 1fr;
		}
	}
	.choice {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 0.5rem;
		align-items: center;
		padding: 0.45rem 0;
		border-bottom: 1px solid #d9e3ec;
	}
	.hours {
		font-family: 'Space Mono', monospace;
		font-size: 0.85rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1rem;
		align-items: center;
	}
	.plain {
		color: var(--ink);
		font-weight: 800;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
	@media (max-width: 720px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
