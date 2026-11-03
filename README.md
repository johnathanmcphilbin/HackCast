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
| `/admin/rsvps` | RSVP list for Slack IDs in `ADMIN_SLACK_IDS`, plus a CSV download and a random question draw |

`/dashboard`, `/shop` and `/leaderboard` are planned but not built. They're listed in `src/lib/site.ts` (`plannedRoutes`). Add each one as `src/routes/<name>/+page.svelte`; the shared nav and footer come from `src/routes/+layout.svelte`.

## RSVPs

Join buttons go to `/auth/login`, which redirects to Hack Club Auth (OIDC authorization code + PKCE). The callback is `/auth/callback`. After that, `/join` shows "you're on the list".

Until `HCA_CLIENT_ID`, `HCA_CLIENT_SECRET`, `SESSION_SECRET`, `DATABASE_URL`, and `PUBLIC_BASE_URL` (or `HCA_REDIRECT_URI`) are set, `/auth/login` sends people to the existing "signups opening soon" slip. The rest of the site still renders.

`HCA_REDIRECT_URI` defaults to `${PUBLIC_BASE_URL}/auth/callback`. Register that exact URL on the Hack Club Auth app. See `.env.example`.

`GET /api/rsvps/count` returns `{ "count": N }`. The landing and the success state hide the number when it is 0 or Postgres is unreachable. The count is cached for 30 seconds.

After sign-in, `/join` can take one optional question for episode 1 (Max and Zach). A save has to be non-empty and at most 280 characters. Saving again replaces the previous question. Blank and over-long saves are rejected and the stored question stays as it was.

`/admin/rsvps` lists name, email, question, and sign-up time. **Pick a random question** draws one submitted question with `crypto.randomInt` and stores it in `question_pick`, so a refresh keeps the same draw. Press it again to draw again. People who have not sent a question are left out. Zero questions leaves any previous draw untouched and tells you the hat is empty.

## Database migration

No new environment variables. The server applies the schema itself the first time that process talks to Postgres (the home page count, a sign-in, or `/admin/rsvps`).

The SQL is idempotent and safe on a database that already has rows:

- `create table if not exists rsvps`
- `alter table rsvps add column if not exists` for `email`, `question`, and the other identity columns (`create table if not exists` does not add columns to an older table)
- `create table if not exists question_pick` (one row, `id = 1`, the latest draw: who asked, the question text, and when it was pulled)

Existing rows are kept. A blank email on a later sign-in does not wipe an email already stored. Running the same statements again does not rewrite questions or the saved draw.

On Orchard, deploy the usual way: `npm run build`, then the Node service (`npm start`). There is no separate migration command and nothing new to set. After the new process is up, the next request applies the schema. Deploying the same build again is safe.

## Editing content

- **Copy and hour tiers**: `src/lib/content.ts`. The tiers are still TBC.
- **Colours**: page background is midnight blue `#1b2a41` (not the brown in the v3 mockups — changed by request). Cream panels, Hack Club red `#ec3750`, warm wood only on signs and small machine accents. Text is cream, ink, white, or red on a solid fill. No grey text.
- **Fonts**: Bungee, Archivo Black, Space Mono, Figtree, self-hosted in `static/fonts`.

## Brand assets

- `static/brand/flag.svg`: Hack Club flag.
- `static/photos/hackclubbers.jpg`: homepage photo from hackclub.com.
- Station artwork is the original hand-drawn vinyl SVG (turntables, press, mixer, VU meters).

## Deploying

The app uses `@sveltejs/adapter-node`. `npm run build` writes a Node server to `build/`. Start it with `npm start` (`node build`). It listens on `PORT` (default `3000`) and `HOST` (default `0.0.0.0`), which is what Hack Club Orchard expects. Set the variables in `.env.example` in that environment. Node 22.17 or newer (see `package.json` `engines`, `.nvmrc`, and `.node-version`). Private env vars are read when the server starts, not baked in at build time.
