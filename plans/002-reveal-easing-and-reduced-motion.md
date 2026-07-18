# 002 — Strengthen the scroll-reveal easing and gate its movement behind reduced-motion

- **Status**: TODO
- **Commit**: 599da54
- **Severity**: MEDIUM
- **Category**: Easing & duration / Accessibility
- **Estimated scope**: 1 file (`css/style.css`), ~10 lines changed/added

## Problem

`css/style.css:373-382` — the scroll-triggered reveal animation used on every major section of the page (`[data-reveal]`, toggled to `.is-visible` by `js/main.js:22-38`'s `IntersectionObserver`) uses the browser's built-in `ease` timing function, which is comparatively weak/generic:

```css
/* reveal-on-scroll */
[data-reveal] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity .7s ease, transform .7s ease;
}
[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

This same weak `ease` is reused across nearly every hover transition in the file too, but this specific rule is the highest-leverage fix: it is the one animation pattern every visitor sees repeatedly while scrolling the page (it fires on the hero's sibling sections: services, proceso, portafolio, precios, about, FAQ, contacto — every `<section data-reveal>` in `index.html`).

Separately: this rule animates `transform: translateY(28px)`, which is real on-screen movement, but there is no `prefers-reduced-motion` handling for it anywhere in the file. The only existing reduced-motion coverage (`css/style.css:115-118`) is scoped to the animated background blobs, not this reveal pattern. A user with motion sensitivity who has `prefers-reduced-motion: reduce` set currently still gets the full 28px slide-up on every section as they scroll.

## Target

Replace the weak `ease` with the strong custom `--ease-out` curve (added as a new token), and add a reduced-motion override that keeps the opacity fade but removes the slide movement, per the standard "keep opacity/color, drop movement" reduced-motion pattern.

```css
/* :root, add as the last declaration before the closing brace */
:root {
  /* ...existing tokens... */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}

/* reveal-on-scroll */
[data-reveal] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity .7s var(--ease-out), transform .7s var(--ease-out);
}
[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

Add this new rule to the existing reduced-motion media query block:

```css
@media (prefers-reduced-motion: reduce) {
  .bg-scene__blob { animation: none; }
  .bg-scene__layer { transform: none !important; }
  [data-reveal] { transform: none; transition: opacity .3s ease; }
}
```

## Repo conventions to follow

- Custom properties live in `:root` at the very top of `css/style.css:1-32` (colors, shadows — no easing/duration tokens exist yet; this plan and plan 004 are what introduce them).
- The single existing `@media (prefers-reduced-motion: reduce)` block is at `css/style.css:115-118` — extend it rather than creating a second, separate reduced-motion media query elsewhere in the file (plan 001 is an intentional exception, adding its own co-located block right next to the FAQ-specific feature it affects — for this plan, since `[data-reveal]` is a page-wide pattern already represented in the existing shared block, add to that shared block instead).
- 700ms duration is intentional and should NOT be shortened — per this project's animation audit, marketing/explanatory motion (which this is) is allowed longer durations than interactive UI (buttons, dropdowns). Do not "fix" the duration, only the easing function and the reduced-motion gap.

## Steps

1. In `css/style.css`, open the `:root { ... }` block (`css/style.css:1-32`). Add one new line right before the closing `}` (currently `css/style.css:32`):

   ```css
     --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
   ```

2. In `css/style.css`, find the reveal-on-scroll block (currently `css/style.css:373-382`). Change both `transition` declarations from using bare `ease` to `var(--ease-out)`:

   ```css
   /* reveal-on-scroll */
   [data-reveal] {
     opacity: 0;
     transform: translateY(28px);
     transition: opacity .7s var(--ease-out), transform .7s var(--ease-out);
   }
   [data-reveal].is-visible {
     opacity: 1;
     transform: translateY(0);
   }
   ```

3. In `css/style.css`, find the existing reduced-motion block (currently `css/style.css:115-118`):

   ```css
   @media (prefers-reduced-motion: reduce) {
     .bg-scene__blob { animation: none; }
     .bg-scene__layer { transform: none !important; }
   }
   ```

   Add one new line inside it, after `.bg-scene__layer { transform: none !important; }`:

   ```css
     [data-reveal] { transform: none; transition: opacity .3s ease; }
   ```

## Boundaries

- Do NOT touch any other transition in the file (button hovers, card hovers, nav, etc.) — those are plan 004's scope.
- Do NOT shorten or lengthen the 700ms duration.
- Do NOT change the `28px` translate distance.
- Do NOT change how/when `.is-visible` gets added (that's `js/main.js`, out of scope for this CSS-only plan).
- If `--ease-out` already exists in `:root` when you start (e.g. plan 001 or plan 004 already ran), skip Step 1 and just confirm the value matches `cubic-bezier(0.23, 1, 0.32, 1)` exactly — if it's different, STOP and report the mismatch instead of overwriting it.

## Verification

- **Mechanical**: no build step in this repo. Open `index.html` in a browser and confirm no console errors.
- **Feel check**: scroll down the homepage slowly past the "Servicios" section boundary and confirm:
  - The section fades and slides up noticeably more "snappy"/decisive at the start of the motion compared to before (strong ease-out starts fast) — compare by temporarily reverting to `ease` in a second tab if you want a side-by-side.
  - In DevTools, set Animations panel playback to 10% and scrub through one section's reveal — confirm the motion is fast at the start and settles gently at the end (the signature of a strong ease-out), not a linear or slow-starting motion.
  - Toggle `prefers-reduced-motion` (Rendering panel) to `reduce`, reload, and scroll past a section: confirm it fades in (opacity change) WITHOUT any visible slide/translate movement.
- **Done when**: all `[data-reveal]` sections use the new easing token, and reduced-motion users see fade-only (no slide) reveals.
