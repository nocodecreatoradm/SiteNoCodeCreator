# 005 — Stagger the hero stats entrance

- **Status**: TODO
- **Commit**: 599da54
- **Severity**: LOW
- **Category**: Missed opportunity / Cohesion (stagger)
- **Estimated scope**: 1 file (`css/style.css`), ~20 lines added

## Problem

`index.html:68-81` — the three hero stat blocks (100% / Semanas / 1:1) currently have no entrance animation of their own. They appear as part of the single `.hero__copy` block's existing `floatUp` animation (`css/style.css:319`, `animation: floatUp .6s ease both;`), which moves the entire hero text column (badge-less title, subtitle, button, AND stats) as one undifferentiated unit. The three numbers — the part of the hero most directly making the "why us" case — don't get any distinct visual emphasis of their own; they just arrive already-visible at the same instant as everything else.

```html
<!-- index.html:68-81 -->
      <div class="hero__stats">
        <div class="stat">
          <div class="stat__value">100%</div>
          <div class="stat__label">Sin código</div>
        </div>
        <div class="stat">
          <div class="stat__value">Semanas</div>
          <div class="stat__label">no meses, de entrega</div>
        </div>
        <div class="stat">
          <div class="stat__value">1:1</div>
          <div class="stat__label">Sin intermediarios</div>
        </div>
      </div>
```

(Note: a literal numeric "count-up" animation was considered and rejected — only the first stat, "100%", is actually numeric; "Semanas" is a word and "1:1" is a ratio, so a count-up effect wouldn't cleanly apply to two of the three. A staggered fade/rise-in works uniformly for all three regardless of content type.)

## Target

Give the three `.stat` blocks their own staggered entrance, timed to start just as the parent `.hero__copy`'s `floatUp` animation is finishing (600ms), so the headline/subtitle/button settle first and the three numbers cascade in right after — a distinct "and here's the proof" beat.

```css
/* new keyframe, place near the existing floatUp keyframe at css/style.css:123-126 */
@keyframes statRise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* replace css/style.css:340, .hero__stats rule */
.hero__stats { display: flex; gap: 34px; margin-top: 48px; }
.hero__stats .stat {
  opacity: 0;
  animation: statRise .5s var(--ease-out) both;
}
.hero__stats .stat:nth-child(1) { animation-delay: 500ms; }
.hero__stats .stat:nth-child(2) { animation-delay: 560ms; }
.hero__stats .stat:nth-child(3) { animation-delay: 620ms; }

@media (prefers-reduced-motion: reduce) {
  .hero__stats .stat { animation: none; opacity: 1; }
}
```

This plan depends on the `--ease-out` token existing (added by plan 002, or defensively by plan 004). If neither has run yet, add it yourself per Step 1 below.

## Repo conventions to follow

- Keyframes are declared near the top of `css/style.css` (`floatUp` at `css/style.css:123-126`, `gentleFloat`-style patterns elsewhere in the file's history) — add `statRise` directly after the existing `floatUp` keyframe block for discoverability.
- 60ms stagger increments match the AUDIT playbook's recommended 30-80ms stagger range for group entrances — do not use a larger gap (the three stats should read as one coordinated moment, not a slow trickle).
- `animation: ... both` (matching `floatUp`'s own `both` fill-mode at `css/style.css:319`) ensures each `.stat` stays at its `to` state after the animation ends rather than snapping back to its initial CSS — follow this same pattern, don't use `forwards` alone or omit fill-mode.

## Steps

1. In `css/style.css`, check whether `:root` already has `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` (added by plan 002 or plan 004). If not, add it to `:root` (`css/style.css:1-32`) as the last line before the closing brace.

2. In `css/style.css`, find the `floatUp` keyframe block (currently `css/style.css:123-126`):

   ```css
   @keyframes floatUp {
     from { opacity: 0; transform: translateY(14px); }
     to { opacity: 1; transform: translateY(0); }
   }
   ```

   Add a new keyframe block immediately after it:

   ```css
   @keyframes statRise {
     from { opacity: 0; transform: translateY(10px); }
     to { opacity: 1; transform: translateY(0); }
   }
   ```

3. In `css/style.css`, find the `.hero__stats` rule (currently `css/style.css:340`):

   ```css
   .hero__stats { display: flex; gap: 34px; margin-top: 48px; }
   ```

   Replace it with:

   ```css
   .hero__stats { display: flex; gap: 34px; margin-top: 48px; }
   .hero__stats .stat {
     opacity: 0;
     animation: statRise .5s var(--ease-out) both;
   }
   .hero__stats .stat:nth-child(1) { animation-delay: 500ms; }
   .hero__stats .stat:nth-child(2) { animation-delay: 560ms; }
   .hero__stats .stat:nth-child(3) { animation-delay: 620ms; }
   ```

4. In `css/style.css`, find the existing reduced-motion block. If plan 002 has already run, it will look like:

   ```css
   @media (prefers-reduced-motion: reduce) {
     .bg-scene__blob { animation: none; }
     .bg-scene__layer { transform: none !important; }
     [data-reveal] { transform: none; transition: opacity .3s ease; }
   }
   ```

   (If plan 002 hasn't run yet, it will instead just have the first two lines — either way, add to whatever version you find.) Add one more line inside it:

   ```css
     .hero__stats .stat { animation: none; opacity: 1; }
   ```

## Boundaries

- Do NOT change the `.stat__value`/`.stat__label` text or styling (font sizes, colors) — only the `.stat` container's entrance animation.
- Do NOT change `.hero__copy`'s own `floatUp` animation or its timing — this plan only adds a second, later animation on the stats, it doesn't touch the parent's existing one.
- Do NOT apply this stagger pattern to any other repeated group on the page (services cards, portfolio cards) — that's plan 006's separate scope.
- If `.hero__stats` at the cited line doesn't match the "before" snippet exactly (drift since commit 599da54), STOP and report instead of guessing where to insert.

## Verification

- **Mechanical**: no build step in this repo. Open `index.html` in a browser and confirm no console errors.
- **Feel check**: reload the homepage and watch the hero load in:
  - The heading/subtitle/button should settle first (via the existing `floatUp`), and the three stat numbers should cascade in shortly after, left to right, each offset by about 60ms — not all three popping in simultaneously.
  - In DevTools, set Animations panel playback to 10% and confirm the three `.stat` animations start at staggered times (500ms/560ms/620ms) rather than together.
  - Toggle `prefers-reduced-motion` (Rendering panel) to `reduce`, reload, and confirm all three stats are simply visible immediately with no animation and no stagger delay (not stuck at `opacity: 0`).
- **Done when**: the three hero stats visibly cascade in after the headline on page load, and reduced-motion users see them immediately with no animation.
