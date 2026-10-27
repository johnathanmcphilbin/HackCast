<script lang="ts">
	import Logo from '../Logo.svelte';
	import ScribbleButton from '../ScribbleButton.svelte';
	import Doodle from '../Doodle.svelte';
	import LevelMeter from '../LevelMeter.svelte';
	import runTheShow from '#lib/assets/run-the-show.svg';
</script>

<section class="relative flex min-h-[calc(100svh-5.25rem)] items-center overflow-hidden" aria-labelledby="hero-title">
	<div
		class="mx-auto grid w-full max-w-6xl items-center gap-y-6 px-4 py-6 sm:gap-y-10 sm:px-6 sm:py-12 lg:grid-cols-[1.45fr_1fr] lg:gap-x-10"
	>
		<!-- Logo + stickers. First on mobile so the brand lands immediately. -->
		<div class="relative mx-auto mt-6 mb-6 w-full max-w-[16rem] sm:mb-8 sm:max-w-md lg:order-2 lg:my-0 lg:max-w-none">
			<Logo class="relative z-10 mx-auto w-[80%] rotate-3 transition-transform duration-300 hover:rotate-0" />

			<div class="absolute -top-9 -left-3 z-20 -rotate-[8deg]">
				<ScribbleButton shape="banner" color="teal" size="sm" href="#rewards" label="Shop rewards" arrow="↓" class="sm:!text-lg" />
			</div>
			<div class="absolute right-0 -bottom-12 z-20 rotate-[6deg]">
				<ScribbleButton shape="banner" color="pink" size="sm" href="#about" label="New ep. every week" arrow="↓" class="!px-12 sm:!px-14 sm:!text-lg" />
			</div>
			<Doodle kind="star" class="absolute top-[-6%] right-[6%] w-12 rotate-12 text-pink sm:w-16" />
			<Doodle kind="sparkle" class="absolute bottom-[8%] left-[4%] w-7 text-teal" />

			<LevelMeter class="relative z-0 mx-auto -mt-4 w-[86%]" />
		</div>

		<div class="lg:order-1">
			<h1 id="hero-title">
				<span class="sr-only">Build stuff. Get rewarded. Run the show.</span>
				<img
					src={runTheShow}
					alt=""
					width="180"
					height="121"
					class="-ml-2 block h-auto w-[min(100%,15.5rem)] -rotate-2 sm:w-[min(100%,34rem)]"
				/>
			</h1>

			<p class="mt-6 max-w-xl text-lg leading-snug text-cream/90 sm:mt-8 sm:text-2xl">
				Hackcast is a weekly podcast powered by the things you build. Make projects, earn rewards,
				submit questions, and help decide what happens on the show.
			</p>

			<div class="relative mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 sm:mt-10">
				<ScribbleButton class="-ml-3" />
				<a href="#how-it-works" class="font-bold text-cream/80 underline decoration-teal decoration-2 underline-offset-4 hover:text-cream">
					How does it work?
				</a>
			</div>
		</div>
	</div>
</section>
