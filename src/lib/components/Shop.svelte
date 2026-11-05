<script lang="ts">
	import {
		canAfford,
		grantLabelFor,
		hourRacePrize,
		hoursLabel,
		maxStackHours,
		memberStatusLabel,
		shopCatalog,
		shopCategories,
		shopCopy,
		type ShopItem
	} from '#lib/shop.ts';

	type Redemption = {
		id: string;
		title: string;
		hours: number;
		grantLabel: string;
		status: string;
		stackable: boolean;
		createdAt: string;
	};

	let {
		approvedSeconds,
		availableSeconds,
		redemptions,
		leading,
		unavailable,
		redeemed,
		hasAddress,
		standalone = false,
		form
	}: {
		approvedSeconds: number;
		availableSeconds: number;
		redemptions: Redemption[];
		leading: boolean;
		unavailable: boolean;
		redeemed: boolean;
		hasAddress: boolean;
		standalone?: boolean;
		form: { sku?: string; message?: string } | null;
	} = $props();

	let open = $state<Record<string, boolean>>({});
	let qty = $state<Record<string, number>>({});

	const cap = $derived(maxStackHours(availableSeconds));

	function chosen(item: ShopItem): number {
		if (item.kind !== 'credit') return item.hours;
		const limit = cap > 0 ? cap : 1;
		const n = qty[item.sku] ?? 1;
		return Math.min(limit, Math.max(1, Math.floor(n) || 1));
	}

	function setQty(sku: string, next: number) {
		const limit = cap > 0 ? cap : 1;
		qty[sku] = Math.min(limit, Math.max(1, Math.floor(next) || 1));
	}

	function short(item: ShopItem): boolean {
		return unavailable || !canAfford(availableSeconds, chosen(item) * 3600);
	}

	function need(item: ShopItem): string {
		const n = chosen(item);
		const unit = n === 1 ? 'hour' : 'hours';
		return `You need ${n} ${unit}. You have ${hoursLabel(availableSeconds)} available.`;
	}

	const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	const statusText = (status: string) => memberStatusLabel[status as keyof typeof memberStatusLabel] ?? status;
</script>

