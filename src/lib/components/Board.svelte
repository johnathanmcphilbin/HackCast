<script lang="ts">
	let { html, id }: { html: string; id?: string } = $props();
	let w = $state(1280);
	let node = $state<HTMLElement | null>(null);

	$effect(() => {
		const el = node;
		if (!el) return;
		const watch = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) el.classList.add('drawn');
			},
			{ threshold: 0.2 }
		);
		watch.observe(el);
		return () => watch.disconnect();
	});
</script>

<section {id} class="board" bind:this={node} bind:clientWidth={w} style:height="{w ? (1080 * w) / 1920 : 720}px">
	<div class="canvas" style:transform="scale({w / 1920})">
		{@html html}
	</div>
</section>
