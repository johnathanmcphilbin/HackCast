<script lang="ts">
	import { page } from '$app/state';
	import { site } from '#lib/site.ts';

	let {
		title = `${site.name} | ${site.tagline}`,
		description = site.description
	}: { title?: string; description?: string } = $props();

	const url = $derived(page.url.origin + page.url.pathname);
	const image = $derived(page.url.origin + site.ogImage);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Hackcast. Build stuff, log hours, get on a teen podcast." />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
</svelte:head>
