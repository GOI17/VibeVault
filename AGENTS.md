# Code Review Rules

## Reviewer Output Contract
- First line MUST be exactly `STATUS: PASSED` or `STATUS: FAILED`.
- If failed, list only concrete file/line rule violations.
- Do not run shell commands or external tools during review; review staged code statically.

## TypeScript
- Use explicit types for public interfaces and exported functions.
- Avoid `any`; prefer specific types or `unknown` with narrowing.
- Keep strict mode compatibility (`tsconfig` strict true).

## React / React Native
- Prefer functional components and hooks.
- Keep presentation concerns separated from data/repository concerns.
- Preserve existing user-facing behavior unless explicitly requested.

## Architecture
- Respect repository abstraction boundaries (`src/domain` contracts, `src/repositories` adapters).
- Validate external data at boundaries.
- Avoid introducing cross-layer coupling.

## Quality
- Ensure `./node_modules/.bin/eslint` and `./node_modules/.bin/tsc --noEmit` are green for touched scope.
