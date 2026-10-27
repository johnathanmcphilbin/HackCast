<script lang="ts">
	import { page } from '$app/state';
	import { navLinks, site } from '#lib/site.ts';
	import Logo from './Logo.svelte';
	import JoinButton from './JoinButton.svelte';

	let open = $state(false);

	// Close the mobile menu whenever the route or hash changes.
	$effect(() => {
		page.url.href;
		open = false;
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<header class="sticky top-0 z-40 border-b border-cream/20 bg-charcoal">
	<div class="h-1.5 bg-pink" aria-hidden="true"></div>
	<a
		href="#main"
		class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-cream focus:px-3 focus:py-2 focus:font-bold focus:text-charcoal"
	>
		Skip to content
	</a>
	<nav aria-label="Main" class="wrap flex items-center gap-4 py-3">
		<a href={site.hackClubUrl} class="hidden shrink-0 lg:block" aria-label="Hack Club">
			<img src={site.hackClubFlag} alt="" width="112" height="63" class="w-20" />
		</a>
		<a href="/" class="shrink-0" aria-label="Hackcast home">
			<Logo class="w-12 sm:w-14" decorative />
		</a>

		<ul class="ml-auto hidden items-center gap-1 md:flex">
			{#each navLinks as link (link.href)}
				<li>
					<a
						href={link.href}
						class="px-3 py-2 font-bold hover:text-pink {page.url.pathname === link.href
							? 'text-pink underline decoration-2 underline-offset-4'
							: ''}"
						aria-current={page.url.pathname === link.href ? 'page' : undefined}
					>
						{link.label}
					</a>
				</li>
			{/each}
			<li class="ml-2"><JoinButton size="sm" /></li>
		</ul>

		<button
			type="button"
			class="ml-auto min-h-11 border-2 border-cream px-3 py-2 text-sm font-bold md:hidden"
			aria-expanded={open}
			aria-controls="mobile-menu"
			onclick={() => (open = !open)}
		>
			{open ? 'Close' : 'Menu'}
		</button>
	</nav>

	{#if open}
		<div id="mobile-menu" class="border-t border-cream/20 bg-charcoal px-5 pt-2 pb-6 md:hidden">
			<ul class="flex flex-col">
				{#each navLinks as link (link.href)}
					<li>
						<a
							href={link.href}
							class="block border-b border-cream/15 py-3 text-xl font-bold hover:text-pink"
							aria-current={page.url.pathname === link.href ? 'page' : undefined}
							onclick={() => (open = false)}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
			<JoinButton class="mt-5" />
		</div>
	{/if}
</header>
