<script lang="ts">
	import { page } from '$app/state';
	import { JOIN_HREF, navLinks, site } from '#lib/site.ts';

	let open = $state(false);

	$effect(() => {
		page.url.pathname;
		open = false;
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<a class="skip" href="#main">Skip to content</a>

<header class="topbar">
	<a class="flag" href={site.hackClubUrl} aria-label="Hack Club">
		<img src="/brand/flag.svg" alt="" width="140" height="78" />
	</a>
	<nav aria-label="Main">
		<button type="button" class="menu" aria-expanded={open} aria-controls="mobile-menu" onclick={() => (open = !open)}>
			{open ? 'Close' : 'Menu'}
		</button>
		<ul id="mobile-menu" class:open>
			{#each navLinks as link (link.href)}
				<li>
					<a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>{link.label}</a>
				</li>
			{/each}
			<li class="join">
				<a class="redbtn" href={JOIN_HREF}>join hackcast →</a>
			</li>
		</ul>
	</nav>
</header>
