# 001 — Animate the FAQ accordion open/close

- **Status**: TODO
- **Commit**: 599da54
- **Severity**: MEDIUM
- **Category**: Interruptibility / Missed opportunity
- **Estimated scope**: 2 files (`index.html`, `css/style.css`), ~30 lines added

## Problem

The FAQ section uses native `<details>`/`<summary>` elements with zero custom animation. Opening and closing snaps instantly (native browser behavior), and there is no visual indicator (chevron/plus icon) showing expanded vs. collapsed state beyond the text itself.

`index.html:258-261` (one of five identical items — all five FAQ entries have this exact structure):

```html
      <details class="faq-item">
        <summary>¿Necesito saber programar para trabajar contigo?</summary>
        <p>No. Cuéntanos qué necesitas y nosotros nos encargamos de construirlo — no requieres ningún conocimiento técnico.</p>
      </details>
```

`css/style.css:508-523` — current FAQ styling, no transition on open/close:

```css
/* ---------- FAQ ---------- */
.faq-list { display: flex; flex-direction: column; gap: 14px; }
.faq-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 24px;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.faq-item:hover { border-color: oklch(0.75 0.08 300); box-shadow: 0 8px 20px -14px var(--shadow-navy); }
.faq-item summary {
  font-weight: 600; font-size: 16px; color: var(--text-heading);
  cursor: pointer; list-style: none;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item p { font-size: 14.5px; line-height: 1.65; color: var(--text-body); margin: 12px 0 0; }
```

Native `<details>` cannot smoothly animate open→closed with pure CSS in all browsers (when the `open` attribute is removed, the browser stops rendering the content instantly, cutting off any CSS transition — this is why `@starting-style`/`transition-behavior: allow-discrete` tricks only work in the newest Chromium and are not safe to rely on here without a fallback). The reliable, broadly-supported fix is to intercept the click, drive the animation with our own class, and let JS keep the native `open` attribute in sync so screen readers and keyboard users still get correct semantics.

## Target

Each FAQ answer gets wrapped in a `.faq-item__content` div that animates height via the `grid-template-rows: 0fr → 1fr` technique (avoids measuring pixel heights in JS). A `::after` pseudo-element on `summary` becomes a rotating "+" indicator. JS intercepts the `summary` click so the collapse transition can actually play before the native `open` attribute is removed.

Target markup (repeat this structure for all five `<details class="faq-item">` blocks in `index.html:258-277`):

```html
      <details class="faq-item">
        <summary>¿Necesito saber programar para trabajar contigo?</summary>
        <div class="faq-item__content">
          <p>No. Cuéntanos qué necesitas y nosotros nos encargamos de construirlo — no requieres ningún conocimiento técnico.</p>
        </div>
      </details>
```

Target CSS (replace the block at `css/style.css:508-523`):

```css
/* ---------- FAQ ---------- */
.faq-list { display: flex; flex-direction: column; gap: 14px; }
.faq-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 24px;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.faq-item:hover { border-color: oklch(0.75 0.08 300); box-shadow: 0 8px 20px -14px var(--shadow-navy); }
.faq-item summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-weight: 600; font-size: 16px; color: var(--text-heading);
  cursor: pointer; list-style: none;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after {
  content: "+";
  flex-shrink: 0;
  font-size: 20px;
  font-weight: 400;
  color: var(--blue);
  transition: transform 200ms var(--ease-out);
}
.faq-item.is-open summary::after { transform: rotate(45deg); }
.faq-item__content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 250ms var(--ease-out);
}
.faq-item.is-open .faq-item__content { grid-template-rows: 1fr; }
.faq-item__content > p {
  overflow: hidden;
  font-size: 14.5px; line-height: 1.65; color: var(--text-body); margin: 0;
  padding-top: 0;
}
.faq-item.is-open .faq-item__content > p { padding-top: 12px; }

@media (prefers-reduced-motion: reduce) {
  .faq-item summary::after,
  .faq-item__content { transition: none; }
}
```

Note: `.faq-item__content > p` needs its own `overflow: hidden` because a CSS grid row animating from `0fr` still lets its content overflow the collapsed row visually unless the content itself also clips.

