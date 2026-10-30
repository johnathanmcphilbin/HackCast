<svg class="mixer" viewBox="0 0 560 440" role="img" aria-label="DJ mixer">
	<rect x="16" y="18" width="528" height="404" rx="18" fill="#0c1422" />
	<rect x="6" y="6" width="528" height="404" rx="18" fill="#243656" stroke="#0c1422" stroke-width="3" />

	<text x="28" y="44" fill="#f6e6cf" font-family="Bungee, sans-serif" font-size="22">HACKCAST</text>
	<text x="532" y="42" text-anchor="end" fill="#f6e6cf" font-family="Space Mono, monospace" font-size="13" font-weight="700">MIX</text>

	<!-- VU meters. Needles are one of the three kept animations. -->
	<g>
		<rect x="28" y="64" width="160" height="96" rx="8" fill="#0c1422" />
		<rect x="24" y="60" width="160" height="96" rx="8" fill="#f3e2c3" stroke="#0c1422" stroke-width="3" />
		{#each [0, 1, 2, 3, 4] as i}
			<line
				x1={104 + Math.cos(Math.PI + (i / 4) * Math.PI) * 52}
				y1={128 + Math.sin(Math.PI + (i / 4) * Math.PI) * 40}
				x2={104 + Math.cos(Math.PI + (i / 4) * Math.PI) * 64}
				y2={128 + Math.sin(Math.PI + (i / 4) * Math.PI) * 52}
				stroke="#17171d"
				stroke-width="2"
				stroke-linecap="round"
			/>
		{/each}
		<g class="vu-needle" style="transform-origin: 104px 132px">
			<line x1="104" y1="132" x2="58" y2="92" stroke="#ec3750" stroke-width="3.5" stroke-linecap="round" />
		</g>
		<circle cx="104" cy="132" r="6" fill="#17171d" />
		<text x="104" y="148" text-anchor="middle" fill="#17171d" font-family="Space Mono, monospace" font-size="12" font-weight="700">CH 1</text>
	</g>
	<g>
		<rect x="212" y="64" width="160" height="96" rx="8" fill="#0c1422" />
		<rect x="208" y="60" width="160" height="96" rx="8" fill="#f3e2c3" stroke="#0c1422" stroke-width="3" />
		{#each [0, 1, 2, 3, 4] as i}
			<line
				x1={288 + Math.cos(Math.PI + (i / 4) * Math.PI) * 52}
				y1={128 + Math.sin(Math.PI + (i / 4) * Math.PI) * 40}
				x2={288 + Math.cos(Math.PI + (i / 4) * Math.PI) * 64}
				y2={128 + Math.sin(Math.PI + (i / 4) * Math.PI) * 52}
				stroke="#17171d"
				stroke-width="2"
				stroke-linecap="round"
			/>
		{/each}
		<g class="vu-needle" style="transform-origin: 288px 132px; animation-duration: 1.15s; animation-delay: -0.4s">
			<line x1="288" y1="132" x2="248" y2="86" stroke="#ec3750" stroke-width="3.5" stroke-linecap="round" />
		</g>
		<circle cx="288" cy="132" r="6" fill="#17171d" />
		<text x="288" y="148" text-anchor="middle" fill="#17171d" font-family="Space Mono, monospace" font-size="12" font-weight="700">CH 2</text>
	</g>

	<!-- Two channel faders. Static. -->
	<g>
		<rect x="78" y="188" width="16" height="150" rx="8" fill="#0c1422" />
		<rect x="74" y="184" width="16" height="150" rx="8" fill="#152033" stroke="#0c1422" stroke-width="3" />
		<rect x="62" y="230" width="40" height="28" rx="5" fill="#0c1422" />
		<rect x="58" y="226" width="40" height="28" rx="5" fill="#ec3750" stroke="#0c1422" stroke-width="3" />
		<text x="78" y="358" text-anchor="middle" fill="#f6e6cf" font-family="Space Mono, monospace" font-size="13" font-weight="700">CH 1</text>
	</g>
	<g>
		<rect x="262" y="188" width="16" height="150" rx="8" fill="#0c1422" />
		<rect x="258" y="184" width="16" height="150" rx="8" fill="#152033" stroke="#0c1422" stroke-width="3" />
		<rect x="246" y="198" width="40" height="28" rx="5" fill="#0c1422" />
		<rect x="242" y="194" width="40" height="28" rx="5" fill="#e0a53c" stroke="#0c1422" stroke-width="3" />
		<text x="262" y="358" text-anchor="middle" fill="#f6e6cf" font-family="Space Mono, monospace" font-size="13" font-weight="700">CH 2</text>
	</g>

	<g>
		<rect x="400" y="64" width="110" height="250" rx="12" fill="#152033" stroke="#0c1422" stroke-width="3" />
		<text x="455" y="96" text-anchor="middle" fill="#f6e6cf" font-family="Space Mono, monospace" font-size="13" font-weight="700">CUE</text>
		<circle cx="455" cy="150" r="28" fill="#0c1422" />
		<circle cx="455" cy="146" r="28" fill="#f6e6cf" stroke="#0c1422" stroke-width="3" />
		<circle cx="455" cy="146" r="6" fill="#17171d" />
		<line x1="455" y1="146" x2="438" y2="128" stroke="#ec3750" stroke-width="3" stroke-linecap="round" />
		<text x="455" y="220" text-anchor="middle" fill="#f6e6cf" font-family="Space Mono, monospace" font-size="13" font-weight="700">GAIN</text>
		<rect x="448" y="236" width="14" height="58" rx="7" fill="#0c1422" />
		<rect x="444" y="248" width="22" height="16" rx="3" fill="#f6e6cf" stroke="#0c1422" stroke-width="2" />
	</g>

	<text x="36" y="400" fill="#f6e6cf" font-family="Space Mono, monospace" font-size="13" font-weight="700">A</text>
	<rect x="56" y="384" width="360" height="14" rx="7" fill="#0c1422" />
	<rect x="196" y="372" width="52" height="36" rx="6" fill="#0c1422" />
	<rect x="192" y="368" width="52" height="36" rx="6" fill="#f6e6cf" stroke="#0c1422" stroke-width="3" />
	<line x1="218" y1="376" x2="218" y2="396" stroke="#17171d" stroke-width="3" />
	<text x="524" y="400" text-anchor="end" fill="#f6e6cf" font-family="Space Mono, monospace" font-size="13" font-weight="700">B</text>
</svg>

<style>
	.mixer {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
</style>
