# 003 — Gate transform-based hover states behind `(hover: hover) and (pointer: fine)`

- **Status**: TODO
- **Commit**: 599da54
- **Severity**: LOW/MEDIUM
- **Category**: Accessibility (touch correctness)
- **Estimated scope**: 1 file (`css/style.css`), 11 rules rewritten

## Problem

Every `:hover` rule in `css/style.css` that moves or scales an element (`transform: translateY(...)`, `scale(...)`, `translateX(...)`) is ungated — it applies on any pointer, including touch. On a touchscreen, tapping a button or card triggers `:hover` (most mobile browsers apply `:hover` styles on tap and only clear them on the next tap elsewhere, or never clear them until something else is focused), so the element visually stays "lifted" or "scaled up" after the user's finger leaves the screen, until they tap something else. This site's traffic is WhatsApp/mobile-driven, so this affects most visitors, on the elements they interact with most (the primary CTA buttons and every card).

The following 11 rules are affected (all cited exactly as they exist today):

`css/style.css:147`:
```css
.btn--nav:hover { color: #fff; transform: translateY(-2px) scale(1.03); box-shadow: 0 6px 18px oklch(0.55 0.14 240 / 0.45); }
```

`css/style.css:155-156`:
```css
.btn--primary:hover { color: #fff; transform: translateY(-2px); box-shadow: 0 10px 24px var(--shadow-navy); }
.btn--primary:active { transform: translateY(0); }
```

`css/style.css:165`:
```css
.btn--secondary:hover { transform: translateY(-2px); border-color: oklch(0.6 0.13 300); }
```

`css/style.css:177`:
```css
.btn--block:hover { color: #fff; background: var(--navy-hover); transform: scale(1.02); }
```

`css/style.css:200`:
```css
.nav__brand:hover { transform: scale(1.03); color: inherit; }
```

`css/style.css:287-288`:
```css
.fab-wa:hover { color: #fff; transform: scale(1.08); box-shadow: 0 14px 28px -6px oklch(0.5 0.16 150 / 0.7); }
.fab-wa:active { transform: scale(0.96); }
```

`css/style.css:410`:
```css
.card--service:hover { transform: translateY(-6px); box-shadow: 0 16px 32px -18px var(--shadow-navy); border-color: oklch(0.85 0.05 300); }
```

`css/style.css:418`:
```css
.card--service:hover .card__icon { transform: scale(1.08); }
```

`css/style.css:442`:
```css
.card--brand:hover { transform: translateY(-6px); box-shadow: 0 16px 32px -18px var(--shadow-navy); }
```

`css/style.css:464`:
```css
.card--pricing:hover { transform: translateY(-6px); box-shadow: 0 18px 36px -20px var(--shadow-navy); }
```

`css/style.css:545, 547`:
```css
.contact-link--wa:hover { color: var(--green-fg); transform: translateX(4px); box-shadow: 0 8px 18px -12px oklch(0.5 0.14 150 / 0.5); }
.contact-link--mail:hover { color: oklch(0.3 0.03 260); transform: translateX(4px); box-shadow: 0 8px 18px -12px oklch(0.4 0.03 260 / 0.3); }
```

Note: `:active` rules (`.btn--primary:active`, `.fab-wa:active`, `.contact-form button:active` at `css/style.css:592`) are intentionally NOT in scope — `:active` is genuinely touch-appropriate press feedback and should keep firing on tap. Only `:hover` rules with `transform` are in scope. Color-only or box-shadow-only `:hover` rules (e.g. `.nav__links a:not(.btn):hover { color: var(--blue); }` at `css/style.css:216`, `.faq-item:hover` at `css/style.css:517`) are also out of scope — a lingering color/shadow change after a tap is not visually disorienting the way a lingering translate/scale is, so gating those isn't necessary for this fix.

## Target

Wrap each of the 11 rules above in `@media (hover: hover) and (pointer: fine) { ... }`, unchanged otherwise. This media query only matches devices where hover is a real, intentional pointer gesture (mouse, trackpad) — it excludes touchscreens even when a mouse is later attached, and excludes hybrid devices in touch mode.

