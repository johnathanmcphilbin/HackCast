<script lang="ts">
	import { prizeWheel } from '#lib/content.ts';

	const SEGMENTS = 8;
	const fills = ['#ff2e88', '#2de2e6', '#15151f', '#0b0b12'];

	const slices = Array.from({ length: SEGMENTS }, (_, i) => {
		const a0 = (i / SEGMENTS) * 2 * Math.PI - Math.PI / 2;
		const a1 = ((i + 1) / SEGMENTS) * 2 * Math.PI - Math.PI / 2;
		const mid = (a0 + a1) / 2;
		const p = (a: number, r: number) =>
			`${(100 + r * Math.cos(a)).toFixed(2)} ${(100 + r * Math.sin(a)).toFixed(2)}`;
		const fill = fills[i % fills.length];
		const dark = fill === '#15151f' || fill === '#0b0b12';
		return {
			d: `M100 100 L${p(a0, 92)} A92 92 0 0 1 ${p(a1, 92)} Z`,
			fill,
			label: p(mid, 62).split(' ').map(Number),
			ink: dark ? '#ffffff' : '#0b0b12'
		};
	});

	let rotation = $state(0);
	function spin() {
		rotation += 720 + Math.floor(Math.random() * 360);
	}
</script>

<div class="wheel">
	<div class="disc">
		<svg class="pointer" viewBox="0 0 40 28" aria-hidden="true">
			<path d="M4 2h32L20 26z" fill="#ff2e88" />
		</svg>
		<svg
			viewBox="0 0 200 200"
			class="svg"
			style:transform="rotate({rotation}deg)"
			role="img"
			aria-label="Prize wheel. {prizeWheel.blurb}"
		>
			<circle cx="100" cy="100" r="97" fill="#0b0b12" stroke="#2a2a3a" stroke-width="3" />
			{#each slices as s, i (i)}
				<path d={s.d} fill={s.fill} stroke="#0b0b12" stroke-width="2" />
				<text
					x={s.label[0]}
					y={s.label[1]}
					text-anchor="middle"
					dominant-baseline="central"
					fill={s.ink}
					font-family="Tektur, sans-serif"
					font-size="18"
					font-weight="700">?</text
				>
			{/each}
			<circle cx="100" cy="100" r="12" fill="#0b0b12" stroke="#2de2e6" stroke-width="3" />
		</svg>
	</div>
	<button type="button" class="btn-hit btn-secondary" onclick={spin}>
		<span class="btn-face">Give it a spin</span>
	</button>
	<p>{prizeWheel.blurb}</p>
</div>

<style>
	.wheel {
		display: grid;
		justify-items: center;
		gap: 0.9rem;
	}
	.disc {
		position: relative;
		width: min(220px, 70vw);
	}
	.pointer {
		position: absolute;
		top: -6px;
		left: 50%;
		z-index: 1;
		width: 26px;
		transform: translateX(-50%);
	}
	.svg {
		display: block;
		width: 100%;
		height: auto;
		transition: transform 2.4s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	p {
		max-width: 36ch;
		margin: 0;
		color: #fff;
		font-size: 1rem;
		line-height: 1.5;
		text-align: center;
	}
</style>