<section class="shop" class:standalone id="shop" aria-labelledby="shop-title">
	<p class="kicker">{shopCopy.kicker}</p>
	<h2 id="shop-title">{shopCopy.title}</h2>
	<p class="intro">{shopCopy.intro}</p>

	{#if unavailable}
		<p class="note">{shopCopy.down}</p>
	{:else if !hasAddress}
		<p class="note">{shopCopy.missingAddress}</p>
	{/if}
	{#if redeemed}
		<p class="note" role="status">{shopCopy.redeemed}</p>
	{/if}
	{#if form?.message && !form.sku}
		<p class="note" role="alert">{form.message}</p>
	{/if}

	<div class="balance">
		<span>{shopCopy.approved} <b>{hoursLabel(approvedSeconds)}</b></span>
		<span>{shopCopy.available} <b>{hoursLabel(availableSeconds)}</b></span>
	</div>

	<article class="prize">
		<h3>{hourRacePrize.title}</h3>
		<p>{hourRacePrize.blurb}</p>
		<p class="status">{leading ? hourRacePrize.leading : hourRacePrize.trailing}</p>
	</article>

	{#each shopCategories as category (category.id)}
		<h3 class="group">{category.label}</h3>
		<div class="cards">
			{#each shopCatalog.filter((item) => item.category === category.id) as item (item.sku)}
				<article class="card">
					<img src={item.image} alt={item.imageAlt} width="640" height="480" loading="lazy" />
					<div class="body">
						<h4>{item.title}</h4>
						<p>{item.blurb}</p>
						{#if item.kind === 'credit'}
							<p class="fine">{shopCopy.creditNote}</p>
						{/if}
						<p class="cost">
							{item.kind === 'credit' ? `${chosen(item)} ${chosen(item) === 1 ? 'hour' : 'hours'}` : `${item.hours} hours`}
						</p>
						<div class="reveal" class:open={open[item.sku]}>
							<button
								type="button"
								class="see"
								aria-expanded={open[item.sku] ? 'true' : 'false'}
								onclick={() => (open[item.sku] = !open[item.sku])}
							>
								{open[item.sku] ? shopCopy.hideGrant : shopCopy.seeGrant}
							</button>
							<p class="grant">{grantLabelFor(item, chosen(item))}</p>
							{#if item.kind === 'credit'}
								<p class="rate">
									{chosen(item)}
									{chosen(item) === 1 ? 'hour' : 'hours'} at ${item.dollars} an hour
								</p>
							{/if}
						</div>
						{#if short(item)}
							<p class="fine">{need(item)}</p>
						{/if}
						{#if form?.sku === item.sku && form.message}
							<p class="err" role="alert">{form.message}</p>
						{/if}
						<form method="POST" action="?/redeem">
							<input type="hidden" name="sku" value={item.sku} />
							{#if item.kind === 'credit'}
								<div class="stepper">
									<button type="button" onclick={() => setQty(item.sku, chosen(item) - 1)} disabled={chosen(item) <= 1}>
										−
									</button>
									<label>
										<span class="visually-hidden">Hours of credit</span>
										<input
											name="hours"
											type="number"
											min="1"
											max={cap > 0 ? cap : 1}
											value={chosen(item)}
											oninput={(event) => setQty(item.sku, Number(event.currentTarget.value))}
										/>
									</label>
									<button
										type="button"
										onclick={() => setQty(item.sku, chosen(item) + 1)}
										disabled={cap > 0 && chosen(item) >= cap}
									>
										+
									</button>
								</div>
								<button class="redbtn" type="submit" disabled={short(item)}>
									{short(item) ? shopCopy.short : shopCopy.redeem}
								</button>
							{:else if item.kind === 'question'}
								<details open={form?.sku === item.sku}>
									<summary>{shopCopy.redeem}</summary>
									<label>
										{shopCopy.ask}
										<textarea name="question" maxlength="500" required></textarea>
									</label>
									<button class="redbtn" type="submit" disabled={short(item)}>
										{short(item) ? shopCopy.short : shopCopy.confirm}
									</button>
								</details>
							{:else}
								<button class="redbtn" type="submit" disabled={short(item) || !hasAddress}>
									{short(item) ? shopCopy.short : shopCopy.redeem}
								</button>
							{/if}
						</form>
					</div>
				</article>
			{/each}
		</div>
	{/each}

	<h3 class="group">{shopCopy.yours}</h3>
	{#if redemptions.length === 0}
		<p>{shopCopy.empty}</p>
	{:else}
		<ul class="mine">
			{#each redemptions as row (row.id)}
				<li>
					<span>{row.title}{row.stackable ? ' credit' : ''}</span>
					<span class="num">{row.hours} {row.hours === 1 ? 'hour' : 'hours'}</span>
					<span>{row.grantLabel}</span>
					<span>{statusText(row.status)}</span>
					<span>{day(row.createdAt)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.shop {
		margin-top: 1.6rem;
		padding-top: 1.2rem;
		border-top: 3px solid var(--shadow);
		color: var(--text);
	}
	.shop.standalone {
		margin-top: 0;
		padding-top: 0;
		border-top: 0;
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
	h2 {
		margin: 0.45rem 0 0.4rem;
		font-family: 'Permanent Marker', sans-serif;
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 400;
		line-height: 1;
		color: var(--text);
	}
	.intro,
	.shop > p {
		max-width: 42rem;
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
	.balance,
	.prize {
		margin: 0 0 1rem;
		padding: 0.8rem 0.9rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	.balance {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.4rem;
		font-weight: 800;
	}
	.balance b,
	.cost,
	.grant,
	.num {
		font-family: 'Space Mono', monospace;
	}
	.prize h3,
	.group,
	.card h4 {
		margin: 0 0 0.35rem;
		font-family: 'Permanent Marker', sans-serif;
		font-weight: 400;
		line-height: 1.1;
		color: var(--ink);
	}
	.prize h3,
	.group {
		font-size: 1.6rem;
	}
	.prize p,
	.card p {
		margin: 0 0 0.45rem;
		font-weight: 700;
	}
	.prize .status {
		margin: 0;
	}
	.group {
		margin: 1rem 0 0.6rem;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
		gap: 0.9rem;
	}
	.card {
		display: flex;
		flex-direction: column;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	.card img {
		width: 100%;
		height: 150px;
		object-fit: cover;
		background: #d9e3ec;
		border-bottom: 3px solid var(--shadow);
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.75rem 0.8rem 0.85rem;
	}
	.card h4 {
		font-size: 1.35rem;
	}
	.fine {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 700;
	}
	.cost {
		margin: 0;
		font-weight: 700;
	}
	.see {
		justify-self: start;
		padding: 0.3rem 0.55rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		font: inherit;
		font-weight: 800;
		cursor: pointer;
	}
	.grant,
	.rate {
		display: none;
		margin: 0.35rem 0 0;
	}
	.grant {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.rate {
		font-size: 0.85rem;
		font-weight: 700;
	}
	.reveal:hover .grant,
	.reveal:hover .rate,
	.reveal:focus-within .grant,
	.reveal:focus-within .rate,
	.reveal.open .grant,
	.reveal.open .rate {
		display: block;
	}
	form {
		display: grid;
		gap: 0.45rem;
	}
	.stepper {
		display: flex;
		gap: 0.4rem;
		align-items: center;
	}
	.stepper button,
	summary {
		cursor: pointer;
		font-weight: 800;
	}
	.stepper input,
	label input,
	textarea {
		width: 100%;
		padding: 0.4rem 0.5rem;
		border: 3px solid var(--shadow);
		background: #fff;
		color: var(--ink);
		font: inherit;
		font-weight: 700;
	}
	.stepper input {
		width: 4.5rem;
	}
	label {
		display: grid;
		gap: 0.2rem;
		font-size: 0.85rem;
		font-weight: 800;
	}
	textarea {
		min-height: 4.5rem;
	}
	details {
		display: grid;
		gap: 0.45rem;
	}
	.err {
		margin: 0;
		color: var(--red-text);
		font-weight: 800;
	}
	.mine {
		margin: 0;
		padding: 0;
		list-style: none;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
	}
	.mine li {
		display: grid;
		grid-template-columns: 1.4fr repeat(4, auto);
		gap: 0.6rem;
		padding: 0.45rem 0.7rem;
		border-bottom: 1px solid #d9e3ec;
		font-weight: 700;
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
		.mine li {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
