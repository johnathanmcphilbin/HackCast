<script lang="ts">
	// Daily bars for the admin page. One series, or two side by side with a legend.
	type Series = { name: string; color: string; values: number[] };

	let {
		days,
		series,
		label,
		detail
	}: {
		days: string[];
		series: Series[];
		/** Read out to screen readers and used as the table caption. */
		label: string;
		/** Extra line in the tooltip for a day, e.g. how many builders. */
		detail?: (index: number) => string;
	} = $props();

	const W = 640;
	const H = 180;
	const PAD = { top: 10, right: 8, bottom: 22, left: 30 };
	const plotW = W - PAD.left - PAD.right;
	const plotH = H - PAD.top - PAD.bottom;

	let hovered = $state<number | null>(null);

	const max = $derived(Math.max(1, ...series.flatMap((s) => s.values)));
	const slot = $derived(plotW / Math.max(1, days.length));
	const barW = $derived(Math.max(2, (slot - 2) / series.length - (series.length > 1 ? 2 : 0)));
	const y = (value: number) => PAD.top + plotH - (value / max) * plotH;
	const short = (day: string) =>
		new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

	/** Rounded top, square bottom on the baseline. */
	function bar(x: number, value: number): string {
		const top = y(value);
		const h = PAD.top + plotH - top;
		if (h <= 0) return '';
		const r = Math.min(4, barW / 2, h);
		return `M${x} ${top + h}V${top + r}Q${x} ${top} ${x + r} ${top}H${x + barW - r}Q${x + barW} ${top} ${x + barW} ${top + r}V${top + h}Z`;
	}
</script>

<figure class="chart">
	{#if series.length > 1}
		<ul class="legend">
			{#each series as s (s.name)}
				<li><span class="swatch" style:background={s.color}></span>{s.name}</li>
			{/each}
		</ul>
	{/if}
	<div class="plot">
		<svg viewBox="0 0 {W} {H}" role="img" aria-label={label}>
			<line class="grid" x1={PAD.left} x2={W - PAD.right} y1={PAD.top} y2={PAD.top} />
			<line class="axis" x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} />
			<text class="tick" x={PAD.left - 6} y={PAD.top + 4} text-anchor="end">{max}</text>
			<text class="tick" x={PAD.left - 6} y={PAD.top + plotH + 4} text-anchor="end">0</text>
			{#each days as day, i (day)}
				{#each series as s, j (s.name)}
					<path
						d={bar(PAD.left + i * slot + 1 + j * (barW + 2), s.values[i] ?? 0)}
						fill={s.color}
						opacity={hovered === null || hovered === i ? 1 : 0.45}
					/>
				{/each}
				{#if i % 7 === (days.length - 1) % 7}
					<text class="tick" x={PAD.left + i * slot + slot / 2} y={H - 6} text-anchor="middle">{short(day)}</text>
				{/if}
				<rect
					class="hit"
					x={PAD.left + i * slot}
					y={PAD.top}
					width={slot}
					height={plotH}
					role="presentation"
					onpointerenter={() => (hovered = i)}
					onpointerleave={() => (hovered = null)}
				/>
			{/each}
		</svg>
		{#if hovered !== null}
			<div class="tip" style:left="{((PAD.left + hovered * slot + slot / 2) / W) * 100}%">
				<strong>{short(days[hovered])}</strong>
				{#each series as s (s.name)}
					<span>{s.name}: {s.values[hovered] ?? 0}</span>
				{/each}
				{#if detail}<span>{detail(hovered)}</span>{/if}
			</div>
		{/if}
	</div>
	<details>
		<summary>show as a table</summary>
		<table>
			<caption>{label}</caption>
			<thead>
				<tr>
					<th>day</th>
					{#each series as s (s.name)}<th>{s.name}</th>{/each}
				</tr>
			</thead>
			<tbody>
				{#each days as day, i (day)}
					<tr>
						<td>{day}</td>
						{#each series as s (s.name)}<td>{s.values[i] ?? 0}</td>{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</details>
</figure>

<style>
	.chart {
		margin: 0.6rem 0 0;
	}
	.plot {
		position: relative;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
	}
	.grid {
		stroke: #d9e3ec;
		stroke-width: 1;
	}
	.axis {
		stroke: #9fb0c2;
		stroke-width: 1;
	}
	.tick {
		fill: #4a5a6e;
		font-family: 'Space Mono', monospace;
		font-size: 10px;
	}
	.hit {
		fill: transparent;
	}
	.tip {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		display: grid;
		gap: 0.1rem;
		padding: 0.35rem 0.5rem;
		background: var(--ink);
		color: #fff;
		font-size: 0.78rem;
		white-space: nowrap;
		pointer-events: none;
	}
	.legend {
		display: flex;
		gap: 1rem;
		margin: 0 0 0.3rem;
		padding: 0;
		list-style: none;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.swatch {
		display: inline-block;
		width: 0.7rem;
		height: 0.7rem;
		margin-right: 0.35rem;
		border-radius: 2px;
	}
	details {
		margin-top: 0.3rem;
		font-size: 0.85rem;
	}
	summary {
		cursor: pointer;
		font-weight: 700;
	}
	table {
		border-collapse: collapse;
		margin-top: 0.4rem;
	}
	caption {
		text-align: left;
		font-weight: 700;
	}
	th,
	td {
		padding: 0.15rem 0.7rem 0.15rem 0;
		text-align: left;
		font-family: 'Space Mono', monospace;
	}
</style>
