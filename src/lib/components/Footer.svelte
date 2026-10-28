<script lang="ts">
	import { navLinks, site, JOIN_HREF } from '#lib/site.ts';
	import logo from '#lib/assets/hackcast-logo.png';

	const links = [...navLinks, { href: JOIN_HREF, label: 'Join' }];
</script>

<footer class="foot">
	<div class="inner">
		<img src={logo} alt="" width="120" height="108" class="mark" />
		<p>
			Hackcast is a <a href={site.hackClubUrl}>Hack Club</a> You Ship, We Ship programme. Made by teenagers, for teenagers.
			Hack Club is a 501(c)(3) nonprofit.
		</p>
		<ul>
			{#each links as link (link.href)}
				<li><a href={link.href}>{link.label}</a></li>
			{/each}
		</ul>
	</div>
</footer>

<style>
	.foot {
		padding: 0 var(--gutter) 1.5rem;
	}
	.inner {
		display: grid;
		gap: 1rem;
		align-items: center;
		padding: 1.1rem 1rem;
		border: 1px solid var(--line);
	}
	.mark {
		width: 52px;
		height: auto;
	}
	p {
		margin: 0;
		max-width: 46ch;
		color: #fff;
		font-family: 'Space Mono', monospace;
		font-size: 0.72rem;
		line-height: 1.55;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	a {
		color: var(--cyan);
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 0.9rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	ul a {
		color: var(--cyan);
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-decoration: none;
		text-transform: uppercase;
	}
	ul a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	@media (min-width: 800px) {
		.inner {
			grid-template-columns: auto 1fr auto;
			gap: 1.25rem;
			padding: 1rem 1.25rem;
		}
	}
</style>
