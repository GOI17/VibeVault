# Exploration: home-ui-parity-fix

### Current State
- Home renders **three separate chrome layers**: `Header` (logo + search input + avatar + chips), `app/tabs/home/index.tsx` (hero + second chip row), and `MasonryList` (mobile `Switch to list` toggle).
- The category chips are **duplicated** and the home-local chip state does not affect data; it only changes local visual selection.
- The masonry layout toggle is implemented in the shared `components/Masonry.tsx`, so removing it blindly would also affect favorites/search.
- The design refs show a single top shell with search/avatar, one chip row, and masonry content directly underneath.

### Affected Areas
- `components/Header.tsx` — owns the shared home shell; likely where the single category row should live.
- `app/tabs/home/index.tsx` — currently adds the extra hero and duplicated chips; should be reduced to content-only home rendering.
- `components/Masonry.tsx` — contains the legacy `Switch to list` control; should become configurable or be hidden on Home only.
- `app/_layout.tsx` — header height/stack spacing may need tuning after shell cleanup.
- `constants/Colors.ts` — only if chip/surface contrast needs minor theme matching.

### Approaches
1. **Minimal parity patch** — remove the home screen hero + local chip row, and make the masonry toggle opt-in/disabled on Home.
   - Pros: smallest blast radius; preserves favorite/search behavior elsewhere.
   - Cons: still leaves the current header search-logo layout to reconcile later if design parity is strict.
   - Effort: Low/Medium

2. **Shell consolidation** — move the entire Home chrome into `Header` (single chips row, avatar, search affordance), keep `Home` content-only, and make the masonry toggle route-specific.
   - Pros: matches the reference structure most closely; removes duplication at the source.
   - Cons: broader surface area; needs careful spacing and search-navigation verification.
   - Effort: Medium

### Recommendation
Take the **shell consolidation** path, but implement it in stages: first remove `app/tabs/home/index.tsx` chrome duplication and gate the masonry toggle, then tune `Header`/layout spacing to match the refs. This keeps behavior stable while converging the UI to the reference instead of layering fixes.

### Risks
- Shared `MasonryList` changes can unintentionally remove the list/grid switch from other screens.
- `Header` spacing is coupled to `app/_layout.tsx`; changing one without the other can create gaps/overlap.
- The search affordance may need an interaction decision (icon button vs input pill) to preserve current navigation behavior.
- Visual parity may still need a final pass against light/dark refs for chip sizing and vertical rhythm.

### Ready for Proposal
Yes — the next step is a small proposal/design pass that decides whether search remains an input pill or becomes a button-driven entry point before implementation.
