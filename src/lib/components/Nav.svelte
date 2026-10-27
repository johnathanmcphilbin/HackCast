<script lang="ts">
	import { page } from '$app/state';
	import { navLinks, site } from '#lib/site.ts';
	import Logo from './Logo.svelte';
	import ScribbleButton from './ScribbleButton.svelte';

	let open = $state(false);

	// Close the mobile menu whenever the route or hash changes.
	$effect(() => {
		page.url.href;
		open = false;
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<header class="sticky top-0 z-40 border-b-3 border-pink bg-charcoal">
	<a
		href="#main"
		class="sr-only bg-teal px-4 py-2 font-bold text-charcoal focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
	>
		Skip to content
	</a>
	<nav aria-label="Main" class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2 sm:px-6">
		<a href={site.hackClubUrl} class="hidden shrink-0 self-start lg:block" aria-label="Hack Club">
			<img src={site.hackClubFlag} alt="" width="112" height="63" class="w-24" />
		</a>
		<a href="/" class="shrink-0 transition-transform hover:-rotate-3" aria-label="Hackcast home">
			<Logo class="w-16 sm:w-[4.5rem]" decorative />
		</a>

		<ul class="ml-auto hidden items-center gap-1 md:flex">
			{#each navLinks as link (link.href)}
				<li>
					<a
						href={link.href}
						class="px-3 py-2 text-lg font-bold decoration-pink decoration-wavy decoration-2 underline-offset-6 hover:text-pink hover:underline"
					>
						{link.label}
					</a>
				</li>
			{/each}
			<li class="ml-2"><ScribbleButton size="sm" /></li>
		</ul>

		<button
			type="button"
			class="ml-auto border-3 border-cream px-3 py-1 font-mono text-sm font-bold uppercase md:hidden"
			aria-expanded={open}
			aria-controls="mobile-menu"
			onclick={() => (open = !open)}
		>
			{open ? 'Close' : 'Menu'}
		</button>
	</nav>

	{#if open}
		<div id="mobile-menu" class="border-t-3 border-charcoal-2 bg-charcoal px-4 pt-2 pb-6 md:hidden">
			<ul class="flex flex-col">
				{#each navLinks as link (link.href)}
					<li>
						<a
							href={link.href}
							class="block border-b-2 border-dashed border-charcoal-2 py-3 text-2xl font-bold hover:text-pink"
							onclick={() => (open = false)}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
			<ScribbleButton class="mt-6 -ml-2" />
		</div>
	{/if}
</header>
