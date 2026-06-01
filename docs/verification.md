# Verification

Use this to choose checks for a change. Do not run a production build unless explicitly requested.

## Code changes

```bash
./node_modules/.bin/eslint <touched files>
./node_modules/.bin/tsc --noEmit
```

For full lint, run `pnpm lint`.

## Browser and UI policy checks

| Command | Purpose |
|---|---|
| `pnpm verify:browser-policy` | Validates browser policy assumptions. |
| `pnpm verify:stitch-ui-updates-phase1` | Validates phase-1 UI invariants. |

## Documentation-only changes

1. Verify the diff only touches intended docs/metadata.
2. Check links and filenames.
3. Do not run app builds.
4. Run markdown tooling only if the repo adds it.

See `docs/browser-workflow.md` for browser evidence rules.
