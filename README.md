# VibeVault 🎬

VibeVault is a React Native + Expo app for discovering titles, managing favorites, and viewing detailed movie/series metadata on mobile and web.

## What the app does

- Browse a curated home feed.
- Search titles from the header flow.
- Open a dedicated **Details** screen (title, synopsis, cast, release date, where-to-watch, and seasons/episodes for series).
- Add/remove favorites with double press.
- Create manual favorites and filter favorites by media type.
- Backup and restore favorites through the configured backup repository.

## Tech stack (current)

- Expo SDK 55
- React Native 0.83 + React 19
- React Navigation (Stack + Bottom Tabs)
- TanStack Query for server/cache state
- AsyncStorage for local favorites persistence
- Zod/Formik for input validation

> Routing is React Navigation-based (`App.js` + `app/_layout.tsx`), not Expo Router.

## Architecture snapshot

```text
app/
  _layout.tsx                # Root navigation container + stack wiring
  tabs/_layout.tsx           # Bottom tabs (Home, Favorites)
  home/search/query.tsx      # Search screen entry
  home/details/[id].tsx      # Details screen entry

containers/                  # Screen-level orchestration (queries, mapping, mutations)
components/                  # Reusable UI + views
src/domain/                  # Entities and repository contracts
src/repositories/            # API/storage/backup implementations
src/providers/               # Repository dependency injection
constants/                   # Colors, query keys, query client
scripts/                     # Validation and workflow scripts
```

## Quick start

### Prerequisites

- Node.js 18+
- npm (canonical package manager for this repo)

### Install

```bash
git clone https://github.com/GOI17/VibeVault.git
cd VibeVault
npm install
```

### Environment variables

Use `.env.example` as the template:

```bash
cp .env.example .env
```

Populate values for:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
- `EXPO_PUBLIC_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_IOS_CLIENT_ID`

### Run

```bash
npm start
```

Then choose a target from Expo CLI (`i` / `a` / `w`) or use dedicated scripts below.

## Scripts

- `npm start` — start via `scripts/start-clean.js`
- `npm run start:expo` — raw Expo start
- `npm run android` — run Android target
- `npm run ios` — run iOS target
- `npm run web` — run web target
- `npm run lint` — run Expo ESLint
- `npm run reset-project` — legacy compatibility helper (non-destructive, deprecated)
- `./node_modules/.bin/tsc --noEmit` — TypeScript check
- `npm run verify:browser-policy` — browser policy harness
- `npm run verify:stitch-ui-updates-phase1` — phase-1 UI invariants harness
- `npm run predeploy` — export web build to `dist`
- `npm run deploy` — publish `dist` to GitHub Pages via `gh-pages`

## Verification workflow

- Static checks:
  - `npm run lint`
  - `./node_modules/.bin/tsc --noEmit`
- Browser-policy checks:
  - `npm run verify:browser-policy`
- UI policy checks:
  - `npm run verify:stitch-ui-updates-phase1`

For browser/visual checks, follow `docs/browser-workflow.md`.

## Deployment

Canonical web deployment path:

```bash
npm run predeploy
npm run deploy
```

`homepage` is configured for GitHub Pages at `https://goi17.github.io/VibeVault`.

## Web zoom policy

- VibeVault applies a web zoom policy at app bootstrap (`App.js`) to reduce accidental zoom behaviors where technically appropriate.
- The runtime policy keeps the viewport baseline at `initial-scale=1` and applies `touch-action: manipulation`.
- Inputs are forced to `font-size: 16px` on web to avoid iOS focus-zoom behavior.
- This is a best-effort web policy; browser accessibility zoom controls may still override restrictions.

## GitHub issue workflow

- Use issue forms under `.github/ISSUE_TEMPLATE/`:
  - Bug report
  - Feature request
- Blank issues are disabled.
- New issues are labeled `status:needs-review`.
- Maintainers add `status:approved` before implementation PRs.

## License

MIT — see `LICENSE`.
