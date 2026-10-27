<script lang="ts">
	import type { Snippet } from 'svelte';

	let { id, class: className = '', children }: { id: string; class?: string; children: Snippet } = $props();
</script>

<h2 {id} class="text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] font-bold tracking-tight {className}">
	{@render children()}
</h2>
