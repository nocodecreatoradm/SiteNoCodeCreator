# Full-width hero background video — design spec

## Context

The site's hero already has a looping demo video (added in a previous spec/plan,
[2026-07-16-hero-mockup-video-design.md](2026-07-16-hero-mockup-video-design.md)),
shown inside a small hand-drawn browser-mockup frame in the right column of a
two-column hero layout.

The user compared this to hostinger.com/es, which uses a full-bleed background
video behind the hero copy, with a single prominent CTA. They want the same
treatment: the video becomes the entire hero's background, edge to edge, with
the text and CTA overlaid on top, instead of living inside a small contained
mockup box.

This spec covers the hero-section redesign only. It supersedes the previous
spec's mockup-container approach for the hero (that spec's HTML/CSS structure
for `.mockup`/`.hero__art` is removed here) but keeps its JS
autoplay/reduced-motion pattern, which is reused as-is.

## Decisions made during brainstorming

- **Layout**: full redesign (not a small tweak) — video becomes the hero's
  background at 100% width/height, text overlays on top. No more two-column
  grid.
- **Badge removed**: the "Disponible para nuevos proyectos · Surco, Lima"
  badge is dropped from the hero entirely (user's explicit request) — not
  moved elsewhere.
- **CTA**: single button only — "Cotiza tu proyecto por WhatsApp". The
  secondary "Ver servicios" button is removed from the hero (it remains
  reachable via the nav menu, unchanged).
- **Video content**: a new Veo-generated clip replacing the old
  "browser-mockup morph" concept (which only worked at small size). New
  clip: an abstract, out-of-focus loop of glowing code scrolling on a dark
  screen, in navy/purple tones — no readable text, no people, no logos. The
  user has already generated this and replaced
  `assets/video/hero-demo.mp4`. It has been re-compressed (audio stripped,
  H.264, 1280×720, ~1.05 MB, 10s loop) and a new poster frame extracted to
  `assets/video/hero-demo-poster.jpg` — both files are ready to use as-is;
  no further asset work is in scope.
- **Text contrast**: option B from the visual comparison — a lateral
  gradient overlay, dark on the left (where the text sits) fading to
  transparent on the right (where the video shows clearly), rather than a
  flat uniform dark veil over the whole video or a top/bottom "movie
  poster" treatment.
- **Mobile**: same video background on all screen sizes (no static-image
  fallback for mobile) — confirmed acceptable given the video is already
  small (~1MB).
- **Reduced motion**: reuse the exact existing pattern (poster-only, no
  autoplay) — no new behavior needed here.

## Current structure being replaced

In `index.html` (~lines 55–107), `.hero` is a two-column CSS grid
(`.hero__copy` | `.hero__art`), constrained to `max-width: 1280px`, with the
video currently living inside `.hero__art > .mockup > .mockup__inner >
.mockup__body` as `.mockup__video` (added by the prior spec/plan).

In `css/style.css`, the relevant existing rules are:
- `.hero` (~line 295): `display: grid; grid-template-columns: 1.1fr 0.9fr; max-width: 1280px; padding: 96px 6vw 88px;` — this container width/padding model moves down a level (see below).
- `.hero__copy` (~line 304): just an animation rule today; becomes the
  constrained-width content wrapper.
- `.badge` / `.badge__dot` (~lines 306–318): deleted (badge removed from
  hero; not used anywhere else on the page — verify before deleting).
- `.hero__title`, `.hero__subtitle`, `.hero__actions`, `.hero__stats`,
  `.stat__value`, `.stat__label` (~lines 320–339): kept, but colors need to
  invert from dark-on-light to light-on-dark (see Styling below).
- `.hero__art`, `.mockup`, `.mockup__inner`, `.mockup__bar*`,
  `.mockup__body`, `.mockup__nav-row`, `.mockup__nav-dot`,
  `.mockup__nav-link`, `.mockup__nav-cta`, `.mockup__video` (~lines
  341–412 per the prior plan's numbering): all deleted — the mockup
  concept is fully replaced by the full-bleed background.
- The `gentleFloat` keyframe (~line 127) is used only by `.mockup`
  (line ~347) — becomes dead and should be deleted once `.mockup` is gone
  (verify no other rule references it before deleting).
- Mobile overrides in the `@media (max-width: 860px)` and
  `@media (max-width: 640px)` blocks (~lines 711–728) that target `.hero`'s
  grid, `.hero__art`, and `.mockup*` are deleted/rewritten for the new
  structure (see Responsive below).

## New structure

**HTML** (`index.html`): within `<section class="hero" id="top">`, replace
the two-column contents with:

```html
<section class="hero" id="top">
  <video class="hero__video" muted loop playsinline
         poster="assets/video/hero-demo-poster.jpg" aria-hidden="true">
    <source src="assets/video/hero-demo.mp4" type="video/mp4">
  </video>
  <div class="hero__overlay" aria-hidden="true"></div>
  <div class="hero__copy">
    <h1 class="hero__title">Tu web o app, profesional y lista en semanas.</h1>
    <p class="hero__subtitle">NoCode Creator diseña y desarrolla páginas web, plataformas y aplicaciones a medida, con procesos ágiles y estándares profesionales. Soluciones funcionales, a un costo justo, para emprendedores y empresas.</p>
    <div class="hero__actions">
      <a href="#" class="btn btn--primary js-wa-link" target="_blank" rel="noopener">Cotiza tu proyecto por WhatsApp</a>
    </div>
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
  </div>
</section>
```

The `.badge` block and the "Ver servicios" link are simply not carried over.
`aria-hidden="true"` on both the video and the overlay div, same reasoning
as before: decorative only, the heading/subtitle carry the real content for
assistive tech.

**CSS** (`css/style.css`):

- `.hero`: becomes `position: relative; overflow: hidden; display: flex;
  align-items: center; min-height: 640px;` (no `max-width`, no grid, no
  horizontal padding — it must span the full viewport width for the video
  to bleed edge to edge). The `min-height` gives the video real vertical
  presence now that content height no longer comes from a two-column
  layout matched to a mockup graphic — 640px is a starting point, adjust
  during implementation if the hero looks too short/tall against real
  content.
- `.hero__video`: new rule — `position: absolute; inset: 0; width: 100%;
  height: 100%; object-fit: cover; z-index: 0;`
- `.hero__overlay`: new rule — `position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(90deg, rgba(10,6,30,0.85) 0%,
  rgba(10,6,30,0.55) 45%, rgba(10,6,30,0.05) 75%);` (same stops used in the
  approved mockup comparison; adjust exact color/stops during
  implementation to match the actual video's tones if needed — the
  approved shape is dark-left-fading-to-transparent-right).
- `.hero__copy`: absorbs the outer container's old width/padding —
  `position: relative; z-index: 2; max-width: 1280px; margin: 0 auto;
  padding: 96px 6vw 88px; width: 100%;` (keeps its existing `animation:
  floatUp .6s ease both;`).
- `.hero__title`: add `max-width: 640px;` (previously constrained by the
  grid column width, now needs its own cap so it doesn't stretch across
  the full 1280px container). Color changes from `var(--text-heading)`
  (dark) to a light/white color suited to the dark overlay — pick a value
  consistent with the site's existing color-token approach (`oklch()`
  functions elsewhere in the file), e.g. near-white.
- `.hero__subtitle`: color changes from `var(--text-body-strong)` (dark) to
  a light gray suited to the dark background; keep its existing
  `max-width: 520px`.
- `.stat__value`, `.stat__label`: colors change from dark
  (`oklch(0.3 0.15 300)` / `var(--text-muted)`) to light equivalents
  readable against the dark overlay.
- `.hero__actions`: unchanged rule (`display: flex; gap: 14px;
  flex-wrap: wrap;`), just now contains a single link instead of two.
- Delete: `.badge`, `.badge__dot`, `.hero__art`, `.mockup`,
  `.mockup__inner`, `.mockup__bar`, `.mockup__bar-icon`,
  `.mockup__bar-url`, `.mockup__body`, `.mockup__nav-row`,
  `.mockup__nav-dot`, `.mockup__nav-link`, `.mockup__nav-cta`,
  `.mockup__video`, and the `gentleFloat` keyframe.

**Responsive**: rework the `.hero`-related rules inside the existing
`@media (max-width: 860px)` and `@media (max-width: 640px)` blocks — remove
the now-nonexistent `.hero__art`/`.mockup*` overrides, remove the
grid-column override (no grid anymore), and add a mobile-specific
`.hero__overlay` background that covers more of the width (e.g. push the
transparent stop further right, or raise the opacity) so the text stays
legible when the single column is narrow and the "clear video" area would
otherwise sit mostly behind wrapped text. Also re-check `.hero__title`'s
`max-width: 640px` doesn't fight the narrower viewport (it won't, since
viewport width already caps it below 640px on phones).

## JS

No changes to the autoplay/reduced-motion gating logic in `js/main.js`
(added by the prior plan) beyond updating the selector: the video's class
renames from `.mockup__video` to `.hero__video`, so the existing
`document.querySelector('.mockup__video')` call must be updated to
`document.querySelector('.hero__video')`. `.mockup__video` does not appear
anywhere else in the codebase (per the delete list above). No other JS
logic changes.

## Out of scope

- Regenerating, re-cropping, or further tuning the video/poster assets —
  already done by the user and confirmed acceptable.
- Any section other than the hero (portfolio, services, etc.).
- Adding a scroll-cue, additional hero animations, or other Hostinger
  hero elements (search bar, promo banner) not discussed.
