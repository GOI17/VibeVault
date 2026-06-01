# Agent Guide

Use this after `AGENTS.md` to choose the smallest useful project context before editing.

## Quick path

1. Read `AGENTS.md` for mandatory behavior and review rules.
2. Pick only the docs that match the task.
3. Prefer links over duplicated explanations.

## Task routing

| Task | Read |
|---|---|
| Product behavior or vocabulary | `docs/project-overview.md` |
| Navigation, repositories, data flow, boundaries | `docs/architecture.md` |
| Local setup, env vars, scripts | `docs/development.md` |
| Checks, validation, PR readiness | `docs/verification.md` |
| Web platform behavior | `docs/web-platform-policy.md` |
| Browser or visual validation | `docs/browser-workflow.md` |
| Deployment | `docs/deployment.md` |
| Issues, labels, PR approval | `docs/github-workflow.md` |

## Guardrails

- Keep `README.md` human-facing and concise.
- Keep `AGENTS.md` focused on agent behavior and repository rules.
- Put long-lived project knowledge in scoped `docs/` files.
- Do not change app behavior during documentation-only work.
