<script lang="ts">
	// The official Hackcast logo, rendered from the supplied artwork (see static/brand/).
	import logo from '#lib/assets/hackcast-logo.png';

	let { class: className = '', decorative = false }: { class?: string; decorative?: boolean } =
		$props();
</script>

<img
	src={logo}
	alt={decorative ? '' : 'Hackcast'}
	width="1200"
	height="1078"
	class="block h-auto {className}"
/>
