# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Framework:** Next.js (App Router)
- **Auth + Database:** Supabase (Postgres + Supabase Auth)
- **Hosting:** Vercel
- **Language:** TypeScript

## Commands

> This project has not been scaffolded yet. Once initialized, expect the following conventions:

```bash
npm run dev        # start local dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

Supabase local development:
```bash
npx supabase start          # start local Supabase instance
npx supabase db reset       # reset DB and re-run migrations + seed
npx supabase gen types typescript --local > lib/database.types.ts  # regenerate types after schema changes
```

## Architecture

### Roles

Three roles stored on the user profile: `player`, `drawmaster`, `club_admin`. Club Admin is a superset of Drawmaster. First admin is seeded directly in the DB; admins promote others in-app.

### Season States

The single league progresses through explicit states: `registration_open` → `teams_finalized` → `season_active` → `season_complete`. Feature availability is gated by state — balancing tools only in `registration_open`, score entry only in `season_active`, etc.

### Key Domain Concepts

- **League registration** — separate from user account creation. Players join the league, optionally specifying preferred teammates by name. Locked after `teams_finalized`.
- **Groups** — up to 5 players who are guaranteed to be on the same team. Under-4 groups get filled from the remaining pool during balancing.
- **Teams** — 3–4 players + optional alternate. Balanced by equalizing average skill tier (Beginner=1, Intermediate=2, Advanced=3), avoiding all-beginner teams.
- **Draws** — weekly rounds where all teams play simultaneously. Schedule is generated upfront (round-robin), with byes spread evenly when team count doesn't divide evenly across sheets.
- **Results** — entered by teams on the honor system (winner only); drawmaster can override. Standings (W/L/Draw) auto-update.

### Route Structure (planned)

- `/` — public landing / login
- `/register` — user account creation (name, email, phone, skill tier)
- `/league/join` — league registration (confirm join + teammate preferences)
- `/portal` — player portal: upcoming schedule, teammates/contacts, standings
- `/admin` — drawmaster/admin tools: player pool, team balancing, schedule editor, results override, role management
