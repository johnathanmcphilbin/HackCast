<script lang="ts">
	// K.O. II-style sampler drawn in the site palette. The readout is decorative.
	type StepId = 'build' | 'track' | 'ship';
	type KeyKind = 'step' | 'num' | 'record' | 'minus' | 'play';

	let { onhot }: { onhot?: (id: StepId | null) => void } = $props();

	let hovered = $state<StepId | null>(null);
	let focused = $state<StepId | null>(null);
	let locked = $state<StepId | null>(null);
	let pressed = $state<StepId | null>(null);

	const hot = $derived(hovered ?? focused ?? locked);

	function sync() {
		onhot?.(hovered ?? focused ?? locked);
	}

	const SHELL = { x: 8, y: 8, w: 588, h: 728, rx: 18 };
	const CREAM_H = 206;
	const DISPLAY_Y = SHELL.y + CREAM_H;
	const DISPLAY_H = 136;
	const DECK_Y = DISPLAY_Y + DISPLAY_H;
	const VB = { w: SHELL.x + SHELL.w + 20, h: SHELL.y + SHELL.h + 24 };

	const GRID = { x: 168, y: 378, w: 92, h: 72, gx: 10, gy: 12 };

	const T = 12;
	const SEG_GAP = 5;
	const INNER = 34;
	const VLEN = 24;
	const XH = T + SEG_GAP;
	const yUpper = T + SEG_GAP;
	const yMid = yUpper + VLEN + SEG_GAP;
	const yLower = yMid + T + SEG_GAP;
	const yBot = yLower + VLEN + SEG_GAP;
	const DIGIT_H = yBot + T;
	const DIGIT_W = XH + INNER + SEG_GAP + T;

	function horiz(x: number, y: number, w: number) {
		const inset = T * 0.45;
		const pts = [
			[x + inset, y],
			[x + w - inset, y],
			[x + w, y + T / 2],
			[x + w - inset, y + T],
			[x + inset, y + T],
			[x, y + T / 2]
		];
		return pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
	}

	function vert(x: number, y: number, h: number) {
		const inset = T * 0.45;
		const pts = [
			[x + T / 2, y],
			[x + T, y + inset],
			[x + T, y + h - inset],
			[x + T / 2, y + h],
			[x, y + h - inset],
			[x, y + inset]
		];
		return pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
	}

	const SEG: Record<string, string> = {
		A: horiz(XH, 0, INNER),
		B: vert(XH + INNER + SEG_GAP, yUpper, VLEN),
		C: vert(XH + INNER + SEG_GAP, yLower, VLEN),
		D: horiz(XH, yBot, INNER),
		E: vert(0, yLower, VLEN),
		F: vert(0, yUpper, VLEN),
		G: horiz(XH, yMid, INNER)
	};
	const SEG_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
	const GLYPH: Record<string, string> = {
		E: 'AFGED',
		P: 'ABFGE',
		'0': 'ABCDEF',
		'1': 'BC'
	};

	const DIGITS = ['E', 'P', '.', '0', '1'];
	const DIGIT_ADVANCE = DIGIT_W + 16;
	const DOT_SLOT = 26;
	let cursor = 0;
	const placed = DIGITS.map((ch) => {
		const item = { ch, x: cursor };
		cursor += ch === '.' ? DOT_SLOT : DIGIT_ADVANCE;
		return item;
	});
	const readoutW = cursor - 16;
	const readoutX = SHELL.x + SHELL.w / 2 - readoutW / 2;
	const readoutY = DISPLAY_Y + (DISPLAY_H - DIGIT_H) / 2;

	const GRILLE = { x: 424, y: 30, cols: 10, rows: 10, gap: 14.2, r: 3.3 };
	const dots = Array.from({ length: GRILLE.cols * GRILLE.rows }, (_, i) => {
		const col = i % GRILLE.cols;
		const row = Math.floor(i / GRILLE.cols);
		return {
			cx: GRILLE.x + col * GRILLE.gap,
			cy: GRILLE.y + row * GRILLE.gap
		};
	});

	const KNOB = { cx: 88, cy: 456, r: 34 };
	const needle = -55 * (Math.PI / 180);
	const needleA = { x: KNOB.cx + Math.cos(needle) * 12, y: KNOB.cy + Math.sin(needle) * 12 };
	const needleB = { x: KNOB.cx + Math.cos(needle) * 26, y: KNOB.cy + Math.sin(needle) * 26 };

	const keys: { id: string; label: string; col: number; row: number; kind: KeyKind }[] = [
		{ id: 'build', label: 'BUILD', col: 0, row: 0, kind: 'step' },
		{ id: '7', label: '7', col: 1, row: 0, kind: 'num' },
		{ id: '8', label: '8', col: 2, row: 0, kind: 'num' },
		{ id: '9', label: '9', col: 3, row: 0, kind: 'num' },
		{ id: 'track', label: 'TRACK', col: 0, row: 1, kind: 'step' },
		{ id: '4', label: '4', col: 1, row: 1, kind: 'num' },
		{ id: '5', label: '5', col: 2, row: 1, kind: 'num' },
		{ id: '6', label: '6', col: 3, row: 1, kind: 'num' },
		{ id: 'ship', label: 'SHIP', col: 0, row: 2, kind: 'step' },
		{ id: '1', label: '1', col: 1, row: 2, kind: 'num' },
		{ id: '2', label: '2', col: 2, row: 2, kind: 'num' },
		{ id: '3', label: '3', col: 3, row: 2, kind: 'num' },
		{ id: 'minus', label: '', col: 0, row: 3, kind: 'minus' },
		{ id: '0', label: '0', col: 1, row: 3, kind: 'num' },
		{ id: 'play', label: '', col: 2, row: 3, kind: 'play' },
		{ id: 'record', label: 'RECORD', col: 3, row: 3, kind: 'record' }
	];

	const steps = keys.filter((key) => key.kind === 'step');

	function cell(col: number, row: number) {
		return {
			x: GRID.x + col * (GRID.w + GRID.gx),
			y: GRID.y + row * (GRID.h + GRID.gy)
		};
	}

	function faceFill(kind: KeyKind, on: boolean) {
		if (on) return 'var(--brass)';
		if (kind === 'num') return 'var(--ink)';
		if (kind === 'record') return 'var(--red)';
		return 'var(--paper)';
	}

	function labelFill(kind: KeyKind) {
		if (kind === 'num') return 'var(--cream)';
		if (kind === 'record') return '#fff';
		return 'var(--ink)';
	}
