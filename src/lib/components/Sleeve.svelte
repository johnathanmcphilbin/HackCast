<script lang="ts">
	const grooves = [100, 124, 148];

	// How far the record has slid right out of the sleeve, in viewBox units. Hover to peek;
	// click, tap, drag it out or press Enter to pull it out and play the episode 1 sneak peek.
	const TUCKED = 0; // fully inside the sleeve, centred behind the window
	const OUT = 300;
	let svg: SVGSVGElement;
	let tx = $state(TUCKED);
	let dragging = $state(false);
	let start = { x: 0, tx: 0, moved: false };
	const playing = $derived(tx > OUT / 2);
	let peek = $state(false);

	function pullOut() {
		tx = OUT;
		peek = true;
	}

	// Start with sound; if the browser blocks that, play muted so it still starts.
	function autoplay(video: HTMLVideoElement) {
		video.play().catch(() => {
			video.muted = true;
			video.play().catch(() => {});
		});
	}

	function closePeek() {
		peek = false;
		tx = TUCKED;
	}

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
		tx = Math.min(OUT + 20, Math.max(TUCKED, start.tx + dx));
	}

	function up() {
		if (!dragging) return;
		dragging = false;
		if (!start.moved || playing) pullOut();
		else tx = TUCKED;
	}

	// Mouse only: a tap on a phone also fires enter/leave, and click already toggles there.
	function hover(e: PointerEvent, out: boolean) {
		if (e.pointerType !== 'mouse' || dragging || peek) return;
		tx = out ? OUT : TUCKED;
	}

	function key(e: KeyboardEvent) {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		pullOut();
	}
</script>

<svg
	bind:this={svg}
	class="sleeve-art"
	class:dragging
	viewBox="0 0 720 530"
	role="button"
	tabindex="0"
	aria-label="Pull the Hackcast record out and play the episode 1 sneak peek"
	onpointerenter={(e) => hover(e, true)}
	onpointerleave={(e) => hover(e, false)}
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	onkeydown={key}
>
	<defs>
		<mask id="sleeve-paper">
			<rect x="28" y="44" width="368" height="420" fill="#fff" />
			<circle cx="212" cy="254" r="20" fill="#000" />
		</mask>
	</defs>

	<g class="record" class:dragging style:transform="translate({tx}px, 0)">
		<g class="spin" class:playing style="transform-origin: 212px 254px">
			<circle cx="212" cy="254" r="176" fill="#10151c" stroke="#0c1422" stroke-width="4" />
			{#each grooves as radius (radius)}
				<circle cx="212" cy="254" r={radius} fill="none" stroke="#2a3b52" stroke-width="2" />
			{/each}
			<circle cx="212" cy="254" r="62" fill="#ec3750" stroke="#0c1422" stroke-width="3" />
			<text x="212" y="240" text-anchor="middle" fill="#fff" font-family="'Permanent Marker', sans-serif" font-size="24">EP 01</text>
			<text x="212" y="284" text-anchor="middle" fill="#f6e6cf" font-family="Space Mono, monospace" font-size="14" font-weight="700">coming soon</text>
			<circle cx="212" cy="254" r="6" fill="#f6e6cf" stroke="#0c1422" stroke-width="2" />
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
	<circle cx="212" cy="254" r="20" fill="none" stroke="#0c1422" stroke-width="3" />

	<text x="212" y="148" text-anchor="middle" fill="#17171d" font-family="'Permanent Marker', sans-serif" font-size="38">HACKCAST</text>
	<text x="212" y="434" text-anchor="middle" fill="#fff" font-family="Space Mono, monospace" font-size="18" font-weight="700">45 RPM · VOL. 1</text>
</svg>

<svelte:window onkeydown={(e) => peek && e.key === 'Escape' && closePeek()} />

{#if peek}
	<div class="peek-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && closePeek()}>
		<div class="peek" role="dialog" aria-modal="true" aria-label="Episode 1 sneak peek">
			<!-- svelte-ignore a11y_media_has_caption (captions are burned into the video) -->
			<video src="/video/sneak-peek.mp4" poster="/video/sneak-peek.jpg" controls playsinline {@attach autoplay}></video>
			<button class="redbtn" type="button" onclick={closePeek}>close</button>
		</div>
	</div>
{/if}

<style>
	.sleeve-art {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
		touch-action: pan-y;
		cursor: grab;
		outline: none;
	}
	.sleeve-art.dragging {
		cursor: grabbing;
	}
	.sleeve-art:focus-visible > rect:last-of-type {
		stroke: #ec3750;
	}
	.record {
		transition: transform 0.45s cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	.record.dragging {
		transition: none;
	}
	.spin.playing {
		animation: spin 1.8s linear infinite;
	}
	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}
	.peek-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: grid;
		place-items: center;
		padding: 16px;
		background: rgb(12 20 34 / 0.8);
	}
	.peek {
		display: grid;
		justify-items: center;
		gap: 0.8rem;
	}
	.peek video {
		display: block;
		height: min(78vh, 720px);
		max-width: calc(100vw - 32px);
		aspect-ratio: 9 / 16;
		background: #000;
		border: 3px solid #0c1422;
	}
	.peek button {
		cursor: pointer;
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
