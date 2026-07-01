# VibeVault Backend

Lightweight publication backend for P4/P5 of the 12-month roadmap.

## Scope

This backend is intentionally read-mostly and focused on publication, not a
full social network. It supports:

- Public profiles (`/u/:handle`)
- Public lists (`/lists/:id`)
- Published rewinds (`/rewind/:handle/:year`)
- Followers (P5)
- Activity feed (P5)

## Stack

- Node.js + Fastify
- SQLite via `better-sqlite3` (single-file, no separate DB server)
- Zod for request/response validation
- JWT for lightweight auth (Google OAuth on mobile links to a backend account)

## Data model

See `src/schema.sql` for table definitions.

## Run locally

Copy `.env.example` to `.env` and set `JWT_SECRET` and optionally `GOOGLE_CLIENT_ID`.

```bash
cd backend
pnpm install
pnpm migrate
pnpm dev
```

## API

See `src/routes.js` for route definitions.

- `POST /api/auth/google` – link Google account, return JWT
- `GET /api/health` – health check
- `GET /api/u/:handle` – public profile
- `GET /api/u/:handle/lists` – public lists for a user
- `GET /api/me/profile` – own profile
- `PUT /api/me/profile` – update own profile
- `GET|POST /api/me/lists` – list own lists / create list
- `GET|PUT|DELETE /api/me/lists/:id` – manage a list
- `GET /api/lists/:id` – view a public list
- `POST|GET /api/me/rewinds/:year` – publish/view own rewind
- `GET /api/rewind/:handle/:year` – public rewind for a user
- `POST|DELETE /api/me/follows/:handle` – follow/unfollow
- `GET /api/u/:handle/followers` – list followers
- `GET /api/u/:handle/following` – list following
- `GET /api/me/feed` – activity feed of people you follow