</script>

<div class="sampler" role="group" aria-label="How it works sampler">
	<svg viewBox="0 0 {VB.w} {VB.h}" aria-hidden="true">
		<defs>
			<clipPath id="sampler-shell">
				<rect x={SHELL.x} y={SHELL.y} width={SHELL.w} height={SHELL.h} rx={SHELL.rx} />
			</clipPath>
		</defs>

		<rect
			x={SHELL.x + 10}
			y={SHELL.y + 12}
			width={SHELL.w}
			height={SHELL.h}
			rx={SHELL.rx}
			fill="var(--shadow)"
		/>

		<g clip-path="url(#sampler-shell)">
			<rect x={SHELL.x} y={SHELL.y} width={SHELL.w} height={SHELL.h} fill="var(--sleeve)" />
			<rect x={SHELL.x} y={SHELL.y} width={SHELL.w} height={CREAM_H} fill="var(--paper)" />
			<rect x={SHELL.x} y={DISPLAY_Y} width={SHELL.w} height={DISPLAY_H} fill="var(--ink)" />
			<line
				x1={SHELL.x}
				y1={DISPLAY_Y}
				x2={SHELL.x + SHELL.w}
				y2={DISPLAY_Y}
				stroke="var(--shadow)"
				stroke-width="3"
			/>
			<line
				x1={SHELL.x}
				y1={DECK_Y}
				x2={SHELL.x + SHELL.w}
				y2={DECK_Y}
				stroke="var(--shadow)"
				stroke-width="3"
			/>

			<text
				x="36"
				y="122"
				fill="var(--ink)"
				font-family="Rammetto One, sans-serif"
				font-size="50">HACKCAST</text
			>
			<text
				x="40"
				y="164"
				fill="var(--ink)"
				font-family="Space Mono, monospace"
				font-size="20"
				font-weight="700">sampler</text
			>

			{#each dots as dot, i (i)}
				<circle cx={dot.cx} cy={dot.cy} r={GRILLE.r} fill="var(--ink)" />
			{/each}

			{#each placed as item (item.ch + item.x)}
				{#if item.ch === '.'}
					<rect
						x={readoutX + item.x + 6}
						y={readoutY + DIGIT_H - 16}
						width="12"
						height="12"
						fill="var(--cream)"
					/>
				{:else}
					<g transform="translate({readoutX + item.x} {readoutY})">
						{#each SEG_NAMES.filter((name) => GLYPH[item.ch].includes(name)) as name (name)}
							<polygon points={SEG[name]} fill="var(--cream)" />
						{/each}
					</g>
				{/if}
			{/each}

			<text
				x={KNOB.cx}
				y="408"
				text-anchor="middle"
				fill="var(--cream)"
				font-family="Space Mono, monospace"
				font-size="14"
				font-weight="700">VOLUME</text
			>
			<circle cx={KNOB.cx + 6} cy={KNOB.cy + 6} r={KNOB.r} fill="var(--shadow)" />
			<circle
				cx={KNOB.cx}
				cy={KNOB.cy}
				r={KNOB.r}
				fill="var(--paper)"
				stroke="var(--shadow)"
				stroke-width="3"
			/>
			<line
				x1={needleA.x}
				y1={needleA.y}
				x2={needleB.x}
				y2={needleB.y}
				stroke="var(--brass)"
				stroke-width="5"
				stroke-linecap="round"
			/>
			<circle cx={KNOB.cx} cy={KNOB.cy} r="6" fill="var(--ink)" />

			<text
				x={KNOB.cx}
				y="548"
				text-anchor="middle"
				fill="var(--cream)"
				font-family="Space Mono, monospace"
				font-size="14"
				font-weight="700">FADER</text
			>
			<rect x="86" y="568" width="16" height="140" rx="8" fill="var(--shadow)" />
			<rect
				x="80"
				y="562"
				width="16"
				height="140"
				rx="8"
				fill="var(--bg)"
				stroke="var(--shadow)"
				stroke-width="3"
			/>
			<rect x="70" y="630" width="48" height="26" rx="5" fill="var(--shadow)" />
			<rect
				x="64"
				y="624"
				width="48"
				height="26"
				rx="5"
				fill="var(--brass)"
				stroke="var(--shadow)"
				stroke-width="3"
			/>
			<line x1="76" y1="633" x2="100" y2="633" stroke="var(--ink)" stroke-width="2" />
			<line x1="76" y1="640" x2="100" y2="640" stroke="var(--ink)" stroke-width="2" />

			{#each keys as key (key.id)}
				{@const box = cell(key.col, key.row)}
				{@const on = key.kind === 'step' && hot === key.id}
				{@const down = pressed === key.id}
				<rect
					x={box.x + 5}
					y={box.y + 5}
					width={GRID.w}
					height={GRID.h}
					rx="8"
					fill="var(--shadow)"
				/>
				<g transform={down ? 'translate(3 3)' : undefined}>
					<rect
						x={box.x}
						y={box.y}
						width={GRID.w}
						height={GRID.h}
						rx="8"
						fill={faceFill(key.kind, on)}
						stroke="var(--shadow)"
						stroke-width="3"
					/>
					{#if key.kind === 'minus'}
						<rect
							x={box.x + GRID.w / 2 - 14}
							y={box.y + GRID.h / 2 - 3}
							width="28"
							height="6"
							rx="1"
							fill="var(--ink)"
						/>
					{:else if key.kind === 'play'}
						<polygon
							points="{box.x + GRID.w / 2 - 7},{box.y + GRID.h / 2 - 12} {box.x + GRID.w / 2 - 7},{box.y + GRID.h / 2 + 12} {box.x + GRID.w / 2 + 13},{box.y + GRID.h / 2}"
							fill="var(--ink)"
						/>
					{:else}
						<text
							x={box.x + GRID.w / 2}
							y={box.y + GRID.h / 2}
							text-anchor="middle"
							dominant-baseline="central"
							fill={labelFill(key.kind)}
							font-family={key.kind === 'step' ? 'Archivo Black, sans-serif' : 'Space Mono, monospace'}
							font-size={key.kind === 'num' ? 28 : key.kind === 'record' ? 19 : 17}
							font-weight={key.kind === 'step' ? 400 : 700}>{key.label}</text
						>
					{/if}
				</g>
			{/each}
		</g>

		<rect
			x={SHELL.x}
			y={SHELL.y}
			width={SHELL.w}
			height={SHELL.h}
			rx={SHELL.rx}
			fill="none"
			stroke="var(--shadow)"
			stroke-width="3"
		/>
	</svg>

	{#each steps as step (step.id)}
		{@const box = cell(step.col, step.row)}
		<button
			type="button"
			class="hit"
			style:left="{(box.x / VB.w) * 100}%"
			style:top="{(box.y / VB.h) * 100}%"
			style:width="{(GRID.w / VB.w) * 100}%"
			style:height="{(GRID.h / VB.h) * 100}%"
			aria-label="Highlight the {step.id} step"
			aria-controls="step-{step.id}"
			aria-pressed={locked === step.id}
			onpointerenter={() => {
				hovered = step.id as StepId;
				sync();
			}}
			onpointerleave={() => {
				if (hovered === step.id) hovered = null;
				if (pressed === step.id) pressed = null;
				sync();
			}}
			onpointerdown={() => (pressed = step.id as StepId)}
			onpointerup={() => (pressed = null)}
			onpointercancel={() => (pressed = null)}
			onfocus={() => {
				focused = step.id as StepId;
				sync();
			}}
			onblur={() => {
				focused = null;
				sync();
			}}
			onclick={() => {
				locked = locked === step.id ? null : (step.id as StepId);
				sync();
			}}
		></button>
	{/each}
</div>

<style>
	.sampler {
		position: relative;
		width: 100%;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
		pointer-events: none;
	}
	.hit {
		position: absolute;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: 8px;
		background: transparent;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
</style>
