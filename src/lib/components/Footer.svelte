<script lang="ts">
	import { site } from '#lib/site.ts';
</script>

<footer class="site-foot">
	<div>
		<a class="word" href="/">hackcast</a>
		<p class="by">a podcast built by teens in tech · a <a href={site.hackClubUrl}>Hack Club</a> YSWS</p>
	</div>
	<nav aria-label="Footer">
		<a href="/#how">how it works</a>
		<a href="/faq">faq</a>
		<a href={site.youtubeUrl} target="_blank" rel="noopener">YouTube</a>
		<a href={site.hackClubUrl}>hackclub.com</a>
	</nav>
	<p class="by">made by Johnny</p>
</footer>
