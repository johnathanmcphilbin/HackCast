<script lang="ts">
	import { page } from '$app/state';
	import { navLinks, site, JOIN_HREF } from '#lib/site.ts';
	import Logo from './Logo.svelte';
</script>

<footer class="border-t border-cream/20">
	<div class="wrap flex flex-col gap-10 py-12 sm:flex-row sm:items-start sm:justify-between">
		<div class="flex items-center gap-4">
			<a href="/" aria-label="Hackcast home">
				<Logo class="w-16" decorative />
			</a>
			<p class="max-w-xs text-sm leading-relaxed">
				A weekly podcast by teenagers.
				<a href={site.hackClubUrl} class="font-bold underline decoration-2 underline-offset-4 hover:text-pink">
					Hack Club
				</a>
				You Ship, We Ship. Hack Club is a 501(c)(3) nonprofit.
			</p>
		</div>

		<ul class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
			{#each navLinks as link (link.href)}
				<li>
					<a
						href={link.href}
						class="underline decoration-transparent underline-offset-4 hover:text-pink hover:decoration-current"
						aria-current={page.url.pathname === link.href ? 'page' : undefined}
					>
						{link.label}
					</a>
				</li>
			{/each}
			<li>
				<a href={JOIN_HREF} class="text-pink underline decoration-2 underline-offset-4">Join</a>
			</li>
		</ul>
	</div>

	<div class="border-t border-cream/15">
		<a href={site.hackClubUrl} class="wrap flex items-center gap-3 py-4 text-sm font-bold hover:text-pink">
			<img src={site.hackClubFlag} alt="" width="112" height="63" class="w-12" />
			A Hack Club project
		</a>
	</div>
</footer>
