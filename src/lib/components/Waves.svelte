<script lang="ts">
	// Faint vertical sound waves falling down behind the site. Each wave gets a random spot, width,
	// pitch and speed, and starts again above the screen once it falls off the bottom.
	let canvas: HTMLCanvasElement;

	const COLOURS = ['#8fdcff', '#5cc8ff', '#b8ecff'];

	type Wave = { x: number; y: number; len: number; amp: number; freq: number; speed: number; phase: number; colour: string };

	function rand(min: number, max: number): number {
		return min + Math.random() * (max - min);
	}

	// y is the top of the wave; above the screen when not given
	function spawn(width: number, y?: number): Wave {
		const len = rand(140, 380);
		return {
			x: rand(0, width),
			y: y ?? -len,
			len,
			amp: rand(4, 14),
			freq: rand(0.02, 0.07),
			speed: rand(60, 180),
			phase: rand(0, Math.PI * 2),
			colour: COLOURS[Math.floor(Math.random() * COLOURS.length)]
		};
	}

	$effect(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let width = 0;
		let height = 0;
		let waves: Wave[] = [];

		function resize() {
			const dpr = window.devicePixelRatio || 1;
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
			const count = Math.round((width * height) / 70000) + 6;
			waves = Array.from({ length: count }, () => spawn(width, rand(-380, height)));
		}

		function draw(dt: number) {
			ctx!.clearRect(0, 0, width, height);
			for (const wave of waves) {
				wave.y += wave.speed * dt;
				wave.phase += dt * 3;
				if (wave.y > height) Object.assign(wave, spawn(width));
				ctx!.beginPath();
				for (let i = 0; i <= wave.len; i += 4) {
					// taper the ends so each wave fades in and out
					const taper = Math.sin((i / wave.len) * Math.PI);
					const x = wave.x + Math.sin(i * wave.freq + wave.phase) * wave.amp * taper;
					if (i === 0) ctx!.moveTo(x, wave.y + i);
					else ctx!.lineTo(x, wave.y + i);
				}
				ctx!.strokeStyle = wave.colour;
				ctx!.globalAlpha = 0.45;
				ctx!.lineWidth = 2.5;
				ctx!.lineCap = 'round';
				ctx!.shadowColor = wave.colour;
				ctx!.shadowBlur = 8;
				ctx!.stroke();
			}
			ctx!.globalAlpha = 1;
		}

		function onResize() {
			resize();
			if (still) draw(0);
		}

		resize();
		window.addEventListener('resize', onResize);
		let frame = 0;
		let last = performance.now();
		function tick(now: number) {
			draw(Math.min((now - last) / 1000, 0.1));
			last = now;
			frame = requestAnimationFrame(tick);
		}
		if (still) draw(0);
		else frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<canvas bind:this={canvas} class="waves" aria-hidden="true"></canvas>

<style>
	.waves {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		pointer-events: none;
	}
</style>
