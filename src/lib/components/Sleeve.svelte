<script lang="ts">
	const grooves = Array.from({ length: 18 }, (_, i) => 92 + i * 7.2);
</script>

<svg class="sleeve-art" viewBox="0 0 720 530" role="img" aria-label="Hackcast 45 RPM record sliding out of its sleeve">
	<defs>
		<mask id="sleeve-paper">
			<rect x="28" y="44" width="368" height="420" fill="#fff" />
			<circle cx="330" cy="250" r="70" fill="#000" />
		</mask>
	</defs>

	<rect x="42" y="58" width="368" height="420" fill="#0c1422" />

	<g class="spin" style="transform-origin: 468px 262px">
		<circle cx="476" cy="270" r="214" fill="#0c1422" />
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
		<text x="468" y="272" text-anchor="middle" fill="#fff" font-family="Rammetto One, sans-serif" font-size="28">45</text>
		<circle cx="468" cy="262" r="7" fill="#f6e6cf" stroke="#0c1422" stroke-width="2" />
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
		<rect x="28" y="386" width="368" height="78" fill="#ec3750" />
	</g>
	<rect x="28" y="44" width="368" height="420" fill="none" stroke="#0c1422" stroke-width="3" />
	<circle cx="330" cy="250" r="70" fill="none" stroke="#0c1422" stroke-width="3" />

	<text x="212" y="148" text-anchor="middle" fill="#17171d" font-family="Rammetto One, sans-serif" font-size="38">HACKCAST</text>
	<text x="212" y="434" text-anchor="middle" fill="#fff" font-family="Space Mono, monospace" font-size="18" font-weight="700">45 RPM · VOL. 1</text>
</svg>

<style>
	.sleeve-art {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
</style>
