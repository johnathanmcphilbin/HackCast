<script lang="ts">
	import { navLinks, site, JOIN_HREF } from '#lib/site.ts';
	import Logo from './Logo.svelte';
</script>

<footer class="border-t-3 border-pink bg-charcoal">
	<div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[auto_1fr_auto] md:items-center">
		<Logo class="w-28 -rotate-6" decorative />

		<div>
			<p class="text-xl font-bold">
				Hackcast is a <a href={site.hackClubUrl} class="text-pink underline decoration-2 underline-offset-4">Hack Club</a>
				You Ship, We Ship programme.
			</p>
			<p class="mt-2 text-cream/70">
				Made by teenagers, for teenagers. Hack Club is a 501(c)(3) nonprofit.
			</p>
		</div>

		<ul class="flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm font-bold uppercase">
			{#each navLinks as link (link.href)}
				<li><a href={link.href} class="hover:text-pink">{link.label}</a></li>
			{/each}
			<li><a href={JOIN_HREF} class="text-pink hover:underline">Join</a></li>
		</ul>
	</div>

	<a
		href={site.hackClubUrl}
		class="group flex items-center justify-center gap-3 border-t-3 border-charcoal-2 py-4"
	>
		<img src={site.hackClubFlag} alt="" width="112" height="63" class="w-16 transition-transform group-hover:-rotate-6" />
		<span class="label text-cream/80 group-hover:text-cream">A Hack Club project</span>
	</a>
</footer>
