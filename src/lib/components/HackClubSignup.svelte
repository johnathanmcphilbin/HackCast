<script lang="ts">
	import { site } from '#lib/site.ts';

	let { tone = 'cream' }: { tone?: 'cream' | 'ink' } = $props();
</script>

<p class="note {tone}">
	New to Hack Club? <a href={site.hackClubSignupUrl}>Sign up here</a>
</p>

<style>
	.note {
		margin: 0.75rem 0 0;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.45;
	}
	.cream {
		color: var(--cream);
	}
	.ink {
		color: var(--ink);
	}
	a {
		color: inherit;
		font-weight: 800;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
