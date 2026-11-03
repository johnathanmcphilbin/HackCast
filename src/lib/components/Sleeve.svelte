<script lang="ts">
	const grooves = Array.from({ length: 18 }, (_, i) => 92 + i * 7.2);
</script>

<svg class="sleeve-art" viewBox="0 0 720 530" role="img" aria-label="Hackcast record sliding out of its sleeve">
	<defs>
		<mask id="sleeve-paper">
			<rect x="28" y="44" width="368" height="420" fill="#fff" />
			<circle cx="330" cy="250" r="70" fill="#000" />
		</mask>
	</defs>

	<rect x="42" y="58" width="368" height="420" fill="#17171d" />

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

<style>
	.sleeve-art {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
</style>
