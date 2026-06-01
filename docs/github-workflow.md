# GitHub Workflow

VibeVault uses issue forms and approval before implementation.

## Issue workflow

- Use `.github/ISSUE_TEMPLATE/` forms.
- Blank issues are disabled.
- New issues start with `status:needs-review`.
- Maintainers add `status:approved` before implementation PRs.

## PR guardrails

- Link the approved issue in the PR body.
- Use conventional commits.
- Do not add `Co-Authored-By` or AI attribution trailers.
- Keep docs-only PRs docs-only unless the issue asks for code.
