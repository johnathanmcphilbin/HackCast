<script lang="ts">
	import { tick } from 'svelte';

	const grooves = Array.from({ length: 18 }, (_, i) => 92 + i * 7.2);
	const CLIP = '/ep1-snuck-under-curtains.mp4';

	// Record is drawn in the "out" pose. Negative tx slides it back into the sleeve (viewBox units).
	const TUCKED = -210;
	const OUT = 0;
	let svg: SVGSVGElement;
	let video = $state<HTMLVideoElement>();
	let tx = $state(TUCKED);
	let dragging = $state(false);
	let start = { x: 0, tx: 0, moved: false };
	const pulled = $derived(tx > (TUCKED + OUT) / 2);

	let clip = $state(false);
	let muted = $state(true);
	let token = 0;

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
		tx = Math.min(OUT + 24, Math.max(TUCKED, start.tx + dx));
	}

	function up() {
		if (!dragging) return;
		dragging = false;
		if (!start.moved) tx = start.tx === OUT ? TUCKED : OUT;
		else tx = pulled ? OUT : TUCKED;
		if (tx === OUT) openClip(true);
		else closeClip();
	}

	function key(e: KeyboardEvent) {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		tx = tx === OUT ? TUCKED : OUT;
		if (tx === OUT) openClip(true);
		else closeClip();
	}

	function tuck() {
		tx = TUCKED;
		closeClip();
	}

	function closeClip() {
		token++;
		clip = false;
		muted = true;
	}

	async function openClip(withSound: boolean) {
		if (clip) {
			if (withSound) await unmute();
			return;
		}
		const mine = ++token;
		clip = true;
		await tick();
		if (mine !== token || !video) return;
		video.currentTime = 0;
		video.muted = !withSound;
		muted = video.muted;
		try {
			await video.play();
		} catch {
			if (mine !== token || !video) return;
			video.muted = true;
			muted = true;
			try {
				await video.play();
			} catch {
				/* autoplay blocked; the sound button retries on a gesture */
			}
		}
	}

	async function unmute() {
		if (!video) return;
		video.muted = false;
		muted = false;
		try {
			await video.play();
		} catch {
			video.muted = true;
			muted = true;
		}
	}

	function toggleSound() {
		if (muted) void unmute();
		else if (video) {
			video.muted = true;
			muted = true;
		}
	}
</script>

<div class="sleeve-wrap">
	<svg
		bind:this={svg}
		class="sleeve-art"
		class:dragging
		viewBox="0 0 720 530"
		role="button"
		tabindex="0"
		aria-label={pulled
			? 'Slide the Hackcast record back into its sleeve'
			: 'Pull the Hackcast record out of its sleeve to play the Episode 1 teaser'}
		aria-pressed={pulled}
		aria-expanded={clip}
		aria-controls="ep1-teaser"
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		onkeydown={key}
	>
		<defs>
			<mask id="sleeve-paper">
				<rect x="28" y="44" width="368" height="420" fill="#fff" />
				<circle cx="330" cy="250" r="70" fill="#000" />
			</mask>
		</defs>

		<rect x="42" y="58" width="368" height="420" fill="#17171d" />

		<g class="record" class:dragging style:transform="translate({tx}px, 0)">
			<g class="spin" style="transform-origin: 468px 262px">
				<circle cx="476" cy="270" r="214" fill="#17171d" />
				<circle cx="468" cy="262" r="214" fill="#17171d" stroke="#f6e6cf" stroke-width="8" />
				<circle cx="468" cy="262" r="192" fill="#17171d" stroke="#3a4766" stroke-width="3" />
				{#each grooves as radius, i (radius)}
					<circle
						cx="468"
						cy="262"
						r={radius}
						fill="none"
						stroke="#3a4766"
						stroke-width={i % 4 === 0 ? 2.6 : 1.2}
					/>
				{/each}
				<path d="M348 148 A158 158 0 0 1 575 128" fill="none" stroke="#43c8b4" stroke-width="14" stroke-linecap="round" />
				<circle cx="468" cy="262" r="66" fill="#ec3750" stroke="#17171d" stroke-width="3" />
				<circle cx="444" cy="262" r="9" fill="#f6e6cf" />
				<circle cx="468" cy="262" r="9" fill="#f6e6cf" />
				<circle cx="492" cy="262" r="9" fill="#f6e6cf" />
				<circle cx="468" cy="262" r="3.6" fill="#17171d" />
			</g>
		</g>

		<g mask="url(#sleeve-paper)">
			<rect x="28" y="44" width="368" height="420" fill="#f6e6cf" />
			{#each [0, 1, 2, 3, 4] as i}
				<path
					d="M{56 + i * 10} 56 C{90 + i * 16} 150 {48 + i * 20} 280 {72 + i * 14} 450"
					fill="none"
					stroke="#17171d"
					stroke-opacity="0.14"
					stroke-width="2"
				/>
			{/each}
			<rect x="28" y="386" width="368" height="78" fill="#ec3750" />
		</g>
		<rect x="28" y="44" width="368" height="420" fill="none" stroke="#17171d" stroke-width="3" />
		<circle cx="330" cy="250" r="70" fill="none" stroke="#17171d" stroke-width="3" />

		<text x="212" y="156" text-anchor="middle" fill="#17171d" font-family="Archivo Black, sans-serif" font-size="36">hackcast</text>
		<text x="212" y="434" text-anchor="middle" fill="#ffffff" font-family="Space Mono, monospace" font-size="16" font-weight="700">45 RPM</text>
	</svg>

	{#if clip}
		<div class="clip" id="ep1-teaser">
			<video
				bind:this={video}
				src={CLIP}
				poster="/ep1-snuck-under-curtains.jpg"
				playsinline
				preload="auto"
				muted={muted}
				aria-label="Episode 1 teaser"
			></video>
			<p class="clip-bar">
				<span>EP 01</span>
				<button type="button" onclick={toggleSound}>{muted ? 'sound on' : 'mute'}</button>
				<button type="button" onclick={tuck}>slide back</button>
			</p>
		</div>
	{/if}
</div>

<style>
	.sleeve-wrap {
		position: relative;
	}
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
	.record {
		transform-box: view-box;
		transition: transform 0.45s cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	.record.dragging {
		transition: none;
	}
	.clip {
		position: absolute;
		z-index: 2;
		right: 1%;
		top: 8%;
		width: min(210px, 36%);
		background: var(--ink);
		border: 3px solid var(--shadow);
	}
	.clip video {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 9 / 16;
		object-fit: cover;
		background: var(--ink);
	}
	.clip-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.35rem 0.6rem;
		margin: 0;
		padding: 0.28rem 0.45rem 0.32rem;
		background: var(--paper);
		color: var(--ink);
		font-family: 'Space Mono', monospace;
		font-size: 0.66rem;
		font-weight: 700;
	}
	.clip-bar button {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
		cursor: pointer;
	}
	@media (prefers-reduced-motion: reduce) {
		.record {
			transition: none;
		}
	}
</style>
