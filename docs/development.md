# Development

Use this for local setup, environment variables, and day-to-day scripts.

## Quick path

```bash
git clone https://github.com/GOI17/VibeVault.git
cd VibeVault
pnpm install
cp .env.example .env
pnpm start
```

## Prerequisites

- Node.js 18+
- pnpm 9.15.9 from `package.json`

## Environment variables

Required: `EXPO_PUBLIC_API_URL`.

Optional for Google auth / backup flows: `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_ANDROID_CLIENT_ID`, `EXPO_PUBLIC_IOS_CLIENT_ID`.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm start` | Start via `scripts/start-clean.js`. |
| `pnpm start:expo` | Start raw Expo CLI. |
| `pnpm android` / `pnpm ios` / `pnpm web` | Run platform targets. |
| `pnpm lint` | Run Expo ESLint. |
| `./node_modules/.bin/tsc --noEmit` | TypeScript check. |
| `pnpm verify:browser-policy` | Browser policy harness. |
| `pnpm verify:stitch-ui-updates-phase1` | Phase-1 UI invariants harness. |
