# 006 — Stagger card entrances within the services/portfolio/pricing grids

- **Status**: TODO
- **Commit**: 599da54
- **Severity**: LOW
- **Category**: Cohesion (stagger) / Missed opportunity
- **Estimated scope**: 1 file (`css/style.css`), ~25 lines added

## Problem

The services, portfolio, and pricing sections are each wrapped in a single `<section ... data-reveal>` (`index.html:86`, and the equivalent portfolio/pricing section tags), and `[data-reveal]`'s reveal animation (`css/style.css:373-382`) applies to that one outer section element. The individual `.card--service`, `.card--brand`, and `.card--pricing` cards inside have no opacity/transform state of their own — they simply ride along with their ancestor section's single fade/slide, so all 7 service cards (or 5 portfolio cards, or 3 pricing cards) become visible at exactly the same instant, as one flat block, rather than reading as a coordinated but distinct group entrance.

Relevant grid containers (`index.html`):
- `<div class="grid grid--services">` — 7 `.card--service` children (Landing pages, Sitios web para negocios, Tiendas online, Apps web a medida, Automatizaciones, MVPs para startups, Agentes de IA)
- `<div class="grid grid--portfolio">` — 5 `.card--brand` children
- `<div class="grid grid--pricing">` — 3 `.card--pricing` children

## Target

Give each card type its own hidden→visible state (independent of, but triggered by, the same ancestor `.is-visible` class the section already gets), with a 60ms stagger per card via `nth-child`.

```css
/* add after the existing [data-reveal] rules at css/style.css:373-382 */
[data-reveal] .card--service,
[data-reveal] .card--brand,
[data-reveal] .card--pricing {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity .5s var(--ease-out), transform .5s var(--ease-out);
}
[data-reveal].is-visible .card--service,
[data-reveal].is-visible .card--brand,
[data-reveal].is-visible .card--pricing {
  opacity: 1;
  transform: translateY(0);
}
[data-reveal] .card--service:nth-child(1),
[data-reveal] .card--brand:nth-child(1),
[data-reveal] .card--pricing:nth-child(1) { transition-delay: 0ms; }
[data-reveal] .card--service:nth-child(2),
[data-reveal] .card--brand:nth-child(2),
[data-reveal] .card--pricing:nth-child(2) { transition-delay: 60ms; }
[data-reveal] .card--service:nth-child(3),
[data-reveal] .card--brand:nth-child(3),
[data-reveal] .card--pricing:nth-child(3) { transition-delay: 120ms; }
[data-reveal] .card--service:nth-child(4),
[data-reveal] .card--brand:nth-child(4) { transition-delay: 180ms; }
[data-reveal] .card--service:nth-child(5),
[data-reveal] .card--brand:nth-child(5) { transition-delay: 240ms; }
[data-reveal] .card--service:nth-child(6) { transition-delay: 300ms; }
[data-reveal] .card--service:nth-child(7) { transition-delay: 360ms; }

@media (prefers-reduced-motion: reduce) {
  [data-reveal] .card--service,
  [data-reveal] .card--brand,
  [data-reveal] .card--pricing { transform: none; transition: opacity .3s ease; }
}
```

(`.card--pricing` only has 3 children so its `nth-child` rules stop at 3 — the `nth-child(4)`+ rules simply never match a `.card--pricing` element, which is harmless.)

This plan depends on `--ease-out` existing — see Step 1 for the defensive check, same pattern as plans 002/004/005.

## Repo conventions to follow

- `[data-reveal]`'s own reveal rule lives at `css/style.css:373-382` — place this plan's new rules directly after it, so all scroll-reveal-related CSS stays grouped together in the file.
- Card hover transitions (`.card--service:hover`, etc.) already exist separately (`css/style.css:410` etc., touched by plan 003) — do not merge or conflict with those; this plan only adds the entrance (pre-hover) state.
- Mirrors the same opacity+translateY+`var(--ease-out)` pattern as `[data-reveal]` itself (plan 002) and the hero stats (plan 005) — for consistency, use the same `translateY` direction (upward) though a slightly smaller distance (16px vs. the section's 28px) since these are smaller elements.

## Steps

1. In `css/style.css`, check whether `:root` already has `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` (added by plan 002, 004, or 005). If not, add it to `:root` (`css/style.css:1-32`) as the last line before the closing brace.

2. In `css/style.css`, find the end of the existing `[data-reveal]` block (currently ending at `css/style.css:382`, right before the `/* ---------- Grids & Cards ---------- */` comment). Insert the full "Target" CSS block shown above immediately after it (before the Grids & Cards comment).

## Boundaries

- Do NOT change the grid layout CSS itself (`.grid--services`, `.grid--portfolio`, `.grid--pricing` column/gap rules) — only add the new opacity/transform/transition rules for the cards' entrance.
- Do NOT change card hover behavior (`:hover` rules) — this plan only touches the pre-visible/visible entrance states, which are independent of hover.
- Do NOT add stagger delays beyond `nth-child(7)` — no section has more than 7 cards; don't add speculative `nth-child(8)`+ rules.
- If any of the three grid containers or their card counts don't match what's described (drift since commit 599da54 — e.g. a card was added or removed), STOP and report instead of guessing new nth-child counts.

## Verification

- **Mechanical**: no build step in this repo. Open `index.html` in a browser and confirm no console errors.
- **Feel check**: scroll down to the "Servicios" section slowly and confirm:
  - The 7 service cards visibly cascade in left-to-right, top-to-bottom (following DOM order) rather than all appearing at once.
  - The stagger is subtle — total spread is under 400ms for 7 cards, not a slow trickle.
  - Repeat for the portfolio section (5 cards) and pricing section (3 cards) — same cascading behavior, correctly scaled to fewer cards.
  - In DevTools, set Animations panel playback to 10% and confirm the `transition-delay` stagger is visible frame-by-frame.
  - Toggle `prefers-reduced-motion` (Rendering panel) to `reduce`, reload, and scroll to each grid: cards should fade in together (opacity only, no stagger-driven movement) rather than sliding/cascading.
- **Done when**: all three grids (services, portfolio, pricing) show a staggered card entrance on scroll, and reduced-motion users get a simple simultaneous fade instead.
