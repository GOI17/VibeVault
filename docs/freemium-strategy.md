# VibeVault Freemium Strategy

> Long-lived product and technical direction for monetizing VibeVault without ads.

## Intent

VibeVault will use a **freemium, ad-free model**. Free users get core discovery and a limited set of personal features; paid users unlock richer notifications, direct streaming-service integrations, and unlimited watch history. Revenue comes from user-paid premium features, not advertising or resold data.

## Product Tiers

| Capability | Free tier | Premium tier |
|---|---|---|
| Browse / search catalog | ✅ | ✅ |
| Add favorites | Up to a fixed cap (e.g. 50 titles) | Unlimited |
| Manual favorites | ✅ | ✅ |
| Watch progress (per-title) | Last N titles (e.g. 20) | Unlimited history + cloud sync |
| Backup / restore | Google Drive only | Google Drive + automatic encrypted cloud sync |
| Notifications | None | New releases, price drops, new episodes, watchlist reminders |
| Streaming integrations | View "where to watch" as text | One-tap deep links into Netflix, Prime Video, Disney+, etc. |
| Cross-device sync | Manual backup only | Automatic account sync |
| Ads | None | None |

## Premium Feature Detail

### 1. Notifications

Use **Expo Notifications** for premium users. Start with local/scheduled notifications so the app does not need a paid backend immediately; later add server-driven push for real-time alerts (new season drops, leaving-soon warnings).

Notification types to offer premium users:

- New episode or season available for a tracked series.
- Title on the watchlist became available on a subscribed streaming service.
- Price drop or rental discount (if we integrate transactional data).
- Reminder to finish a partially watched title.

Gate: only active premium subscribers may register notification interests. Free users see a preview of the feature in settings.

### 2. Direct streaming integrations

"Integration" means **deep linking and availability metadata**, not embedding copyrighted video or scraping proprietary catalogs.

Supported platforms (expand current `PlatformEnum`):

- Netflix
- Prime Video
- Disney+
- Max
- Apple TV+
- Hulu
- Paramount+
- YouTube / Google Play Movies & TV (rental/purchase links)

What the app does:

1. Displays per-title availability: "Watch on Netflix" / "Rent on Prime Video".
2. Tapping a provider opens the corresponding app or web URL via a deep link / universal link.
3. Does not store or redistribute provider catalog data beyond what is needed to render the link.

