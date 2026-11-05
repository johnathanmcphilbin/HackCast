<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const links = $derived([
		...(data.role === 'admin' ? [{ href: '/admin', label: 'overview' }] : []),
		{ href: '/admin/reviews', label: data.pending == null ? 'review queue' : `review queue (${data.pending})` },
		{ href: '/admin/questions', label: 'questions' },
		...(data.role === 'admin'
			? [
					{ href: '/admin/team', label: 'team' },
					{ href: '/admin/rsvps', label: 'rsvps' }
				]
			: [])
	]);
</script>

<nav class="admin-nav" aria-label="Admin">
	<span class="role">{data.role}</span>
	{#each links as link (link.href)}
		<a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>{link.label}</a>
	{/each}
</nav>

{@render children()}

<style>
	.admin-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.1rem;
		align-items: center;
		width: min(1120px, calc(100% - 2rem));
		margin: 1rem auto 0;
		padding: 0.6rem 0.9rem;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--shadow);
		font-weight: 800;
	}
	.admin-nav a {
		color: var(--ink);
	}
	.admin-nav a[aria-current='page'] {
		text-decoration-thickness: 3px;
	}
	.role {
		padding: 0.1rem 0.4rem;
		background: var(--red);
		color: var(--on-red);
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
	}
</style>