This plan depends on the `--ease-out` token existing. If plan 002 (`002-reveal-easing-and-reduced-motion.md`) has already run, `--ease-out` is already in `:root` — skip re-adding it. If this plan runs first, add it yourself as Step 1 below.

## Repo conventions to follow

- All existing hover/interaction transitions in `css/style.css` use the pattern `transition: <prop> <duration> <easing>` inline per rule (no separate transition-timing-function declarations) — follow this style.
- The reduced-motion override for decorative motion lives in a single `@media (prefers-reduced-motion: reduce) { ... }` block at `css/style.css:115-118` today (for `.bg-scene__blob`/`.bg-scene__layer`). For this plan, add the FAQ's reduced-motion rule as its own new `@media (prefers-reduced-motion: reduce)` block placed directly after the FAQ CSS block (co-locating it with the feature it affects, matching how this plan's neighbor — plan 002 — also adds its own dedicated reduced-motion handling rather than always centralizing).
- `.faq-item:hover` already exists and should be left untouched by this plan (plan 003 handles touch-hover gating separately).

## Steps

1. In `css/style.css`, check whether `:root` (top of file, `css/style.css:1-32`) already contains `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`. If it does not, add it as the last line inside the `:root { ... }` block, right before the closing `}` at `css/style.css:32`.

2. In `css/style.css`, replace the FAQ block currently at `css/style.css:508-523` with the "Target CSS" block shown above (including the new `@media (prefers-reduced-motion: reduce)` block at the end).

3. In `index.html`, for each of the five `<details class="faq-item">...</details>` blocks between `index.html:258` and `index.html:277`, wrap the `<p>` element in a `<div class="faq-item__content">`, exactly as shown in "Target markup" above. Do this for all five — the five questions are: "¿Necesito saber programar para trabajar contigo?", "¿Cuánto tiempo toma un proyecto?", "¿Qué pasa si necesito cambios después de la entrega?", "¿Es seguro y escalable lo que se construye sin código tradicional?", "¿Cómo empezamos?". Do not change the question/answer text itself.

4. In `js/main.js`, add this new block. Insert it after the closing `}` of the reveal-on-scroll block (currently ending at `js/main.js:38`) and before the blank line/contact-form block (currently starting at `js/main.js:40`):

```javascript
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const summary = item.querySelector('summary');
    const content = item.querySelector('.faq-item__content');
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (item.classList.contains('is-open')) {
        item.classList.remove('is-open');
        content.addEventListener('transitionend', () => { item.open = false; }, { once: true });
      } else {
        item.open = true;
        requestAnimationFrame(() => item.classList.add('is-open'));
      }
    });
  });
```

## Boundaries

- Do NOT touch any other section's markup (services, portfolio, pricing, about, contact) — only the FAQ `<details>` blocks.
- Do NOT change the FAQ question/answer copy.
- Do NOT add a new easing token if `--ease-out` already exists (check first, per Step 1).
- If the FAQ markup you find doesn't match the "Current" excerpt above (e.g. a `<div class="faq-item__content">` already exists from a previous partial run), STOP and report instead of double-wrapping.

## Verification

- **Mechanical**: no build step in this repo. Open `index.html` in a browser and confirm no console errors after the JS change.
- **Feel check**: open the FAQ section, click a question, and confirm:
  - The answer expands smoothly over ~250ms rather than snapping open instantly.
  - The "+" icon rotates 45° (into an "×" look) when open, and rotates back when closed.
  - Clicking a second question while the first is still open does not break either — both can be open simultaneously (this matches native `<details>` behavior, which does not auto-collapse siblings; do not add that behavior, it's out of scope).
  - Click the same question twice in quick succession (open, then immediately close before the open transition finishes) — the close transition should still play smoothly, not jump or glitch, since `transition-delay` retargets rather than restarting from a fixed keyframe.
  - In DevTools, set Animations panel playback to 10% and confirm the grid-row height and the icon rotation happen together, not sequentially.
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm the accordion still opens/closes (state still changes) but without the smooth transition — it should snap, matching pre-change behavior for reduced-motion users.
- **Done when**: all five FAQ items animate open/close smoothly with a rotating indicator, and reduced-motion users get instant (non-animated) toggling.
