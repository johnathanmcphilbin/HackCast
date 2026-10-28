<script lang="ts">
	import p1 from '#lib/boards/landing-p1.html?raw';
	import p2 from '#lib/boards/landing-p2.html?raw';
	import p3 from '#lib/boards/landing-p3.html?raw';
	import p4 from '#lib/boards/landing-p4.html?raw';
	import p5 from '#lib/boards/landing-p5.html?raw';
	import p6 from '#lib/boards/landing-p6.html?raw';
	import p7 from '#lib/boards/landing-p7.html?raw';
	import Board from '#lib/components/Board.svelte';
	import PhoneHome from '#lib/components/PhoneHome.svelte';
	import Seo from '#lib/components/Seo.svelte';
</script>

<Seo />

<div class="desk">
	<Board html={p1} />
	<Board id="how" html={p2} />
	<Board id="rewards" html={p3} />
	<Board html={p4} />
	<Board id="show" html={p5} />
	<Board html={p6} />
	<Board html={p7} />
</div>
<PhoneHome />
