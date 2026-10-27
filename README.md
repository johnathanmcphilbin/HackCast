# Hackcast

Signup site for **Hackcast**, a Hack Club You Ship, We Ship (YSWS) programme: build projects, earn shop rewards for approved hours, and help run a weekly podcast made by teenagers.

Built with SvelteKit, TypeScript and Tailwind CSS.

## Running it

```sh
npm install
npm run dev        # http://localhost:5173
npm run check      # type-check
npm run build
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
- **Colours and fonts**: `@theme` block in `src/routes/layout.css`.

## Brand assets

- `src/lib/assets/hackcast-logo.png`: the logo used on the site, rendered from the supplied `Hack Cast.pdf`.
- `static/brand/hackcast-logo.svg`: vector version of the same artwork.
- `static/og.png`, `static/icon-512.png`, `static/apple-touch-icon.png`: social card and icons.

Headings and body use Phantom Sans, Hack Club's typeface, loaded from Hack Club's asset CDN. Handwritten notes use Permanent Marker and tape-deck labels use Space Mono (both from Google Fonts).

## Deploying

`adapter-auto` is installed. Swap it in `vite.config.ts` for your host's adapter (e.g. `@sveltejs/adapter-vercel` or `adapter-node`) and set the env vars above there.
