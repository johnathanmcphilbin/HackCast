<script lang="ts">
	let { html, id }: { html: string; id?: string } = $props();
	let w = $state(1280);
</script>

<section {id} class="board" bind:clientWidth={w} style:height="{w ? (1080 * w) / 1920 : 720}px">
	<div class="canvas" style:transform="scale({w / 1920})">
		{@html html}
	</div>
</section>
