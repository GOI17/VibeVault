# Browser workflow for VibeVault

## Scope

Use **cmux-browser** for visual/browser checks in this repository.
Do **not** introduce new Playwright usage for this change context.

## Standard flow

1. Open the target app or route with `cmux browser open <url> --json`.
   - If multiple cmux surfaces are available, choose the one that matches the target app/session.
   - Do not interact with an unrelated surface.
2. Wait for `--load-state complete` before interacting.
3. Capture an interactive snapshot for concrete refs.
4. Take a screenshot only after the UI is stable.
5. Record the commands, URL, surface id, and the verification result.

## Evidence capture standards

Every browser check should produce a small evidence bundle:

- The evidence bundle is the preserved artifact trail for the final verified state.

- `summary.md` — what was checked, expected result, actual result
- `surface.yml` or snapshot output — interactive refs used for the check
- `screen.png` — final visual state when the check is visual
- `console.log` — only when console output is relevant to the result

Recommended note format:

```md
## Check
- Surface: surface:N
- URL: <url>
- Viewport: <size>
- Commands: <cmux commands>

## Result
- PASS / FAIL / BLOCKED
- Evidence: <files>
```

## Fallback when cmux is unavailable

If no cmux surface is available, stop the visual check and use the safest fallback:

1. Verify whether a previous snapshot already exists.
2. Use existing static evidence files only for reference.
3. Capture the blocker in markdown and mark the check as `BLOCKED`.
4. Do **not** switch to Playwright.
5. If a browser/visual task cannot be completed with cmux-browser, the task MUST be treated as blocked rather than switching to Playwright.

## Compliance verification

Run the policy harness non-interactively:

```bash
npm run verify:browser-policy
```

Optional report capture:

```bash
npm run verify:browser-policy -- --report ./tmp/browser-policy-report.md
```

Interpretation:

- `PASS` / exit code `0`: all documented policy scenarios are satisfied.
- `FAIL` / exit code `1`: at least one policy scenario is missing or inconsistent.
- `BLOCKED`: cmux is unavailable; do **not** retry with Playwright.
- Do not switch to Playwright.
- A `PASS` means the evidence trail is reviewed, cmux was used, and Playwright was not used.
- Violation detection is actionable: report the missing step, the rule name, and the evidence gap.

## Scenario coverage

The harness checks seven policy scenarios:

1. Normal cmux validation flow is documented.
2. Multiple cmux surfaces are handled explicitly.
3. Playwright fallback is forbidden.
4. Post-interaction evidence is required.
5. cmux unavailable path blocks the task.
6. Compliance pass criteria are documented.
7. Violation detection is actionable and runnable.

## Guardrails

- `.playwright-mcp/` is legacy evidence only.
- Do not add Playwright scripts, dependencies, or workflow steps.
- Prefer `cmux browser` commands for all new browser checks.
- If a future task explicitly requests Playwright, handle that as a separate change.