Example (for `.btn--primary`, `css/style.css:155-156`):

```css
@media (hover: hover) and (pointer: fine) {
  .btn--primary:hover { color: #fff; transform: translateY(-2px); box-shadow: 0 10px 24px var(--shadow-navy); }
}
.btn--primary:active { transform: translateY(0); }
```

(`:active` stays outside the media query, ungated, exactly where it already is.)

## Repo conventions to follow

- This codebase has no existing `(hover: hover)` usage — this plan introduces the pattern for the first time. Keep each wrapped rule exactly where it currently sits in the file (don't relocate rules to a new "touch fixes" section at the bottom) — wrap in place so the cascade order and nearby context (like `:active` siblings) stays intact.
- Preserve exact property values, selectors, and formatting inside each rule — only add the media query wrapper around it.

## Steps

Each step: wrap the cited rule (and only that rule — not neighboring `:active`/other pseudo-class rules unless explicitly listed together above) in `@media (hover: hover) and (pointer: fine) { ... }`, in place.

1. `css/style.css:147` — wrap `.btn--nav:hover { ... }`.
2. `css/style.css:155` — wrap `.btn--primary:hover { ... }` only (leave `.btn--primary:active` on line 156 outside the media query, untouched).
3. `css/style.css:165` — wrap `.btn--secondary:hover { ... }`.
4. `css/style.css:177` — wrap `.btn--block:hover { ... }`.
5. `css/style.css:200` — wrap `.nav__brand:hover { ... }`.
6. `css/style.css:287` — wrap `.fab-wa:hover { ... }` only (leave `.fab-wa:active` on line 288 outside, untouched).
7. `css/style.css:410` — wrap `.card--service:hover { ... }`.
8. `css/style.css:418` — wrap `.card--service:hover .card__icon { ... }`.
9. `css/style.css:442` — wrap `.card--brand:hover { ... }`.
10. `css/style.css:464` — wrap `.card--pricing:hover { ... }`.
11. `css/style.css:545` and `css/style.css:547` — these two rules (`.contact-link--wa:hover`, `.contact-link--mail:hover`) may share a single `@media (hover: hover) and (pointer: fine) { ... }` block together since they're adjacent and both in scope.

## Boundaries

- Do NOT touch `:active` rules — they stay ungated.
- Do NOT touch color-only or box-shadow-only `:hover` rules not listed above (e.g. `.nav__links a:not(.btn):hover`, `.faq-item:hover`, `.contact-form button:hover`, `.footer__links a:hover`) — those are out of scope for this plan.
- Do NOT change any property value inside the 11 rules — this is a wrapping-only change.
- Do NOT consolidate all 11 into one giant shared media-query block at the top/bottom of the file — keep each wrapped in its original location (per "Repo conventions" above), except for the two adjacent contact-link rules in step 11 which may share one block since they're already next to each other.

## Verification

- **Mechanical**: no build step in this repo. Open `index.html` in a browser and confirm no console errors, and confirm (via view-source or DevTools "Sources") that all 11 rules are now nested inside `@media (hover: hover) and (pointer: fine) { }` blocks.
- **Feel check**:
  - On a real touch device (or Chrome DevTools device emulation with touch enabled — note: DevTools' device toolbar simulates touch events but may not perfectly replicate `hover`/`pointer` media query matching in all cases, so a real phone or tablet test is the more reliable check here), tap a `.card--service` card and then move your finger away without tapping anything else. Confirm the card does NOT stay visually lifted/shadowed — it should return to its resting state immediately.
  - Tap the floating WhatsApp button (`.fab-wa`) and confirm it doesn't stay scaled up after the tap.
  - On a real mouse/trackpad (desktop), confirm hovering over the same elements still shows the lift/scale effect exactly as before — this plan must not remove the desktop hover experience, only prevent it from sticking on touch.
- **Done when**: all 11 listed rules are wrapped, touch devices no longer show a "stuck" hover state after tapping, and mouse/trackpad hover behavior is unchanged.
