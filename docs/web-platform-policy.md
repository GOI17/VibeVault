# Web Platform Policy

Use this for browser-specific behavior that should survive UI and bootstrap changes.

## Web zoom policy

VibeVault applies a web zoom policy at app bootstrap (`App.js`) to reduce accidental zoom behavior where technically appropriate.

The runtime policy keeps `initial-scale=1`, applies `touch-action: manipulation`, and forces inputs to `font-size: 16px` on web to avoid iOS focus zoom behavior.

This is best-effort. Browser accessibility zoom controls may still override restrictions.

## Agent guardrails

- Do not remove the web policy while changing bootstrap or layout code.
- Treat browser behavior as platform-specific.
- Run `pnpm verify:browser-policy` when touching browser policy code.
- Use `docs/browser-workflow.md` for cmux browser evidence.
