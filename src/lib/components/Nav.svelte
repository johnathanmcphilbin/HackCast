<script lang="ts">
	import { page } from '$app/state';
	import { navLinks, site, JOIN_HREF } from '#lib/site.ts';

	let open = $state(false);
	let active = $state('');

	$effect(() => {
		page.url.href;
		open = false;
	});

	$effect(() => {
		if (page.url.pathname !== '/') {
			active = '';
			return;
		}
		const ids = ['how-it-works', 'rewards'];
		const nodes = ids
			.map((id) => document.getElementById(id))
			.filter((node): node is HTMLElement => Boolean(node));
		if (!nodes.length) return;
		const seen = new IntersectionObserver(
			(entries) => {
				const hit = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
				if (hit) active = hit.target.id;
			},
			{ rootMargin: '-45% 0px -45% 0px', threshold: [0.1, 0.3, 0.6] }
		);
		for (const node of nodes) seen.observe(node);
		return () => seen.disconnect();
	});

	function current(href: string) {
		if (href === '/faq') return page.url.pathname === '/faq';
		if (href.startsWith('/#')) return page.url.pathname === '/' && active === href.slice(2);
		return false;
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<a class="skip" href="#main">Skip to content</a>

<header class="bar">
	<a href="/" class="brand" aria-label="{site.name} home">
		<img src="/brand/wm-nav.png" alt="" width="612" height="103" />
	</a>

	<nav aria-label="Main" class="links">
		<ul>
			{#each navLinks as link (link.href)}
				<li>
					<a href={link.href} aria-current={current(link.href) ? 'page' : undefined}>{link.label}</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="end">
		<a class="btn-hit btn-primary nav-join" href={JOIN_HREF} aria-current={page.url.pathname === '/join' ? 'page' : undefined}>
			<span class="btn-face">Join <span aria-hidden="true">→</span></span>
		</a>
		<button
			type="button"
			class="menu"
			aria-expanded={open}
			aria-controls="mobile-menu"
			onclick={() => (open = !open)}
		>
			{open ? 'Close' : 'Menu'}
		</button>
	</div>
</header>

{#if open}
	<div id="mobile-menu" class="sheet">
		<ul>
			{#each navLinks as link (link.href)}
				<li>
					<a href={link.href} onclick={() => (open = false)}>{link.label}</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.bar {
		position: sticky;
		top: 0;
		z-index: 40;
		display: flex;
		align-items: stretch;
		margin: 0.75rem var(--gutter) 0;
		border: 1px solid var(--line);
		background: var(--void);
	}
	.brand {
		display: flex;
		align-items: center;
		padding: 0.7rem 0.9rem;
		border-right: 1px solid var(--line);
	}
	.brand img {
		display: block;
		width: auto;
		height: 22px;
	}
	.links {
		display: none;
		flex: 1;
		align-items: center;
	}
	.links ul {
		display: flex;
		gap: 0.25rem 1.35rem;
		margin: 0;
		padding: 0 1.1rem;
		list-style: none;
	}
	.links a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-decoration: none;
		text-transform: uppercase;
	}
	.links a:hover,
	.links a[aria-current='page'] {
		color: var(--cyan);
	}
	.links a[aria-current='page'] {
		box-shadow: inset 0 -2px 0 var(--cyan);
	}
	.end {
		display: flex;
		align-items: center;
		margin-left: auto;
		border-left: 1px solid var(--line);
	}
	.nav-join .btn-face {
		min-height: 36px;
		padding: 0.45rem 0.75rem;
		font-size: 0.85rem;
	}
	.nav-join {
		margin: 0.45rem 0.55rem;
	}
	.menu {
		min-width: 44px;
		min-height: 44px;
		margin-right: 0.35rem;
		padding: 0 0.7rem;
		border: 0;
		background: transparent;
		color: var(--cyan);
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		cursor: pointer;
	}
	.sheet {
		margin: 0 var(--gutter);
		border: 1px solid var(--line);
		border-top: 0;
		background: var(--void);
	}
	.sheet ul {
		margin: 0;
		padding: 0.25rem 0.2rem 0.6rem;
		list-style: none;
	}
	.sheet a {
		display: flex;
		align-items: center;
		min-height: 48px;
		padding: 0 0.8rem;
		border-bottom: 1px solid var(--line);
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.85rem;
		letter-spacing: 0.12em;
		text-decoration: none;
		text-transform: uppercase;
	}
	.sheet a:hover {
		color: var(--cyan);
	}
	@media (min-width: 800px) {
		.links {
			display: flex;
		}
		.menu {
			display: none;
		}
		.brand img {
			height: 26px;
		}
	}
</style>
