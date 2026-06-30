# 12-Month Roadmap Completion Status

This document records which roadmap items from `docs/roadmap-12-months.md` are
implemented in the codebase and which remain intentionally deferred.

## P0 — Analytics Foundation ✅

| Event | Implementation | File |
|---|---|---|
| `app_open` | Tracked on app start + 7d/30d return checks | `src/providers/AnalyticsProvider.tsx` |
| `first_favorite` | Tracked after first successful favorite add | `hooks/useFavoriteMutations.ts` |
| `first_watched_episode` | Tracked when an episode is marked watched | `hooks/useWatchedProgress.ts` |
| `first_movie_watched` | Tracked when a movie is marked watched | `hooks/useWatchedProgress.ts` |
| `share_generated` | Tracked on link share and image share | `hooks/useShare.ts`, `hooks/useShareCardImage.ts` |
| `return_after_7_days` | Checked on app open | `src/providers/AnalyticsProvider.tsx` |
| `return_after_30_days` | Checked on app open | `src/providers/AnalyticsProvider.tsx` |
| Dashboard | `Analytics` tab screen | `app/tabs/analytics.tsx` |
| Export | JSON/CSV export via share sheet | `app/tabs/analytics.tsx`, `src/repositories/ExpoExportRepository.ts` |

## P1 — Core Tracking ✅ (with non-blocking polish)

| Feature | Status | Evidence |
|---|---|---|
| Search catalog | ✅ | `containers/SearchContainer.tsx`, `components/views/SearchView.tsx` |
| Add favorite | ✅ | `hooks/useFavoriteMutations.ts` |
| Mark episode watched | ✅ | `hooks/useWatchedProgress.ts` |
| Mark movie watched | ✅ | `hooks/useWatchedProgress.ts` |
| Manual favorites | ✅ | `components/forms/AddFavoriteForm.tsx` |
| Update progress | ✅ | `containers/DetailsContainer.tsx`, `containers/EpisodeListContainer.tsx` |

Non-blocking polish remains (latency, empty states, accessibility) and is
tracked informally in `docs/roadmap-12-months.md`.

## P2 — Shareability ✅

| Feature | Status | Evidence |
|---|---|---|
| Deep-link into details | ✅ | PR #77, `src/domain/utils/shareMedia.ts` |
| Streaming-platform deep links | ✅ | `components/premium/StreamingLinks.tsx`, `src/domain/entities/StreamingPlatform.ts` |
| Shareable title card / image | ✅ | `components/premium/ShareableTitleCard.tsx`, `hooks/useShareCardImage.ts` |
| Device-generated yearly rewind | ✅ | `components/premium/DeviceRewindCard.tsx`, `containers/RewindContainer.tsx`, `src/domain/utils/deviceRewind.ts` |

## P3 — Monetization ⏸️ (gated)

Per roadmap decision, monetization work starts only after **100+ WAU**.

Current state:
- Premium subscription scaffolding: ✅ (`src/domain/entities/Subscription.ts`, `src/repositories/LocalSubscriptionRepository.ts`, `src/providers/SubscriptionProvider.tsx`).
- Premium-gated streaming deep links: ✅ (`components/premium/PremiumGate.tsx`, `components/views/DetailsView.tsx`).
- Real payment integration: ⏸️ deferred until WAU threshold.
- Notifications: ⏸️ deferred until WAU threshold.
- Unlimited export: partially available via local export; premium-gated logic deferred.

## P4 — Publishing Platform ⏸️ (deferred)

Requires backend. No server-side implementation exists yet.

## P5 — Social Network ⏸️ (deferred indefinitely)

Requires backend and P4 validation. No implementation.

## Decision log applied

1. No backend in P0-P2: ✅ kept.
2. Monetization is P3, not P0: ✅ kept; payment integration gated.
3. Social ≠ publishing: ✅ documented as deferred.
4. Rewind is device-generated: ✅ implemented without public URLs.
5. Premium features are convenience, not lock-in: ✅ core tracking remains free.

## Verification

- `./node_modules/.bin/tsc --noEmit` ✅
- `./node_modules/.bin/eslint` on touched scope ✅
