# Deployment

VibeVault deploys the web app to GitHub Pages.

## Quick path

```bash
pnpm predeploy
pnpm deploy
```

## Flow

| Step | Command or workflow |
|---|---|
| Export web app | `pnpm predeploy` / `expo export -p web` |
| Publish `dist` | `pnpm deploy` via `gh-pages` |
| CI deployment | `.github/workflows/deploy.yml` |

## GitHub Pages

`homepage` is `https://goi17.github.io/VibeVault`.

The workflow uses Node.js 20, pnpm 9.15.9, `vars.API_URL` as `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_URL=/VibeVault`, and `fix-paths.js` before uploading the Pages artifact.
