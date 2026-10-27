<script lang="ts">
	// The weekly prize wheel. Spinning this copy is practice; the real draw is on the show.
	const SEGMENTS = 8;
	const fills = ['#f34d91', '#43c8b4', '#252329', '#fffcf8'];

	const slices = Array.from({ length: SEGMENTS }, (_, i) => {
		const a0 = (i / SEGMENTS) * 2 * Math.PI - Math.PI / 2;
		const a1 = ((i + 1) / SEGMENTS) * 2 * Math.PI - Math.PI / 2;
		const p = (a: number, r: number) =>
			`${(100 + r * Math.cos(a)).toFixed(2)} ${(100 + r * Math.sin(a)).toFixed(2)}`;
		return {
			d: `M100 100 L${p(a0, 92)} A92 92 0 0 1 ${p(a1, 92)} Z`,
			fill: fills[i % fills.length]
		};
	});

	let rotation = $state(0);
	function spin() {
		rotation += 720 + Math.floor(Math.random() * 360);
	}
</script>

<div class="pt-2">
	<div class="relative w-52 sm:w-56">
		<svg class="absolute -top-2 left-1/2 z-10 w-7 -translate-x-1/2" viewBox="0 0 40 40" aria-hidden="true">
			<path
				d="M4 4h32L20 36z"
				fill="#f34d91"
				stroke="#252329"
				stroke-width="3"
				stroke-linejoin="round"
			/>
		</svg>
		<svg
			viewBox="0 0 200 200"
			class="w-full transition-transform duration-[2200ms] ease-[cubic-bezier(.2,.8,.2,1)]"
			style:transform="rotate({rotation}deg)"
			aria-hidden="true"
		>
			<circle cx="100" cy="100" r="97" fill="#252329" />
			{#each slices as s, i (i)}
				<path d={s.d} fill={s.fill} stroke="#252329" stroke-width="3" />
			{/each}
			<circle cx="100" cy="100" r="12" fill="#252329" stroke="#f5f1e9" stroke-width="4" />
		</svg>
	</div>
	<button
		type="button"
		onclick={spin}
		class="mt-4 min-h-11 border-2 border-charcoal px-4 py-2 font-bold hover:bg-charcoal hover:text-cream"
		aria-describedby="wheel-note"
	>
		Spin
	</button>
	<p id="wheel-note" class="mt-3 max-w-[16rem] text-sm leading-snug">
		Practice spin. The real draw is on the show, and the prizes aren’t on this wheel yet.
	</p>
</div>
