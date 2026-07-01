# Project Overview

VibeVault is a React Native + Expo app for discovering movies and series, managing favorites, and viewing detailed title metadata on mobile and web.

## Capabilities

- Browse a curated home feed.
- Search titles from the header flow.
- Open Details with synopsis, cast, release date, watch options, and season/episode metadata.
- Add/remove favorites with double press.
- Create manual favorites and filter favorites by media type.
- Backup and restore favorites through the configured backup repository.

## Vocabulary

| Term | Meaning |
|---|---|
| Title | A movie or series shown in VibeVault. |
| Details | The full metadata screen for a title. |
| Favorite | A locally persisted saved title. |
| Manual favorite | A user-created favorite not sourced from the catalog feed. |

## Monetization Direction

VibeVault is intended to be an ad-free freemium app. See `docs/freemium-strategy.md` for the tier plan, premium features (notifications, streaming deep links, unlimited history), data-source licensing guardrails, and implementation phases.
