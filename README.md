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
| `/auth/login` | Starts Hack Club Auth. Falls back to `/join` when auth is not configured. |
| `/join` | "Opening soon", or "you're on the list" after a Hack Club Auth RSVP |
| `/faq`  | Dedicated FAQ page |
| `/admin/rsvps` | RSVP list for Slack IDs in `ADMIN_SLACK_IDS`, plus a CSV download |

`/dashboard`, `/shop` and `/leaderboard` are planned but not built. They're listed in `src/lib/site.ts` (`plannedRoutes`). Add each one as `src/routes/<name>/+page.svelte`; the shared nav and footer come from `src/routes/+layout.svelte`.

## RSVPs

Join buttons go to `/auth/login`, which redirects to Hack Club Auth (OIDC authorization code + PKCE). The callback is `/auth/callback`. After that, `/join` shows "you're on the list".

Until `HCA_CLIENT_ID`, `HCA_CLIENT_SECRET`, `SESSION_SECRET`, `DATABASE_URL`, and `PUBLIC_BASE_URL` (or `HCA_REDIRECT_URI`) are set, `/auth/login` sends people to the existing "signups opening soon" slip. The rest of the site still renders.

`HCA_REDIRECT_URI` defaults to `${PUBLIC_BASE_URL}/auth/callback`. Register that exact URL on the Hack Club Auth app. See `.env.example`.

`GET /api/rsvps/count` returns `{ "count": N }`. The landing and the success state hide the number when it is 0 or Postgres is unreachable. The count is cached for 30 seconds.

## Editing content

- **Copy and hour tiers**: `src/lib/content.ts`. The tiers are still TBC.
- **Colours**: page background is midnight blue `#1b2a41` (not the brown in the v3 mockups — changed by request). Cream panels, Hack Club red `#ec3750`, warm wood only on signs and small machine accents. Text is cream, ink, white, or red on a solid fill. No grey text.
- **Fonts**: Bungee, Archivo Black, Space Mono, Figtree, self-hosted in `static/fonts`.

## Brand assets

- `static/brand/flag.svg`: Hack Club flag.
- `static/photos/hackclubbers.webp`: homepage photo from hackclub.com.
- Station artwork is the original hand-drawn vinyl SVG (turntables, press, mixer, VU meters).

## Deploying

The app uses `@sveltejs/adapter-node`. `npm run build` writes a Node server to `build/`. Start it with `npm start` (`node build`). It listens on `PORT` (default `3000`) and `HOST` (default `0.0.0.0`), which is what Hack Club Orchard expects. Set the variables in `.env.example` in that environment. Node 22.17 or newer (see `package.json` `engines`, `.nvmrc`, and `.node-version`). Private env vars are read when the server starts, not baked in at build time.
