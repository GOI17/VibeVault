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
- Backend social graph (followers, feeds, comments, reactions)
- Public URLs / server-rendered profiles

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

Remaining polish (non-blocking):
- Search suggestions latency and error states.
- Empty states for all flows.
- Gesture / accessibility pass on poster queue.

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

### P4 — Publishing Platform (post-12 months)

Goal: optional public profiles, public lists, and published rewinds.

Requires a backend of **publication**, not a social network. Read-mostly, optimized for:
- `vibevault.app/u/:handle`
- `vibevault.app/lists/:id`
- `vibevault.app/rewind/:handle/:year`

Deferred until retention justifies the backend investment.

### P5 — Social Network (post-12 months)

Goal: followers, activity feeds, comments, reactions.

Deferred indefinitely until P4 proves that users want public presence.

## Decision Log

1. **No backend in P0-P2.** Everything is local-first to preserve focus on retention.
2. **Monetization is P3, not P0.** Revenue comes after product-market fit signals.
3. **Social ≠ publishing.** Publishing (public lists/profiles) is kept in vision but deferred; social graph is out of 12-month scope.
4. **Rewind is device-generated.** No public URLs until backend arrives.
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
