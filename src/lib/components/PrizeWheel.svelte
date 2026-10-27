<script lang="ts">
	// Solid-segment prize wheel. Spinning it is just for fun: the real draw happens on the show.
	const SEGMENTS = 8;
	const fills = ['var(--color-pink)', 'var(--color-teal)', 'var(--color-cream)', 'var(--color-charcoal-2)'];

	const slices = Array.from({ length: SEGMENTS }, (_, i) => {
		const a0 = (i / SEGMENTS) * 2 * Math.PI - Math.PI / 2;
		const a1 = ((i + 1) / SEGMENTS) * 2 * Math.PI - Math.PI / 2;
		const mid = (a0 + a1) / 2;
		const p = (a: number, r: number) => `${(100 + r * Math.cos(a)).toFixed(2)} ${(100 + r * Math.sin(a)).toFixed(2)}`;
		return {
			d: `M100 100 L${p(a0, 92)} A92 92 0 0 1 ${p(a1, 92)} Z`,
			fill: fills[i % fills.length],
			label: p(mid, 62).split(' ').map(Number),
			dark: i % fills.length === 3
		};
	});

	let rotation = $state(0);
	function spin() {
		rotation += 720 + Math.floor(Math.random() * 360);
	}
</script>

<div class="flex flex-col items-center">
	<div class="relative w-64 sm:w-72">
		<!-- pointer -->
		<svg class="absolute -top-3 left-1/2 z-10 w-8 -translate-x-1/2" viewBox="0 0 40 40" aria-hidden="true">
			<path d="M4 4h32L20 36z" fill="var(--color-cream)" stroke="var(--color-charcoal)" stroke-width="4" stroke-linejoin="round" />
		</svg>
		<svg
			viewBox="0 0 200 200"
			class="w-full transition-transform duration-[2500ms] ease-[cubic-bezier(.2,.8,.2,1)]"
			style:transform="rotate({rotation}deg)"
			role="img"
			aria-label="The weekly prize wheel. Prizes will be announced soon."
		>
			<circle cx="100" cy="100" r="97" fill="var(--color-charcoal)" stroke="var(--color-cream)" stroke-width="4" />
			{#each slices as s, i (i)}
				<path d={s.d} fill={s.fill} stroke="var(--color-charcoal)" stroke-width="3" />
				<text
					x={s.label[0]}
					y={s.label[1]}
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Permanent Marker, cursive"
					font-size="22"
					fill={s.dark ? 'var(--color-cream)' : 'var(--color-charcoal)'}>?</text
				>
			{/each}
			<circle cx="100" cy="100" r="14" fill="var(--color-charcoal)" stroke="var(--color-cream)" stroke-width="4" />
		</svg>
	</div>
	<button
		type="button"
		onclick={spin}
		class="mt-6 border-3 border-cream px-4 py-2 font-mono text-sm font-bold uppercase hover:bg-cream hover:text-charcoal"
	>
		Give it a spin
	</button>
	<p class="mt-2 text-center font-marker text-teal">(practice round. prizes TBA)</p>
</div>
