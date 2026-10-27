<script lang="ts">
	// Hand-drawn SVG marks: underlines, arrows, stars and sparkles.
	let {
		kind,
		class: className = ''
	}: {
		kind: 'squiggle' | 'underline' | 'arrow' | 'arrow-down' | 'star' | 'sparkle' | 'circle';
		class?: string;
	} = $props();
</script>

{#if kind === 'squiggle'}
	<svg class={className} viewBox="0 0 300 24" fill="none" aria-hidden="true" preserveAspectRatio="none">
		<path
			d="M3 14c18-10 30-10 42 0s26 10 40 0 28-11 42-1 28 10 41 0 29-10 43 0 27 9 40 0 25-8 46 1"
			stroke="currentColor"
			stroke-width="5"
			stroke-linecap="round"
		/>
	</svg>
{:else if kind === 'underline'}
	<svg class={className} viewBox="0 0 300 20" fill="none" aria-hidden="true" preserveAspectRatio="none">
		<path d="M4 13c60-7 150-11 290-6" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
		<path d="M30 17c70-4 140-5 230-2" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
	</svg>
{:else if kind === 'arrow'}
	<svg class={className} viewBox="0 0 120 80" fill="none" aria-hidden="true">
		<path
			d="M6 10c22 4 50 14 66 30s26 28 32 34"
			stroke="currentColor"
			stroke-width="4"
			stroke-linecap="round"
		/>
		<path d="M82 70l22 5-3-23" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{:else if kind === 'arrow-down'}
	<svg class={className} viewBox="0 0 60 110" fill="none" aria-hidden="true">
		<path
			d="M30 4c-12 20 14 30 2 52s-6 30-2 46"
			stroke="currentColor"
			stroke-width="4"
			stroke-linecap="round"
		/>
		<path d="M14 86l16 18 14-20" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{:else if kind === 'star'}
	<svg class={className} viewBox="0 0 100 100" aria-hidden="true">
		<path
			d="M50 4l11 30 33 2-26 20 9 32-27-18-27 18 9-32L6 36l33-2z"
			fill="currentColor"
			stroke="var(--color-charcoal)"
			stroke-width="4"
			stroke-linejoin="round"
		/>
	</svg>
{:else if kind === 'sparkle'}
	<svg class={className} viewBox="0 0 60 60" aria-hidden="true">
		<path d="M30 2c3 18 10 25 28 28-18 3-25 10-28 28-3-18-10-25-28-28 18-3 25-10 28-28z" fill="currentColor" />
	</svg>
{:else if kind === 'circle'}
	<svg class={className} viewBox="0 0 200 100" fill="none" aria-hidden="true" preserveAspectRatio="none">
		<path
			d="M150 12C110 0 30 6 10 40s40 56 110 52 80-30 70-56S120 4 70 10"
			stroke="currentColor"
			stroke-width="4"
			stroke-linecap="round"
		/>
	</svg>
{/if}
