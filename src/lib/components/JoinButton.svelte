<script lang="ts">
	import { page } from '$app/state';
	import { JOIN_HREF } from '#lib/site.ts';

	let {
		size = 'md',
		label = 'Join Hackcast',
		class: className = ''
	}: {
		size?: 'sm' | 'md' | 'lg';
		label?: string;
		class?: string;
	} = $props();

	const sizes = {
		sm: 'px-3.5 py-2 text-base',
		md: 'px-5 py-2.5 text-lg',
		lg: 'px-6 py-3 text-xl'
	};

	const here = $derived(page.url.pathname === JOIN_HREF);
</script>

<a
	href={JOIN_HREF}
	class="btn {sizes[size]} {className}"
	aria-current={here ? 'page' : undefined}
>
	{label} <span aria-hidden="true">→</span>
</a>
