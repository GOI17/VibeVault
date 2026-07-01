# VibeVault 🎬

VibeVault is a React Native + Expo app for discovering movies and series, managing favorites, and viewing detailed title metadata on mobile and web.

## Quick start

```bash
git clone https://github.com/GOI17/VibeVault.git
cd VibeVault
pnpm install
cp .env.example .env
pnpm start
```

Populate `EXPO_PUBLIC_API_URL` in `.env` before running the app.

## What the app does

- Browse a curated home feed.
- Search titles from the header flow.
- Open detailed movie/series metadata.
- Add, remove, create, filter, back up, and restore favorites.

## Documentation

| Need | Read |
|---|---|
| Product capabilities and vocabulary | [`docs/project-overview.md`](docs/project-overview.md) |
| Architecture, boundaries, and repo structure | [`docs/architecture.md`](docs/architecture.md) |
| Local setup, environment, and scripts | [`docs/development.md`](docs/development.md) |
| Validation and review checks | [`docs/verification.md`](docs/verification.md) |
| GitHub Pages deployment | [`docs/deployment.md`](docs/deployment.md) |
| Web zoom and browser policy | [`docs/web-platform-policy.md`](docs/web-platform-policy.md) |
| Browser workflow and visual evidence | [`docs/browser-workflow.md`](docs/browser-workflow.md) |
| GitHub issue and PR workflow | [`docs/github-workflow.md`](docs/github-workflow.md) |
| Agent-specific guardrails | [`AGENTS.md`](AGENTS.md) and [`docs/agent-guide.md`](docs/agent-guide.md) |

## Browser policy verification

For browser checks and visual evidence, use the Playwright workflow in [`docs/browser-workflow.md`](docs/browser-workflow.md).

```bash
npm run verify:browser-policy
```

Output labels: PASS / FAIL / BLOCKED.

## For agents and contributors

Start with [`AGENTS.md`](AGENTS.md), then use [`docs/agent-guide.md`](docs/agent-guide.md) to choose the smallest useful project context for your task.

## License

MIT — see `LICENSE`.


## Backend

P4/P5 publication backend lives in `backend/` — Fastify + SQLite + JWT.
