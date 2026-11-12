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
| `/onboarding` | Old link. Redirects to the dashboard. |
| `/join` | Old link. Redirects into the same Start Now sign-in. |
| `/faq`  | Dedicated FAQ page |
| `/dashboard` | Signed-in. A popup names the HackCast project, then links one of the last 5 Hackatime projects they worked on. Then: the next guest, their project's hours, questions for the guest, the hours race, and submit. |
| `/submit` | Signed-in. Sends a HackCast project into the review queue. |
| `/admin` | Admins only. Live Hackatime activity, sign-up funnel, review speed, hours, countries and charts. |
| `/admin/reviews` | Reviewers and admins. The queue, approved-but-unsent submissions, and recent decisions. |
| `/admin/reviews/[id]` | One submission, with the builder's email: approve with hours and a written justification, ask for changes, or reject. Admins can move a rejection back. |
| `/admin/questions` | Reviewers and admins. Questions for the next guest, askers with the most hours first. |
| `/admin/guests` | Admins only. Guest votes for the next open episode (`guestVoteEpisode` in `src/lib/content.ts`): one HQ and one outside vote per person, spellings of the same name matched into one tally. Shortlist or dismiss each name, plus the raw votes as typed. |
| `/admin/team` | Admins only. Add or remove reviewers and admins by Hack Club email. |
| `/admin/rsvps` | Admins only. Older RSVP list plus a CSV download. |

`/shop` and `/leaderboard` are planned but not built. They're listed in `src/lib/site.ts` (`plannedRoutes`).

## Sign-in

**Start Now** goes to `/auth/login` (Hack Club Auth, authorization code + PKCE). The Hack Club Auth callback is `/auth/callback`. It still writes the `users` row and the existing `rsvps` row. It does not send people back to a waitlist popup.

Sign-in lands on `/dashboard`, never a Hackatime detour. A popup there asks them to name their HackCast project, then offers the last 5 Hackatime projects they worked on to link (connecting Hackatime first if needed). Linking is optional: without it they can still ask questions, but they don't show up in the hours race.

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

Orchard already needs `HACKATIME_CLIENT_ID`, `HACKATIME_CLIENT_SECRET`, and `PUBLIC_BASE_URL=https://hackcast.hackclub.com` (origin only, no path). `PUBLIC_HACKATIME_OAUTH_UID` is another name for the client id. Leave `PUBLIC_BASE_URL` unset for `npm run dev` and the callback is `http://localhost:5173/auth/hackatime/callback`.

Tables are created on first use, including `hackcast_projects`. The old `rsvps` table is unchanged.

## Submitting and review

`/submit` saves to `submissions` in Postgres. Software hours are read from the linked Hackatime project at submit time; hardware hours come from the builder's journal.

```
builder submits /submit                      → pending
reviewer at /admin/reviews/[id]
  ├── needs changes → changes_requested → builder edits and resubmits → pending
  ├── reject        → rejected (an admin can move it back to pending)
  └── approve (sets the hours; the reviewer writes what they checked and why these hours)
        → creates a record in Hack Club's YSWS Airtable with
          "Optional - Override Hours Spent" = approved hours and that justification
          signed "Reviewed by <reviewer>"
        → sent; address and birthday are wiped from our copy
        → the hours and justification can be rewritten later; saving PATCHes the Airtable record
```

Every decision is logged in `submission_reviews`, which the admin stats read. Approved hours show on the builder's dashboard as their shop balance.

Sending needs `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` and `AIRTABLE_TABLE`. Without them, approvals wait under "approved, not sent" with a send button. The Airtable field names are in `src/lib/server/airtable.ts`; if Airtable answers `UNKNOWN_FIELD_NAME`, fix the name there.

## Staff

`johnny@hackclub.com` is always an admin. `ADMIN_EMAILS` and `ADMIN_SLACK_IDS` add more admins. Everyone else is added at `/admin/team` as a reviewer or admin, by the email they sign in with (they can be added before their first sign-in). Non-staff get a 404 on every `/admin` page.

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
