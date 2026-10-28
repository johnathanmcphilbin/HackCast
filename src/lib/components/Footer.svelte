<script lang="ts">
	import { JOIN_HREF, navLinks, site } from '#lib/site.ts';
</script>

<footer class="site-foot">
	<a class="word" href="/">hackcast</a>
	<p>
		a <a href={site.hackClubUrl}>Hack Club</a> YSWS ·
		{#each navLinks as link, i (link.href)}
			<a href={link.href}>{link.label}</a>{#if i < navLinks.length - 1} · {/if}
		{/each}
		· <a href={JOIN_HREF}>join</a>
	</p>
	<p class="by">made with &lt;3 by @[placeholder]</p>
</footer>
