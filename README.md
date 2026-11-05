# Hackcast

Site for **Hackcast**, a Hack Club You Ship, We Ship (YSWS) programme: sign in, connect Hackatime, link a project, and ship.

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
| `/`     | Landing page. **Start Now** begins sign-in. |
| `/auth/login` | Starts Hack Club Auth. After it succeeds, Hackatime OAuth starts immediately if it is not already linked. |
| `/auth/callback` | Hack Club Auth only. Not the Hackatime callback. |
| `/auth/hackatime` | Starts Hackatime OAuth. Authorize `redirect_uri` is `/auth/hackatime/callback`. |
| `/onboarding` | Pick or name the Hackatime project linked to HackCast. |
| `/join` | Old link. Redirects into the same Start Now sign-in. |
| `/faq`  | Dedicated FAQ page |
| `/dashboard` | Signed-in booth: HackCast-linked projects, hours, submit. |
| `/submit` | Signed-in. The submission is an Airtable embed, not a form we own. |
| `/admin/rsvps` | Older RSVP list for Slack IDs in `ADMIN_SLACK_IDS`, plus a CSV download. Not shown on the public site. |

`/shop` and `/leaderboard` are planned but not built. They're listed in `src/lib/site.ts` (`plannedRoutes`).

## Sign-in

**Start Now** goes to `/auth/login` (Hack Club Auth, authorization code + PKCE). The Hack Club Auth callback is `/auth/callback`. It still writes the `users` row and the existing `rsvps` row. It does not send people back to a waitlist popup.

If Hackatime is not linked, that same callback redirects straight to `/auth/hackatime?next=/onboarding`, which starts Hackatime OAuth before the dashboard. After Hackatime connects, `/onboarding` asks them to pick a Hackatime project or type a new name and stores it in `hackcast_projects` as the HackCast-linked project. Someone who already has Hackatime and a linked project lands on `/dashboard`.

Until `HCA_CLIENT_ID`, `HCA_CLIENT_SECRET`, `SESSION_SECRET`, `DATABASE_URL`, and `PUBLIC_BASE_URL` (or `HCA_REDIRECT_URI`) are set, `/auth/login` sends people to `/?rsvp=soon`. A failed sign-in lands on `/?rsvp=error`.

`HCA_REDIRECT_URI` defaults to `${PUBLIC_BASE_URL}/auth/callback`. Register that exact URL on the **Hack Club Auth** app only. See `.env.example`.

## Hackatime

`/auth/hackatime` sends the signed-in user to Hackatime's authorization code flow. `/auth/hackatime/callback` stores the tokens in `hackatime_connections`. Tokens stay on the server. Scopes are `profile` and `read`. Do not request `admin`.

The authorize request's `redirect_uri` is always `${origin}/auth/hackatime/callback`. It is not `/auth/callback`. If `PUBLIC_BASE_URL` was set to the Hack Club Auth callback URL, the path is stripped and the Hackatime callback is still used.

Register this exact redirect URI on the **Hackatime** OAuth app:

```
https://hackcast.hackclub.com/auth/hackatime/callback
```

Also register `http://localhost:5173/auth/hackatime/callback` for local dev. Do not register `https://hackcast.hackclub.com/auth/callback` on the Hackatime app. Hackatime reports that as a malformed or mismatched redirect URI.

Orchard already needs `HACKATIME_CLIENT_ID`, `HACKATIME_CLIENT_SECRET`, and `PUBLIC_BASE_URL=https://hackcast.hackclub.com` (origin only, no path). `PUBLIC_HACKATIME_OAUTH_UID` is another name for the client id. No new env vars. Leave `PUBLIC_BASE_URL` unset for `npm run dev` and the callback is `http://localhost:5173/auth/hackatime/callback`.

Tables are created on first use, including `hackcast_projects`. The old `rsvps` table is unchanged. Nothing here approves hours or runs the shop.

## Submitting

`/submit` requires a Hack Club Auth session. The page embeds Airtable's form and does not collect the submission itself:

`https://airtable.com/embed/app5wPp2jEV7ZkTBB/pagbrjBbfwF27K7BE/form`

`GET /api/rsvps/count` still returns `{ "count": N }` for the old RSVP table. The public site does not show that count. It is cached for 30 seconds.

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
