<script lang="ts">
	type Part = { text: string; accent?: boolean };
	type Line = { text: string; accent?: boolean; parts?: never } | { parts: Part[]; text?: never };

	let {
		as = 'h2',
		lines,
		size = 'lg',
		glitch = false,
		id,
		class: className = ''
	}: {
		as?: 'h1' | 'h2';
		lines: readonly Line[];
		size?: 'xl' | 'lg' | 'md';
		/** One short slice on the accent, home hero only. */
		glitch?: boolean;
		id?: string;
		class?: string;
	} = $props();

	function partsOf(line: Line): Part[] {
		if ('parts' in line && line.parts?.length) return line.parts;
		if ('text' in line && line.text) return [{ text: line.text, accent: line.accent }];
		return [{ text: '' }];
	}
</script>

<svelte:element this={as} {id} class="display display-{size} {className}" class:glitch>
	{#each lines as line}
		{@const parts = partsOf(line)}
		<span class="line" class:accent={parts.length === 1 && parts[0].accent}>
			{#if parts.length === 1 && !parts[0].accent}
				{parts[0].text}
			{:else if parts.length === 1 && parts[0].accent}
				{parts[0].text}
			{:else}
				{#each parts as part}
					<span class:accent={part.accent}>{part.text}</span>
				{/each}
			{/if}
		</span>
	{/each}
</svelte:element>

<style>
	.display {
		margin: 0;
		padding: 0 0.12em 0.08em 0;
	}
	.line {
		display: block;
		width: fit-content;
		max-width: 100%;
		transform: skewX(-12deg);
		color: #fff;
		font-family: 'Tektur', 'Arial Narrow', sans-serif;
		font-weight: 900;
		line-height: 0.86;
		letter-spacing: -0.03em;
		text-transform: uppercase;
		text-shadow:
			0.04em 0.045em 0 #ff2e88,
			0.075em 0.085em 0 #000;
	}
	.line.accent,
	.accent {
		color: #ff2e88;
		text-shadow:
			0.04em 0.045em 0 #2de2e6,
			0.075em 0.085em 0 #000;
	}
	.display-xl .line {
		font-size: clamp(2.35rem, 5.5vw, 5.15rem);
	}
	.display-lg .line {
		font-size: clamp(2.15rem, 4.4vw, 4.15rem);
	}
	.display-md .line {
		font-size: clamp(1.9rem, 3.6vw, 3.35rem);
	}

	/* Single glitch on the hero accent line. Static type treatment stays either way. */
	.glitch .line.accent {
		animation: slice 3.4s steps(1, end) 1;
	}
	@keyframes slice {
		0%,
		70%,
		100% {
			transform: skewX(-12deg);
		}
		74% {
			transform: skewX(-12deg) translate(-6px, 1px);
		}
		78% {
			transform: skewX(-12deg) translate(5px, -1px);
		}
		82% {
			transform: skewX(-12deg);
		}
	}
</style>
