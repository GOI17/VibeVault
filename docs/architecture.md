# Architecture

VibeVault is an Expo / React Native app using React Navigation and repository boundaries. Keep UI, orchestration, domain contracts, and data adapters separated.

## Stack

| Area | Choice |
|---|---|
| Runtime | Expo SDK 55, React Native 0.83, React 19 |
| Navigation | React Navigation stack + bottom tabs |
| Cache state | TanStack Query |
| Local persistence | AsyncStorage |
| Validation/forms | Zod and Formik |

> Routing is React Navigation-based (`App.js` + `app/_layout.tsx`), not Expo Router.

## Repo shape

```text
app/                 # navigation entries and screens
containers/          # queries, mapping, mutations
components/          # reusable UI and views
src/domain/          # entities and repository contracts
src/repositories/    # API, storage, backup adapters
src/providers/       # dependency injection
constants/           # colors, query keys, query client
scripts/             # validation and workflow scripts
```

## Boundaries

- Domain contracts live in `src/domain`.
- Adapter implementations live in `src/repositories`.
- Containers orchestrate data; components render UI.
- Do not reach across layers when a contract/container boundary exists.
