<script lang="ts">
	import './layout.css';
	import Nav from '#lib/components/Nav.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
	<link rel="icon" type="image/png" sizes="48x48" href="/icon-48.png" />
	<link rel="icon" type="image/png" sizes="64x64" href="/icon-64.png" />
	<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<meta name="theme-color" content="#1b2a41" />
</svelte:head>

<Nav />
<main id="main">
	{@render children()}
</main>
<Footer />
