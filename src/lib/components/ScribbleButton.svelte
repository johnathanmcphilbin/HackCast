<script lang="ts">
	// Button drawn in one of the hand-made shapes ("Untitled design (3).pdf" = scribble, "Button2.pdf" = banner).
	// Three masked layers: cream offset shadow, colour fill, ink outline.
	import { JOIN_HREF } from '#lib/site.ts';
	import scribbleFill from '#lib/assets/join-button-fill.png';
	import scribbleOutline from '#lib/assets/join-button-outline.svg';
	import bannerFill from '#lib/assets/banner-button-fill.png';
	import bannerOutline from '#lib/assets/banner-button-outline.svg';

	let {
		label = 'Join Hackcast',
		href = JOIN_HREF,
		size = 'lg',
		shape = 'scribble',
		color = 'pink',
		arrow = '→',
		class: className = ''
	}: {
		label?: string;
		href?: string;
		size?: 'sm' | 'lg';
		shape?: 'scribble' | 'banner';
		color?: 'pink' | 'teal';
		arrow?: string;
		class?: string;
	} = $props();

	const shapes = {
		scribble: { fill: scribbleFill, outline: scribbleOutline },
		banner: { fill: bannerFill, outline: bannerOutline }
	};
	const sizes = {
		scribble: {
			sm: 'px-9 py-4 text-base',
			lg: 'px-12 py-7 text-2xl sm:px-16 sm:py-9 sm:text-3xl'
		},
		banner: {
			sm: 'px-11 py-3.5 text-base',
			lg: 'px-10 py-4 text-lg sm:px-12 sm:py-5 sm:text-xl'
		}
	};
	const fills = { pink: 'bg-pink', teal: 'bg-teal' };
</script>

<a
	{href}
	class="group relative inline-grid place-items-center font-bold text-charcoal no-underline {sizes[shape][size]} {className}"
	style:--fill="url({shapes[shape].fill})"
	style:--outline="url({shapes[shape].outline})"
>
	<span class="scribble absolute inset-0 translate-x-1.5 translate-y-1.5 bg-cream transition-transform duration-100 group-hover:translate-x-2.5 group-hover:translate-y-2.5 group-active:translate-0" aria-hidden="true"></span>
	<span class="absolute inset-0 transition-transform duration-100 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-1.5 group-active:translate-y-1.5" aria-hidden="true">
		<span class="scribble absolute inset-0 {fills[color]}"></span>
		<span class="scribble-outline absolute inset-0 bg-charcoal"></span>
	</span>
	<span class="relative whitespace-nowrap transition-transform duration-100 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-1.5 group-active:translate-y-1.5">
		{label}{#if arrow}&nbsp;<span aria-hidden="true">{arrow}</span>{/if}
	</span>
</a>

<style>
	.scribble,
	.scribble-outline {
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
	}
	.scribble {
		mask-image: var(--fill);
	}
	.scribble-outline {
		mask-image: var(--outline);
	}
</style>
