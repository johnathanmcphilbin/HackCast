<script lang="ts">
	// height is in board units; boards are 1920 wide and default to 1080 tall.
	let { html, id, height = 1080 }: { html: string; id?: string; height?: number } = $props();
	let w = $state(1280);
</script>

<section {id} class="board" bind:clientWidth={w} style:height="{w ? (height * w) / 1920 : (height * 2) / 3}px">
	<div class="canvas" style:transform="scale({w / 1920})">
		{@html html}
	</div>
</section>
