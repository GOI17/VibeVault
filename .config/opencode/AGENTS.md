# VibeVault workflow policy

- For browser/visual validation in the `Before continue, stop using playwright, start using cmux-browswer skill` change context, use **cmux-browser** only.
- Do **not** add or use Playwright for browser/visual validation in this context.
- If no usable cmux surface is available, **block** the task and report the blocker. Do not fall back to Playwright.
- Required flow: select the matching cmux surface, wait for load, capture a snapshot, interact, then capture post-action evidence.
- Run `npm run verify:browser-policy` to check the policy docs and workflow guardrails.
