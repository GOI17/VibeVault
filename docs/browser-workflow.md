# Browser Workflow

Use Playwright for browser evidence when visual or interaction validation is needed.

## Quick path

1. Open the target app or route with Playwright.
2. Wait for the page/app to finish loading before interacting.
3. Capture an accessibility snapshot or DOM evidence for concrete refs.
4. Take a screenshot only after the UI is stable.
5. Record the URL, viewport/device, screenshot reference, and verification result.

## Surface selection

If multiple browser contexts or pages are available, choose the one that matches the target app/session. Do not interact with an unrelated surface.

## Tool policy

Playwright is allowed for browser and visual checks.

If browser validation cannot run in the current environment, mark the check as `BLOCKED` and explain what capability is missing.

## Evidence and pass criteria

Record command/tool, URL, viewport/device, snapshot/screenshot reference, observed result, and PASS / FAIL / BLOCKED outcome.

The evidence bundle is the preserved artifact trail for the final verified state.

A `PASS` means the evidence trail was reviewed and the observed UI matched the expected behavior.

## Verification

```bash
pnpm verify:browser-policy
```
