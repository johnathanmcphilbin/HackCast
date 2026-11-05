<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import Shop from '#lib/components/Shop.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<Seo title="Shop | Hackcast" description="Spend approved HackCast hours on gear, credits, and a question on the show." />

<div class="booth">
	<Shop
		approvedSeconds={data.shop.approvedSeconds}
		availableSeconds={data.shop.availableSeconds}
		redemptions={data.shop.redemptions}
		leading={data.leading}
		unavailable={data.unavailable || data.shop.unavailable}
		hasAddress={data.shop.hasAddress}
		redeemed={data.redeemed}
		standalone
		form={'area' in (form ?? {}) && form?.area === 'shop' ? form : null}
	/>
</div>

<style>
	.booth {
		width: min(980px, calc(100% - 2rem));
		margin: 1.4rem auto 3rem;
		color: var(--text);
	}
</style>
