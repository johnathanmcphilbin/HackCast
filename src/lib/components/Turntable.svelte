<svg class="deck" viewBox="0 0 480 460" role="img" aria-label="Hackcast record spinning on a turntable">
	<rect x="22" y="26" width="440" height="412" rx="22" fill="#0c1422" />
	<rect x="10" y="10" width="440" height="412" rx="22" fill="#243656" stroke="#0c1422" stroke-width="3" />
	<circle cx="210" cy="214" r="176" fill="#0c1422" />
	<g class="spin" style="transform-origin: 202px 206px">
		<circle cx="202" cy="206" r="176" fill="#c9b8a3" stroke="#0c1422" stroke-width="4" />
		{#each Array.from({ length: 48 }) as _, i}
			<circle
				cx={202 + 164 * Math.cos((i / 48) * Math.PI * 2)}
				cy={206 + 164 * Math.sin((i / 48) * Math.PI * 2)}
				r="2.2"
				fill="#0c1422"
			/>
		{/each}
		<circle cx="202" cy="206" r="150" fill="#152033" stroke="#0c1422" stroke-width="3" />
		<circle cx="202" cy="206" r="142" fill="#10151c" stroke="#0c1422" stroke-width="3" />
		{#each Array.from({ length: 11 }) as _, i}
			<circle
				cx="202"
				cy="206"
				r={62 + i * 7}
				fill="none"
				stroke={i % 4 === 0 ? '#4d6280' : '#2a3b52'}
				stroke-width={i % 4 === 0 ? 2.3 : 1.25}
			/>
		{/each}
		<circle cx="202" cy="206" r="54" fill="#ec3750" stroke="#0c1422" stroke-width="3" />
		<text x="202" y="200" text-anchor="middle" fill="#ffffff" font-family="Bungee, sans-serif" font-size="18">HACK</text>
		<text x="202" y="220" text-anchor="middle" fill="#ffffff" font-family="Bungee, sans-serif" font-size="18">CAST</text>
		<circle cx="202" cy="206" r="5.5" fill="#f6e6cf" stroke="#0c1422" stroke-width="2" />
	</g>
	<path d="M392 78 L330 150 L268 168" fill="none" stroke="#0c1422" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
	<path d="M392 78 L330 150 L268 168" fill="none" stroke="#c9b8a3" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
	<circle cx="396" cy="84" r="26" fill="#0c1422" />
	<circle cx="392" cy="78" r="26" fill="#c9b8a3" stroke="#0c1422" stroke-width="3" />
	<circle cx="392" cy="78" r="9" fill="#e0a53c" stroke="#0c1422" stroke-width="2" />
	<rect x="236" y="154" width="46" height="20" rx="3" fill="#ec3750" stroke="#0c1422" stroke-width="3" transform="rotate(16 259 164)" />
	<circle cx="262" cy="170" r="3.5" fill="#f6e6cf" stroke="#0c1422" stroke-width="1.5" />
	<text x="392" y="390" text-anchor="middle" fill="#f6e6cf" font-family="Space Mono, monospace" font-size="16" font-weight="700">45 RPM</text>
</svg>

<style>
	.deck {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
</style>
