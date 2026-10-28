<script lang="ts">
	import JoinButton from '../JoinButton.svelte';
</script>

<section class="border-t border-cream/20" aria-labelledby="cta-title">
	<div class="wrap flex flex-col items-start gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-24">
		<div>
			<h2
				id="cta-title"
				class="max-w-xl text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-bold tracking-tight text-balance"
			>
				Start with a project.
			</h2>
			<p class="mt-4 max-w-md text-xl">Join, and we’ll email you how to log hours.</p>
		</div>
		<JoinButton size="lg" />
	</div>
</section>
