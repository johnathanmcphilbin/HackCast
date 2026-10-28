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

- **Copy and hour tiers**: `src/lib/content.ts`. The tiers are still TBC.
- **Colours**: page background is midnight blue `#1b2a41` (not the brown in the v3 mockups — changed by request). Cream panels, Hack Club red `#ec3750`, warm wood only on signs and small machine accents. Text is cream, ink, white, or red on a solid fill. No grey text.
- **Fonts**: Bungee, Archivo Black, Space Mono, Figtree, self-hosted in `static/fonts`.

## Brand assets

- `static/brand/flag.svg`: Hack Club flag.
- `static/photos/hackclubbers.webp`: homepage photo from hackclub.com.
- Station artwork is the original hand-drawn vinyl SVG (turntables, press, mixer, VU meters).

## Deploying

The app uses `@sveltejs/adapter-node`. `npm run build` writes a Node server to `build/`. Start it with `npm start` (`node build`). It listens on `PORT` (default `3000`) and `HOST` (default `0.0.0.0`), which is what Hack Club Orchard expects. Set `SIGNUP_WEBHOOK_URL` (and `SIGNUP_WEBHOOK_SECRET`, if you use one) in that environment. Node 20 or newer.
