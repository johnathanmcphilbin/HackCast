<script lang="ts">
	import { page } from '$app/state';
	import { START_HREF, navLinks, site } from '#lib/site.ts';

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
			{#if page.data.firstName}
				<li>
					<a href="/dashboard" aria-current={page.url.pathname === '/dashboard' ? 'page' : undefined}>dashboard</a>
				</li>
				<li>
					<a href="/shop" aria-current={page.url.pathname === '/shop' ? 'page' : undefined}>shop</a>
				</li>
			{/if}
			{#if page.data.staff}
				<li>
					<a
						href={page.data.staff === 'admin' ? '/admin' : '/admin/reviews'}
						aria-current={page.url.pathname.startsWith('/admin') ? 'page' : undefined}>admin</a
					>
				</li>
			{/if}
			<li class="join">
				{#if page.data.firstName}
					<span class="redbtn">hello, {page.data.firstName}</span>
				{:else}
					<a class="redbtn" href={START_HREF}>Start Now</a>
				{/if}
			</li>
		</ul>
	</nav>
</header>
