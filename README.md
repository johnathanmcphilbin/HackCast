# Hackcast

Signup site for **Hackcast**, a Hack Club You Ship, We Ship (YSWS) programme: build projects, earn shop rewards for approved hours, and help run a weekly podcast made by teenagers.

Built with SvelteKit, TypeScript and Tailwind CSS.

## Running it

```sh
npm install
npm run dev        # http://localhost:5173
npm run check      # type-check
npm run build      # writes a Node server to build/
npm start          # node build — PORT defaults to 3000, HOST to 0.0.0.0
```

## Routes

| Route   | What it is |
| ------- | ---------- |
| `/`     | Landing page |
| `/join` | Signup form (closed until the signup backend is connected, see below) |
| `/faq`  | Dedicated FAQ page |

`/dashboard`, `/shop` and `/leaderboard` are planned but not built. They're listed in `src/lib/site.ts` (`plannedRoutes`). Add each one as `src/routes/<name>/+page.svelte`; the shared nav and footer come from `src/routes/+layout.svelte`.

## Connecting signups

There is no signup backend yet. **The form is disabled and says so** until one is configured. It never shows a fake "you're in" screen.

All signup I/O lives in `src/lib/server/signup.ts`. By default it POSTs each signup as JSON to a webhook:

```sh
cp .env.example .env
# then set:
SIGNUP_WEBHOOK_URL=https://...      # Airtable automation, Zapier, your own API, etc.
SIGNUP_WEBHOOK_SECRET=...           # optional, sent as "Authorization: Bearer <secret>"
```

The payload is `{ name, email, slack?, building?, source, submittedAt }`. A success screen only appears after the webhook returns 2xx. If you move to a real auth provider (e.g. Hack Club login), replace `submitSignup` and `signupsOpen` in that file and leave the page alone.

## Editing content

- **Copy** (steps, episode segments, FAQ answers): `src/lib/content.ts`. FAQ answers for unfinalised rules are placeholders; update them as rules are confirmed.
- **Shop prizes**: add items to `shopPrizes` in `src/lib/content.ts` (put images in `static/`). Empty slots show as "prize photo coming soon".
- **Episode player**: set `latestEpisodeEmbed` in `src/lib/site.ts` to a YouTube/Spotify embed URL.
- **Colours and fonts**: `src/routes/layout.css`. Void `#0B0B12`, panel `#15151F`, line `#2A2A3A`. Magenta `#FF2E88` is the call-to-action fill (text on it is `#0B0B12`). Cyan `#2DE2E6` is for labels, links and HUD corners. Acid `#D4FF3A` is for status tags only. No grey text.
- **Placeholder numbers**: hour tiers, prize-wheel entries and the episode runtime live in `src/lib/content.ts`. They are not confirmed.

## Brand assets

- `static/brand/wm-nav.png`, `static/brand/wm-big.png`: wordmarks. Headings on the site are live Tektur text, not the heading PNGs.
- `static/brand/skyline.png`: original neon skyline. Do not replace it with third-party key art.
- `static/brand/hackcast-logo.svg` and `src/lib/assets/hackcast-logo.png`: the original microphone logo.
- `static/fonts/OFL.txt`: SIL Open Font License for Tektur, Chakra Petch, Space Grotesk and Space Mono.

Display headings use Tektur 900, skewed −12°. Smaller headings and buttons use Chakra Petch. Body is Space Grotesk. Labels are Space Mono.

## Deploying

The app uses `@sveltejs/adapter-node`. `npm run build` writes a Node server to `build/`. Start it with `npm start` (`node build`). It listens on `PORT` (default `3000`) and `HOST` (default `0.0.0.0`), which is what Hack Club Orchard expects. Set `SIGNUP_WEBHOOK_URL` (and `SIGNUP_WEBHOOK_SECRET`, if you use one) in that environment. Node 20 or newer.
