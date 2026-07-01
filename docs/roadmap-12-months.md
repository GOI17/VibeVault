# VibeVault 12-Month Roadmap

> Source of truth for the next 12 months. Built from `docs/chatgpt-memory-extract.md` and `docs/freemium-strategy.md`.

## Vision

VibeVault is a personal entertainment discovery, tracking, and recommendation platform — not merely a series tracker.

When someone thinks:
- What am I watching?
- What do I want to watch?
- What do you recommend?
- Where can I watch it?

We want them to think of VibeVault.

## North Star Metric

**WAU (Weekly Active Users)**

The product has a weekly usage pattern. We do not expect daily logins, but we do expect users to return every week.

## Business Objective (next 12 months)

**Optimize retention, not revenue.**

Retention → active users → monetization → sustainable business.

Without retention, any monetization fails.

## What we will NOT build now

- Chat
- Proprietary video / streaming
- Marketplace
- Complex ads
- Full social graph (followers, feeds, comments, reactions) until P5
- Server-side rendering / SEO profiles

P4 introduces public URLs for profiles, lists, and rewinds using a lightweight
read-mostly backend. The social graph (follows, feeds, reactions) stays in P5 and
remains gated by P4 validation.

Anything that does not directly increase activation, retention, or organic distribution is out of scope.

## Phases

### P0 — Analytics Foundation ✅

Goal: know what is happening before we decide what to build.

Milestone: every key user action is tracked locally and exportable.

| Metric | Event | Evidence |
|---|---|---|
| Activation | `first_favorite` | First favorite saved. |
| Activation | `first_watched_episode` | First episode marked watched. |
| Activation | `first_movie_watched` | First movie marked watched. |
| Distribution | `share_generated` | User shares a title or rewind. |
| Retention | `return_after_7_days` | User opens app 7+ days after install/first action. |
| Retention | `return_after_30_days` | User opens app 30+ days after install/first action. |

Implementation: lightweight `IAnalyticsRepository` writing to AsyncStorage, surfaced through a simple dashboard or export.

### P1 — Core Tracking

Goal: the main experience is fast and reliable.

Milestone: any tracking action takes fewer than 3 taps.

| Feature | Status |
|---|---|
| Search catalog | ✅ |
| Add favorite | ✅ |
| Mark episode watched | ✅ |
| Mark movie watched | ✅ |
| Manual favorites | ✅ |
| Update progress | ✅ |

Completed polish:
- Empty states for Home, Favorites, Search, EpisodeList, and PosterQueue.
- Search suggestions loading and error states with retry.
- Accessibility labels on PosterQueue cards.

### P2 — Shareability ✅

Goal: every user can generate shareable content without a backend.

Milestone: a user can share a title or a rewind as a link, image, or card.

| Feature | Status |
|---|---|
| Deep-link into details (PR #77) | ✅ |
| Streaming-platform deep links (premium) | ✅ |
| Shareable title card / image | ✅ |
| Device-generated yearly rewind (image/PDF) | ✅ |

Technical constraint: **no backend**. All artifacts are generated locally from AsyncStorage data.

### P3 — Monetization

Goal: begin monetization only after retention and distribution are proven.

Gate: **100+ WAU**.

| Feature | Model |
|---|---|
| Where to watch deep links | Premium |
| Affiliate links where legal | Revenue share |
| Notifications (new episodes, availability) | Premium |
| Unlimited history / export | Premium |
| Ad-free experience | Always free |

Implementation starts only after P0-P2 are stable and WAU threshold is met.

### P4 — Publishing Platform 🚧 (scaffolding)

Goal: optional public profiles, public lists, and published rewinds.

Requires a backend of **publication**, not a social network. Read-mostly, optimized for:
- `vibevault.app/u/:handle`
- `vibevault.app/lists/:id`
- `vibevault.app/rewind/:handle/:year`

Backend scaffolding: `backend/`
- Node.js + Fastify + SQLite (`better-sqlite3`) + Zod + JWT
- Tables: `users`, `public_profiles`, `published_lists`, `published_list_items`, `published_rewinds`
- Endpoints for auth, profiles, lists, rewinds

Gated until retention justifies the hosting investment.

### P5 — Social Network 🚧 (planned)

Goal: followers, activity feeds, comments, reactions.

Requires P4 publishing backend. Data model already includes `follows` and `activities` tables, plus endpoints for follow/unfollow and an activity feed, so the backend can scale into a social graph once P4 validates public presence.

Deferred until P4 proves that users want public presence.

## Decision Log

1. **No backend in P0-P2.** Everything is local-first to preserve focus on retention.
2. **Monetization is P3, not P0.** Revenue comes after product-market fit signals.
3. **Social ≠ publishing.** Publishing (public lists/profiles) is P4 with a read-mostly backend; the social graph (followers, feeds, reactions) is P5 and remains gated until P4 validates demand.
4. **Rewind is device-generated in P2.** P4 adds optional published rewinds with public URLs once the backend is deployed.
5. **Premium features are convenience, not lock-in.** Core tracking remains free; deep links, notifications, and export are premium.

## How we evaluate success

Each sprint answers:
- Did activation increase?
- Did retention increase?
- Did organic distribution increase?

If the answer is no, the feature did not generate value.

## Related Docs

- `docs/project-overview.md`
- `docs/freemium-strategy.md`
- `docs/chatgpt-memory-extract.md`
- `docs/architecture.md`
