<script lang="ts">
	import { JOIN_HREF } from '#lib/site.ts';

	let {
		size = 'md',
		variant = 'pink',
		label = 'Join Hackcast',
		class: className = ''
	}: {
		size?: 'sm' | 'md' | 'lg';
		variant?: 'pink' | 'dark';
		label?: string;
		class?: string;
	} = $props();

	const sizes = {
		sm: '!px-4 !py-2 !text-base',
		md: '',
		lg: '!px-8 !py-4 !text-2xl sm:!text-3xl'
	};
</script>

<a href={JOIN_HREF} class="btn {variant === 'dark' ? 'btn-dark' : ''} {sizes[size]} {className}">
	{label} <span aria-hidden="true">→</span>
</a>
