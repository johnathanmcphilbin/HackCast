<script lang="ts">
	import art from './on-air-bubbles.svg?raw';
</script>

<div class="on-air">
	{@html art}
</div>

<style>
	.on-air {
		width: 100%;
	}
	.on-air :global(svg) {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
</style>
