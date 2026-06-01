# Browser Workflow

Use cmux-browser for browser evidence. Playwright is not an allowed fallback.

## Quick path

1. Open the target app or route with `cmux browser open <url> --json`.
2. Wait for `--load-state complete` before interacting.
3. Capture an interactive snapshot for concrete refs.
4. Take a screenshot only after the UI is stable.
5. Record the commands, URL, surface id, and the verification result.

## Surface selection

If multiple cmux surfaces are available, choose the one that matches the target app/session. Do not interact with an unrelated surface.

## Fallback policy

If no cmux surface is available, stop the visual check and mark the check as `BLOCKED`.

Do not switch to Playwright.

If a browser/visual task cannot be completed with cmux-browser, the task MUST be treated as blocked rather than switching to Playwright.

Legacy Playwright artifacts are read-only.

## Evidence and pass criteria

Record command, URL, surface id, snapshot/screenshot reference, observed result, and PASS / FAIL / BLOCKED outcome.

The evidence bundle is the preserved artifact trail for the final verified state.

A `PASS` means the evidence trail is reviewed, cmux was used, and Playwright was not used.

## Verification

```bash
pnpm verify:browser-policy
```
