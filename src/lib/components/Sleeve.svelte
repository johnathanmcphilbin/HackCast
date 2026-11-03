<script lang="ts">
	const grooves = Array.from({ length: 18 }, (_, i) => 92 + i * 7.2);
	// Sleeve paper is 368 by 420. The die-cut and the record label share its centre.
	const sleeve = { x: 28, y: 44, w: 368, h: 420 };
	const cx = sleeve.x + sleeve.w / 2;
	const cy = sleeve.y + sleeve.h / 2;
	const windowR = 40;
</script>

<svg class="sleeve-art" viewBox="-16 32 470 460" role="img" aria-label="Hackcast 45 RPM record in its sleeve">
	<defs>
		<mask id="sleeve-paper">
			<rect x={sleeve.x} y={sleeve.y} width={sleeve.w} height={sleeve.h} fill="#fff" />
			<circle cx={cx} cy={cy} r={windowR} fill="#000" />
		</mask>
	</defs>

	<rect x="42" y="58" width="368" height="420" fill="#0c1422" />

	<g class="spin" style:transform-origin="{cx}px {cy}px">
		<circle cx={cx + 8} cy={cy + 8} r="214" fill="#0c1422" />
		<circle cx={cx} cy={cy} r="214" fill="#c9b8a3" stroke="#0c1422" stroke-width="4" />
		{#each Array.from({ length: 46 }) as _, i}
			<circle
				cx={cx + 200 * Math.cos((i / 46) * Math.PI * 2)}
				cy={cy + 200 * Math.sin((i / 46) * Math.PI * 2)}
				r="2.5"
				fill="#0c1422"
			/>
		{/each}
		<circle cx={cx} cy={cy} r="192" fill="#10151c" stroke="#0c1422" stroke-width="3" />
		{#each grooves as radius, i (radius)}
			<circle
				cx={cx}
				cy={cy}
				r={radius}
				fill="none"
				stroke={i % 4 === 0 ? '#4d6280' : '#2a3b52'}
				stroke-width={i % 4 === 0 ? 2.5 : 1.3}
			/>
		{/each}
		<path d="M74 132 A160 160 0 0 1 304 112" fill="none" stroke="#5a463a" stroke-width="16" stroke-linecap="round" opacity="0.65" />
		<path d="M134 382 A150 150 0 0 1 354 332" fill="none" stroke="#3a2a22" stroke-width="9" stroke-linecap="round" opacity="0.75" />
		<circle cx={cx} cy={cy} r="66" fill="#ec3750" stroke="#0c1422" stroke-width="3" />
		<text x={cx} y={cy + 10} text-anchor="middle" fill="#fff" font-family="Rammetto One, sans-serif" font-size="28">45</text>
		<circle cx={cx} cy={cy} r="7" fill="#f6e6cf" stroke="#0c1422" stroke-width="2" />
	</g>

	<g mask="url(#sleeve-paper)">
		<rect x={sleeve.x} y={sleeve.y} width={sleeve.w} height={sleeve.h} fill="#f3e2c3" />
		<rect x={sleeve.x} y={sleeve.y} width="20" height={sleeve.h} fill="#e7c9a0" />
		{#each [0, 1, 2, 3, 4] as i}
			<path
				d="M{56 + i * 10} 56 C{90 + i * 16} 150 {48 + i * 20} 280 {72 + i * 14} 450"
				fill="none"
				stroke="#e6d2b2"
				stroke-width="2"
			/>
		{/each}
		<rect x={sleeve.x} y="386" width={sleeve.w} height="78" fill="#ec3750" />
	</g>
	<rect x={sleeve.x} y={sleeve.y} width={sleeve.w} height={sleeve.h} fill="none" stroke="#0c1422" stroke-width="3" />
	<circle cx={cx} cy={cy} r={windowR} fill="none" stroke="#0c1422" stroke-width="3" />

	<text x={cx} y="148" text-anchor="middle" fill="#17171d" font-family="Rammetto One, sans-serif" font-size="38">HACKCAST</text>
	<text x={cx} y="434" text-anchor="middle" fill="#fff" font-family="Space Mono, monospace" font-size="18" font-weight="700">45 RPM · VOL. 1</text>
</svg>

<style>
	.sleeve-art {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
</style>
