<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		corner = 'cyan',
		class: className = '',
		children
	}: {
		corner?: 'cyan' | 'mag';
		class?: string;
		children: Snippet;
	} = $props();
</script>

<div class="frame {corner === 'mag' ? 'frame-mag' : ''} {className}">
	<span class="frame-c tl" aria-hidden="true"></span>
	<span class="frame-c tr" aria-hidden="true"></span>
	<span class="frame-c bl" aria-hidden="true"></span>
	<span class="frame-c br" aria-hidden="true"></span>
	{@render children()}
</div>