Deep-link examples (platform-specific, subject to each provider's terms):

- Netflix: `https://www.netflix.com/title/{netflixId}` or `nflx://title/{netflixId}`
- Prime Video: `https://www.primevideo.com/detail/{asin}` or `primevideo://detail?asin={asin}`
- Disney+: `https://www.disneyplus.com/{contentType}/{id}`
- Apple TV: `https://tv.apple.com/{country}/movie/{id}` or `com.apple.tv://show?id={id}`

### 3. Unlimited history

History includes:

- All watched movies and episodes with timestamps.
- All favorites and watchlist additions/removals.
- Search history (optional, can be disabled by user).

Premium unlocks:

- No local cap on watched records.
- Cross-device encrypted cloud sync (via a lightweight backend or account-based storage).
- Exportable history CSV/JSON.

Until a backend exists, increase the local cap significantly and use Google Drive backup as the sync mechanism.

## Data Sources and Licensing Guardrails

### Current dependency

The app currently calls `https://api.imdbapi.dev` (`EXPO_PUBLIC_API_URL`) for title metadata. This source is free and appears to repackage IMDb-like data. Relying on it for a paid product increases legal and reliability risk.

### Recommended licensed stack

For a monetized, ad-free app we should move to clearly licensed sources:

| Need | Recommended source | Why |
|---|---|---|
| Metadata (title, cast, images, synopsis) | TMDB (The Movie Database) API | Free tier with attribution; clear terms; widely used |
| Where to watch / availability | JustWatch API or TMDB watch providers | Legal provider availability data; supports deep-link IDs |
| Release dates | TMDB + official sources | Reliable and licensed |
| Deep-link identifiers | Provider-specific IDs from JustWatch/TMDB | Needed for Netflix/Prime/Disney links |

### Legal guardrails

- Do **not** redistribute full metadata dumps.
- Cache only per-user, per-title responses; respect provider TTLs and attribution.
- Store only the minimum provider ID needed to build a deep link.
- Keep images, posters, and synopsis under each source's attribution terms.
- Add an "Attributions" screen in the app pointing to TMDB / JustWatch.
- Avoid scraping streaming-service UIs or reverse-engineering private APIs.

## Monetization Model Options

Two options that fit an ad-free freemium app:

1. **Subscription (recommended)**
   - Monthly / yearly premium plan.
   - Includes all premium features.
   - Predictable revenue; easy to add trials and family plans later.

2. **One-time unlock**
   - Single purchase to remove caps and unlock notifications/integrations forever.
   - Simpler to implement, but harder to fund ongoing backend costs.

Decision needed: subscription vs. one-time, pricing, trial length.

## Implementation Phases

1. **Foundation**
   - Evaluate TMDB + JustWatch APIs and request access keys.
   - Add a new repository adapter (`TmdbMovieRepository`) behind the `IMovieRepository` contract.
   - Keep `APIMovieRepository` as a fallback during migration.
   - Update attribution and legal docs.

2. **Monetization scaffolding**
   - Choose subscription provider (RevenueCat / Expo In-App Purchases / Stripe for web).
   - Add a `SubscriptionStatus` domain concept and provider.
   - Gate notifications and cap history behind the subscription check.

3. **Notifications**
   - Integrate `expo-notifications`.
   - Schedule local notifications for premium users.
   - Add a notification-preferences screen.

4. **Streaming deep links**
   - Expand `PlatformEnum` to cover video providers.
   - Add a `StreamingLinkRepository` that maps platform IDs to URLs/schemes.
   - Render provider chips on the Details screen.
   - Add tests verifying links open only if the provider app/URL is available.

5. **Unlimited history + sync**
   - Remove or raise the free-tier watched-record cap.
   - Build a backend or use a BaaS for encrypted cloud sync.
   - Add history export.

6. **Launch readiness**
   - Legal review of terms, privacy policy, and data retention.
   - Update stores metadata and screenshots.

## Open Decisions

1. Subscription vs. one-time purchase?
2. Which notification backend: local-only first, or server-driven from the start?
3. Cloud sync backend: build a small Node/Postgres service, or use Firebase/Supabase?
4. Do we keep `api.imdbapi.dev` as a temporary fallback, or fully replace it before monetizing?
5. Which exact streaming providers should ship in v1?

## Related Docs

- `docs/project-overview.md` — current capabilities and vocabulary.
- `docs/architecture.md` — repository boundaries that new adapters must respect.
- `docs/web-platform-policy.md` — web-specific behavior for premium screens and checkout.

## Current State Snapshot

This table links the strategy to existing code so implementation can start from evidence rather than assumptions.

| Strategy area | Current implementation | Location |
|---|---|---|
| Catalog API | Calls `https://api.imdbapi.dev` via `EXPO_PUBLIC_API_URL`. | `.env.example`, `src/repositories/APIMovieRepository.ts` |
| API abstraction | `IMovieRepository` contract with `search`, `suggest`, `getRandom`, `getById`. | `src/domain/repositories/IMovieRepository.ts` |
| Provider list | `PlatformEnum` contains Spotify/Deezer/Tidal/Netflix/Hulu/Disney+. | `src/domain/entities/Favorite.ts` |
| Where-to-watch data | Free text array parsed from API or entered manually. | `src/domain/entities/Movie.ts`, `components/forms/AddFavoriteForm.tsx` |
| Watch history | Per-title movie/episode watched state stored in AsyncStorage. | `src/domain/entities/WatchedProgress.ts`, `src/repositories/AsyncStorageWatchedProgressRepository.ts` |
| Favorites limit | Local storage only; no explicit free/paid cap yet. | `src/repositories/AsyncStorageFavoriteRepository.ts` |
| Backup/sync | Manual Google Drive backup/restore. | `src/repositories/GoogleDriveBackupRepository.ts`, `app/utils/googleDrive.ts` |
| Notifications | No notification code yet; `app/_layout.tsx` only defines a `notification` color. | `app/_layout.tsx` |
| App build | Expo SDK 55, React Native 0.83, supports iOS/Android/Web. | `docs/architecture.md`, `package.json` |

## Technical Boundaries

New work must keep the existing repository boundaries intact:

- **Domain contracts** (`src/domain/repositories/*`, `src/domain/entities/*`) define what the app needs.
- **Adapters** (`src/repositories/*`) implement how each feature is fetched or stored.
- **Containers** (`containers/`) should consume contracts, not concrete adapters.
- **UI components** (`components/`, `app/`) should not call APIs or backends directly.

For premium features, introduce:

- `ISubscriptionRepository` + `SubscriptionProvider` for entitlement checks.
- `INotificationRepository` (local first, push later) behind the same contract.
- `IStreamingLinkRepository` for provider deep-link resolution.
- `IHistorySyncRepository` for cloud history sync.

Keep all provider-specific logic inside the corresponding repository so the UI only sees normalized domain types.

## ChatGPT Memory Context

El usuario compartió una conversación previa con ChatGPT (Business advisor) sobre el roadmap de VibeVault. El extracto completo está en `docs/chatgpt-memory-extract.md`.

Puntos clave que afectan la estrategia freemium:

- **Horizonte temporal:** los próximos 12 meses se enfocan en retención (WAU), no en ingresos.
- **Monetización es P3**, solo después de 100+ WAU y una base de shareability funcional.
- **Shareability sin backend** es el puente: deep links, imágenes, cards, static exports.
- **Public profiles / public lists / rewind** se mantienen en la visión, pero requieren un backend de *publicación* (no social graph) más adelante.
- **Social graph** (followers, feeds, comments, reactions) se diferirá por completo.
- **Rewind** se genera localmente como imagen/PDF/deep link; no tiene URL pública en fase A.

Esto confirma que el freemium debe construirse sobre:

1. Local-first tracking sólido.
2. Shareability (deep links) lista y funcional.
3. Monetización ad-free que desbloquee comodidades, no funcionalidades básicas:
   - notificaciones de nuevo contenido,
   - deep links directos a plataformas ("dónde verlo"),
   - export/historial sin límites artificiales.

Por lo tanto, en la implementación inmediata priorizamos:
- mejorar la superficie de share existente,
- agregar deep links de plataformas como funcionalidad premium,
- dejar perfiles/listas públicas como roadmap futuro (P4) con backend de publicación.
