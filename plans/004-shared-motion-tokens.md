# 004 — Introduce shared duration/easing tokens and adopt them across existing transitions

- **Status**: TODO
- **Commit**: 599da54
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file (`css/style.css`), ~20 rules touched

## Problem

`css/style.css` hand-types the same duration/easing combinations dozens of times (`.2s ease` appears 9+ times, `.25s ease` appears 6+ times, plain `ease` with no duration variable anywhere) instead of referencing shared tokens. This makes it easy for future edits to drift (a new component gets `.18s ease` or `.3s ease-in-out` by accident, slightly out of step with everything else) and means a single visual retune (e.g. "make all micro-interactions feel snappier") requires editing 20+ places instead of 2.

Representative examples (not exhaustive — see Steps for the full list):

`css/style.css:135`: `transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;`
`css/style.css:197`: `transition: transform .2s ease;`
`css/style.css:239`: `transition: transform .25s ease, opacity .2s ease;`
`css/style.css:408`: `transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;`

## Target

Add two duration tokens to `:root` alongside the `--ease-out` token (from plan 002 — this plan depends on it existing; see Steps for the defensive check if plan 002 hasn't run yet):

```css
:root {
  /* ...existing tokens... */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --duration-fast: 200ms;
  --duration-base: 250ms;
}
```

Then replace bare `.2s ease` → `var(--duration-fast) var(--ease-out)` and bare `.25s ease` → `var(--duration-base) var(--ease-out)` throughout the file (full list in Steps). Property names and every other part of each declaration stay identical — only the duration+easing pair changes.

Example (`css/style.css:135`, full context is the `.btn` base rule):

```css
/* before */
transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;

/* after */
transition: transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out);
```

## Repo conventions to follow

- `:root` custom properties live at `css/style.css:1-32` — add the two new duration tokens there, next to `--ease-out` (which plan 002 adds, or which you add yourself per Step 1 if plan 002 hasn't run).
- Keep the exact same set of animated properties per rule — this plan only swaps the duration+easing values, never adds/removes which properties transition.

## Steps

1. In `css/style.css`, open `:root { ... }` (`css/style.css:1-32`). Check whether `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` already exists (added by plan 002). If it does not exist yet, add it now. Then add two more lines (whether or not `--ease-out` was already present):

   ```css
     --duration-fast: 200ms;
     --duration-base: 250ms;
   ```

2. Replace every bare `.2s ease` in the file with `var(--duration-fast) var(--ease-out)`, keeping the rest of each declaration (property name, commas, other transitioned properties) exactly as-is. This applies to the `.2s ease` occurrences at (line numbers as of commit 599da54 — re-locate by the exact rule text if line numbers have drifted):
   - `css/style.css:135` (`.btn` — 4 occurrences on one line: transform, box-shadow, background, border-color)
   - `css/style.css:197` (`.nav__brand`)
   - `css/style.css:214` (`.nav__links a:not(.btn)`)
   - `css/style.css:239` (`.nav__burger span` — only the `transform .2s ease` part; the `opacity .2s ease` on the same line is also `.2s` so gets the same replacement)
   - `css/style.css:285` (`.fab-wa`)
   - `css/style.css:515` (`.faq-item`)
   - `css/style.css:571` (contact form input/textarea focus — verify exact selector at this line before editing)

3. Replace every bare `.25s ease` in the file with `var(--duration-base) var(--ease-out)`, same rule (keep property names, only swap the duration+easing pair):
   - `css/style.css:258` (`.nav-mobile` — this one transitions `max-height`, a layout property; leave the property itself as `max-height` unchanged, this plan only touches the duration/easing values, not which property animates)
   - `css/style.css:408` (`.card--service`)
   - `css/style.css:416` (`.card__icon`)
   - `css/style.css:439` (`.card--brand`)
   - `css/style.css:462` (`.card--pricing`)

4. After making the replacements, search the file for any remaining bare `ease` (not already replaced) that you did NOT touch — these are intentionally out of scope (see Boundaries) and should be left as-is. Do not "clean up" anything not explicitly listed in Steps 2–3.

## Boundaries

- Do NOT touch `[data-reveal]`'s `.7s ease`/`.7s var(--ease-out)` — that's plan 002's scope, already using the token if plan 002 ran first (verify, don't re-edit).
- Do NOT touch `:active` press-feedback transitions (`.15s ease` at `css/style.css:589` on `.contact-form button`, or any other `:active`-only rule) — those weren't flagged in the audit and are out of scope.
- Do NOT touch `.faq-item__content`'s `grid-template-rows` transition if plan 001 has already run (that plan introduces its own `250ms var(--ease-out)` already using the token correctly — verify it matches, don't duplicate-edit).
- Do NOT add a `--duration-slow` or any token not listed here — only `--duration-fast` and `--duration-base`.
- Do NOT change which CSS properties are being transitioned — duration/easing values only.
- If any cited line's content doesn't match what's described (drift since commit 599da54), STOP and report that specific line instead of guessing.

## Verification

- **Mechanical**: no build step in this repo. Open `index.html` in a browser and confirm no console errors. Search the final `css/style.css` for the literal string `.2s ease` and `.25s ease` (excluding files this plan explicitly left untouched per Boundaries) — there should be zero remaining matches among the lines listed in Steps 2-3.
- **Feel check**: hover over a few buttons, cards, and the FAQ items (with a mouse) and confirm the transition speed and feel is subjectively unchanged from before this plan — this is a pure refactor (tokenization), not a retune, so nothing should look or feel different, only the underlying CSS values should now reference shared tokens instead of being hand-typed.
- **Done when**: `--duration-fast` and `--duration-base` exist in `:root`, all rules listed in Steps 2–3 reference them (plus `var(--ease-out)`), and no visual regression is present.
