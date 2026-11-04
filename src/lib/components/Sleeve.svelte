<script lang="ts">
	const grooves = Array.from({ length: 18 }, (_, i) => 92 + i * 7.2);

	// How far the record sits from fully out, in viewBox units. Hover, drag or click it.
	const TUCKED = -138; // record centre (468 - 138 = 330) lines up with the sleeve window
	const OUT = 0;
	let svg: SVGSVGElement;
	let tx = $state(TUCKED);
	let dragging = $state(false);
	let start = { x: 0, tx: 0, moved: false };
	const playing = $derived(tx > TUCKED / 3);

	function unitsPerPx(): number {
		return 720 / svg.getBoundingClientRect().width;
	}

	function down(e: PointerEvent) {
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		start = { x: e.clientX, tx, moved: false };
		dragging = true;
	}

	function move(e: PointerEvent) {
		if (!dragging) return;
		const dx = (e.clientX - start.x) * unitsPerPx();
		if (Math.abs(dx) > 4) start.moved = true;
		tx = Math.min(OUT + 30, Math.max(TUCKED, start.tx + dx));
	}

	function up() {
		if (!dragging) return;
		dragging = false;
		if (!start.moved) tx = start.tx === OUT ? TUCKED : OUT;
		else tx = playing ? OUT : TUCKED;
	}

	// Mouse only: a tap on a phone also fires enter/leave, and click already toggles there.
	function hover(e: PointerEvent, out: boolean) {
		if (e.pointerType !== 'mouse' || dragging) return;
		tx = out ? OUT : TUCKED;
	}

	function key(e: KeyboardEvent) {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		tx = tx === OUT ? TUCKED : OUT;
	}
</script>

<svg
	bind:this={svg}
	class="sleeve-art"
	viewBox="0 0 720 530"
	role="img"
	aria-label="Hackcast 45 RPM record sliding out of its sleeve"
	onpointerenter={(e) => hover(e, true)}
	onpointerleave={(e) => hover(e, false)}
>
	<defs>
		<mask id="sleeve-paper">
			<rect x="28" y="44" width="368" height="420" fill="#fff" />
			<circle cx="330" cy="262" r="23" fill="#000" />
		</mask>
	</defs>

	<rect x="42" y="58" width="368" height="420" fill="#0c1422" />

	<g
		class="record"
		class:dragging
		style:transform="translate({tx}px, 0)"
		role="button"
		tabindex="0"
		aria-label={playing ? 'Slide the record back into its sleeve' : 'Pull the record out of its sleeve'}
		aria-pressed={playing}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		onkeydown={key}
	>
	<circle cx="476" cy="270" r="214" fill="#0c1422" />
	<g class="spin" class:playing style="transform-origin: 468px 262px">
		<circle cx="468" cy="262" r="214" fill="#c9b8a3" stroke="#0c1422" stroke-width="4" />
		{#each Array.from({ length: 46 }) as _, i}
			<circle
				cx={468 + 200 * Math.cos((i / 46) * Math.PI * 2)}
				cy={262 + 200 * Math.sin((i / 46) * Math.PI * 2)}
				r="2.5"
				fill="#0c1422"
			/>
		{/each}
		<circle cx="468" cy="262" r="192" fill="#10151c" stroke="#0c1422" stroke-width="3" />
		{#each grooves as radius, i (radius)}
			<circle
				cx="468"
				cy="262"
				r={radius}
				fill="none"
				stroke={i % 4 === 0 ? '#4d6280' : '#2a3b52'}
				stroke-width={i % 4 === 0 ? 2.5 : 1.3}
			/>
		{/each}
		<path d="M330 140 A160 160 0 0 1 560 120" fill="none" stroke="#5a463a" stroke-width="16" stroke-linecap="round" opacity="0.65" />
		<path d="M390 390 A150 150 0 0 1 610 340" fill="none" stroke="#3a2a22" stroke-width="9" stroke-linecap="round" opacity="0.75" />
		<circle cx="468" cy="262" r="66" fill="#ec3750" stroke="#0c1422" stroke-width="3" />
		<text x="468" y="246" text-anchor="middle" fill="#fff" font-family="Rammetto One, sans-serif" font-size="24">EP 01</text>
		<text x="468" y="292" text-anchor="middle" fill="#f6e6cf" font-family="Space Mono, monospace" font-size="14" font-weight="700">coming soon</text>
		<circle cx="468" cy="262" r="7" fill="#f6e6cf" stroke="#0c1422" stroke-width="2" />
	</g>
	</g>

	<g mask="url(#sleeve-paper)">
		<rect x="28" y="44" width="368" height="420" fill="#f3e2c3" />
		<rect x="28" y="44" width="20" height="420" fill="#e7c9a0" />
		{#each [0, 1, 2, 3, 4] as i}
			<path
				d="M{56 + i * 10} 56 C{90 + i * 16} 150 {48 + i * 20} 280 {72 + i * 14} 450"
				fill="none"
				stroke="#e6d2b2"
				stroke-width="2"
			/>
		{/each}
		<!-- crowd photo, pre-screened navy halftone (transparent PNG) printed on the paper -->
		<image href="/art/sleeve-crowd-halftone-navy.png" x="62" y="200" width="300" height="139" opacity="0.72" />
		<rect x="28" y="386" width="368" height="78" fill="#ec3750" />
	</g>
	<rect x="28" y="44" width="368" height="420" fill="none" stroke="#0c1422" stroke-width="3" />
	<circle cx="330" cy="262" r="23" fill="none" stroke="#0c1422" stroke-width="3" />

	<text x="212" y="148" text-anchor="middle" fill="#17171d" font-family="Rammetto One, sans-serif" font-size="38">HACKCAST</text>
	<text x="212" y="434" text-anchor="middle" fill="#fff" font-family="Space Mono, monospace" font-size="18" font-weight="700">45 RPM · VOL. 1</text>
</svg>

<style>
	.sleeve-art {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
		touch-action: pan-y;
	}
	.record {
		cursor: grab;
		outline: none;
		transition: transform 0.45s cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	.record.dragging {
		cursor: grabbing;
		transition: none;
	}
	.record:focus-visible > circle:first-child {
		stroke: #ec3750;
		stroke-width: 6;
	}
	.spin.playing {
		animation: spin 1.8s linear infinite;
	}
	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.record {
			transition: none;
		}
		.spin.playing {
			animation: none;
		}
	}
</style>
