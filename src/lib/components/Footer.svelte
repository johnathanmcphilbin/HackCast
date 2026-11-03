<script lang="ts">
	import { JOIN_HREF, navLinks } from '#lib/site.ts';
</script>

<footer class="site-foot">
	<a class="mark" href="/">
		<img src="/brand/lockup-light.svg" alt="hackcast" width="168" height="58" />
	</a>
	<p>
		{#each navLinks as link, i (link.href)}
			<a href={link.href}>{link.label}</a>{#if i < navLinks.length - 1} · {/if}
		{/each}
		· <a href={JOIN_HREF}>join</a>
	</p>
</footer>
