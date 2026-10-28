<script lang="ts">
	import type { Faq } from '#lib/content.ts';

	let {
		items,
		prefix = 'Q',
		start = 1,
		openFirst = false
	}: {
		items: readonly Faq[];
		prefix?: 'Q' | '';
		start?: number;
		openFirst?: boolean;
	} = $props();

	function num(i: number) {
		const n = String(start + i).padStart(2, '0');
		return prefix === 'Q' ? `Q${n}` : n;
	}
</script>

<div class="list">
	{#each items as item, i (item.id)}
		<details class="item" open={openFirst && i === 0}>
			<summary>
				<span class="num">{num(i)}</span>
				<span class="q">{item.q}</span>
				{#if item.tbc}<span class="tag tag-acid-line">TBC</span>{/if}
				<span class="mark" aria-hidden="true"></span>
			</summary>
			<p>{item.a}</p>
		</details>
	{/each}
</div>

<style>
	.list {
		border-top: 1px solid var(--line);
	}
	.item {
		border-bottom: 1px solid var(--line);
	}
	.item[open] {
		border-color: var(--cyan);
		box-shadow: inset 3px 0 0 var(--cyan);
	}
	summary {
		display: flex;
		gap: 0.85rem;
		align-items: center;
		min-height: 56px;
		padding: 0.85rem 0.2rem;
		color: #fff;
		font-family: 'Chakra Petch', sans-serif;
		font-size: 1.05rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		line-height: 1.2;
		text-transform: uppercase;
		cursor: pointer;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary:hover .q {
		color: var(--cyan);
	}
	.item[open] summary {
		color: var(--mag);
	}
	.item[open] summary:hover .q {
		color: var(--mag);
	}
	.num {
		flex: none;
		width: 2.6rem;
		color: var(--cyan);
		font-family: 'Space Mono', monospace;
		font-size: 0.8rem;
		font-weight: 400;
		letter-spacing: 0.12em;
	}
	.q {
		flex: 1;
	}
	.mark {
		flex: none;
		width: 0.8rem;
		color: var(--cyan);
		font-family: 'Space Mono', monospace;
		font-size: 1.25rem;
		line-height: 1;
	}
	.mark::before {
		content: '+';
	}
	.item[open] .mark::before {
		content: '−';
	}
	p {
		max-width: 64ch;
		margin: 0;
		padding: 0 0.2rem 1.1rem 3.45rem;
		color: #fff;
		font-size: 1.05rem;
		line-height: 1.6;
	}
	@media (max-width: 699px) {
		summary {
			font-size: 0.95rem;
		}
		p {
			padding-left: 0.2rem;
		}
	}
</style>
