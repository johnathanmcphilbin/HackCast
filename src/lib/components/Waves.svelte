<script lang="ts">
	// Light blue streaks falling straight down behind the site. Now and then one carries a
	// heartbeat-style pulse. Each streak starts again above the screen once it falls off the bottom.
	let canvas: HTMLCanvasElement;

	const COLOURS = ['#8fdcff', '#5cc8ff', '#b8ecff'];
	const PULSE_CHANCE = 0.18;
	// sideways offsets of the pulse, one every 6px down the streak
	const PULSE = [0, -4, 3, -14, 22, -9, 4, 0];

	type Streak = { x: number; y: number; len: number; speed: number; pulseAt: number | null; colour: string };

	function rand(min: number, max: number): number {
		return min + Math.random() * (max - min);
	}

	// y is the top of the streak; above the screen when not given
	function spawn(width: number, y?: number): Streak {
		const len = rand(120, 320);
		return {
			x: Math.round(rand(0, width)),
			y: y ?? -len,
			len,
			speed: rand(90, 220),
			pulseAt: Math.random() < PULSE_CHANCE ? rand(0.35, 0.75) * len : null,
			colour: COLOURS[Math.floor(Math.random() * COLOURS.length)]
		};
	}

	$effect(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let width = 0;
		let height = 0;
		let streaks: Streak[] = [];

		function resize() {
			const dpr = window.devicePixelRatio || 1;
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
			const count = Math.round((width * height) / 70000) + 6;
			streaks = Array.from({ length: count }, () => spawn(width, rand(-320, height)));
		}

		function draw(dt: number) {
			ctx!.clearRect(0, 0, width, height);
			ctx!.lineWidth = 2;
			ctx!.lineCap = 'round';
			ctx!.lineJoin = 'round';
			ctx!.shadowBlur = 8;
			for (const streak of streaks) {
				streak.y += streak.speed * dt;
				if (streak.y > height) Object.assign(streak, spawn(width));
				const { x, y, len, pulseAt, colour } = streak;
				// faded tail at the top, brightest at the leading edge
				const fade = ctx!.createLinearGradient(0, y, 0, y + len);
				fade.addColorStop(0, 'rgba(143, 220, 255, 0)');
				fade.addColorStop(1, colour);
				ctx!.beginPath();
				ctx!.moveTo(x, y);
				if (pulseAt !== null) {
					PULSE.forEach((dx, i) => ctx!.lineTo(x + dx, y + pulseAt + i * 6));
				}
				ctx!.lineTo(x, y + len);
				ctx!.strokeStyle = fade;
				ctx!.shadowColor = colour;
				ctx!.globalAlpha = 0.6;
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
