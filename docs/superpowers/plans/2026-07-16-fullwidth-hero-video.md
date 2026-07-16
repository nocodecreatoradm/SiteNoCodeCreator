# Full-Width Hero Background Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hero's two-column layout (text + contained mockup video) with a full-bleed hero background video and overlaid text, matching the approved design.

**Architecture:** Pure static-site change across `index.html`, `css/style.css`, and `js/main.js`. No build step, no test framework — verification is manual browser inspection (open the page, check DevTools), same approach as the prior hero-video plan.

**Tech Stack:** Vanilla HTML/CSS/JS, no frameworks, no bundler.

## Global Constraints

- Video and poster assets already exist and are final — do not regenerate or re-encode them: `assets/video/hero-demo.mp4` (1280×720, H.264, no audio, ~1.05 MB, 10s loop) and `assets/video/hero-demo-poster.jpg` (fresh frame from the new clip, code-on-screen theme).
- The badge ("Disponible para nuevos proyectos · Surco, Lima") is removed from the hero entirely — not relocated.
- Only one CTA button remains in the hero: "Cotiza tu proyecto por WhatsApp". "Ver servicios" is removed from the hero (stays in the nav menu, untouched).
- The video and its overlay are decorative: `aria-hidden="true"` on both, no HTML `autoplay` attribute — playback stays gated by the existing `prefers-reduced-motion` JS pattern.
- Overlay treatment is a lateral gradient: dark on the left (text side), fading to transparent on the right (clear video), not a flat veil or top/bottom treatment.
- Mobile keeps the same video background (no static-only fallback) — but the overlay gets more coverage on narrow screens so wrapped text stays legible.
- No lazy-loading — the hero renders above the fold and must load immediately.

---

### Task 1: Rewrite hero markup

**Files:**
- Modify: `index.html:55-107`

**Interfaces:**
- Produces: `.hero__video` (video element), `.hero__overlay` (div), `.hero__copy` (wrapper div, already existed, now holds different children) — Task 2 styles all three; Task 4's JS selector depends on `.hero__video` existing.

- [ ] **Step 1: Replace the entire hero section content**

Current content at `index.html:55-107`:

```html
  <!-- HERO -->
  <section class="hero" id="top">
    <div class="hero__copy">
      <div class="badge">
        <span class="badge__dot"></span>
        Disponible para nuevos proyectos · Surco, Lima
      </div>
      <h1 class="hero__title">Tu web o app, profesional y lista en semanas.</h1>
      <p class="hero__subtitle">NoCode Creator diseña y desarrolla páginas web, plataformas y aplicaciones a medida, con procesos ágiles y estándares profesionales. Soluciones funcionales, a un costo justo, para emprendedores y empresas.</p>
      <div class="hero__actions">
        <a href="#" class="btn btn--primary js-wa-link" target="_blank" rel="noopener">Cotiza tu proyecto por WhatsApp</a>
        <a href="#servicios" class="btn btn--secondary">Ver servicios</a>
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
    <div class="hero__art">
      <div class="mockup">
        <div class="mockup__inner">
          <div class="mockup__bar">
            <span class="mockup__bar-icon">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,7 4,12 9,17"/><polyline points="15,7 20,12 15,17"/></svg>
            </span>
            <span class="mockup__bar-url"></span>
          </div>
          <div class="mockup__body">
            <div class="mockup__nav-row">
              <span class="mockup__nav-dot"></span>
              <span class="mockup__nav-link">Inicio</span>
              <span class="mockup__nav-link">Nosotros</span>
              <span class="mockup__nav-cta">Contacto</span>
            </div>
            <video class="mockup__video" muted loop playsinline
                   poster="assets/video/hero-demo-poster.jpg" aria-hidden="true">
              <source src="assets/video/hero-demo.mp4" type="video/mp4">
            </video>
          </div>
        </div>
      </div>
    </div>
  </section>
```

Replace with:

```html
  <!-- HERO -->
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

Note: this removes the `.badge`, the "Ver servicios" link, and the entire `.hero__art`/`.mockup*` block. `.hero__copy` keeps `hero__title`, `hero__subtitle`, `hero__actions` (now one link), and `hero__stats` unchanged in content.

- [ ] **Step 2: Verify markup renders (unstyled) without errors**

Open `index.html` directly in a browser. Confirm:
- No console errors about the video element.
- The page doesn't crash — it will look visually broken/unstyled at this point (video not yet positioned as a background, text not yet colored for contrast) because Task 2 hasn't run. That's expected for this task; do not add any CSS here.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Rewrite hero markup for full-width background video"
```

---

### Task 2: Style the full-bleed hero, overlay, and text contrast; remove dead CSS

**Files:**
- Modify: `css/style.css:123-130` (keyframes)
- Modify: `css/style.css:294-402` (hero block through end of mockup rules)

**Interfaces:**
- Consumes: `.hero__video`, `.hero__overlay`, `.hero__copy` produced by Task 1.
- Produces: desktop-width layout and colors for the hero — Task 3 adds mobile-specific overrides on top of these same classes; Task 4 does not depend on any CSS.

- [ ] **Step 1: Delete the now-unused `gentleFloat` keyframe**

Current at `css/style.css:123-130`:

```css
@keyframes floatUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes gentleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

Replace with (keep `floatUp`, delete `gentleFloat` — it was only used by `.mockup`, which this task removes in Step 2):

```css
@keyframes floatUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Replace the entire hero/mockup CSS block**

Current at `css/style.css:294-402`:

```css
/* ---------- Hero ---------- */
.hero {
  padding: 96px 6vw 88px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 60px;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
}
.hero__copy { animation: floatUp .6s ease both; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: var(--blue-soft-bg);
  border-radius: 999px;
  color: var(--blue-soft-fg);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
}
.badge__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--amber); }

.hero__title {
  font-size: clamp(38px, 4.8vw, 58px);
  line-height: 1.08;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 22px;
  letter-spacing: -0.5px;
}
.hero__subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-body-strong);
  max-width: 520px;
  margin: 0 0 34px;
}
.hero__actions { display: flex; gap: 14px; flex-wrap: wrap; }

.hero__stats { display: flex; gap: 34px; margin-top: 48px; }
.stat__value { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700; color: oklch(0.3 0.15 300); }
.stat__label { font-size: 13px; color: var(--text-muted); }

.hero__art { position: relative; }
.mockup {
  background: linear-gradient(155deg, var(--navy), var(--blue));
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 30px 60px -20px var(--shadow-navy);
  animation: gentleFloat 5s ease-in-out infinite;
}
.mockup__inner {
  background: var(--bg);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .15);
}
.mockup__bar {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px;
  background: oklch(0.94 0.01 260);
  color: var(--blue);
}
.mockup__bar-icon { display: flex; }
.mockup__bar-url {
  flex: 1;
  height: 8px;
  max-width: 120px;
  border-radius: 999px;
  background: oklch(0.88 0.01 260);
}
.mockup__body { padding: 30px 26px 34px; }

.mockup__nav-row {
  display: flex; align-items: center; gap: 16px;
  padding-bottom: 18px;
  margin-bottom: 28px;
  border-bottom: 1px solid oklch(0.91 0.01 260);
}
.mockup__nav-dot {
  width: 20px; height: 20px;
  border-radius: 6px;
  background: var(--blue);
  flex-shrink: 0;
}
.mockup__nav-link { font-size: 12px; font-weight: 500; color: var(--text-muted); }
.mockup__nav-cta {
  margin-left: auto;
  font-size: 11.5px;
  font-weight: 600;
  color: #fff;
  background: var(--navy);
  padding: 6px 12px;
  border-radius: 999px;
}

.mockup__video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 8px;
  background: oklch(0.94 0.01 260);
}
```

Replace the entire block above with:

```css
/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  min-height: 640px;
}
.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(90deg, rgba(10,6,30,0.85) 0%, rgba(10,6,30,0.55) 45%, rgba(10,6,30,0.05) 75%);
}
.hero__copy {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 96px 6vw 88px;
  animation: floatUp .6s ease both;
}

.hero__title {
  font-size: clamp(38px, 4.8vw, 58px);
  line-height: 1.08;
  font-weight: 700;
  color: #fff;
  max-width: 640px;
  margin: 0 0 22px;
  letter-spacing: -0.5px;
}
.hero__subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: oklch(0.88 0.02 280);
  max-width: 520px;
  margin: 0 0 34px;
}
.hero__actions { display: flex; gap: 14px; flex-wrap: wrap; }

.hero__stats { display: flex; gap: 34px; margin-top: 48px; }
.stat__value { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700; color: #fff; }
.stat__label { font-size: 13px; color: oklch(0.8 0.02 280); }
```

This deletes `.badge`, `.badge__dot`, `.hero__art`, `.mockup`, `.mockup__inner`, `.mockup__bar`, `.mockup__bar-icon`, `.mockup__bar-url`, `.mockup__body`, `.mockup__nav-row`, `.mockup__nav-dot`, `.mockup__nav-link`, `.mockup__nav-cta`, `.mockup__video` — none of these classes exist in `index.html` anymore after Task 1. It also drops the old `grid-template-columns`/`max-width: 1280px`/`padding` from `.hero` itself (moved onto `.hero__copy`, since `.hero` must now span full viewport width for the video to bleed edge to edge) and changes `.hero__title`/`.hero__subtitle`/`.stat__value`/`.stat__label` colors from dark to light (readable against the dark overlay), and gives `.hero__title` a `max-width` (previously implied by the grid column, now needed explicitly since `.hero` no longer constrains it).

- [ ] **Step 3: Confirm no orphaned selectors remain**

Run:

```bash
grep -n "badge\|hero__art\|mockup" css/style.css index.html
```

Expected: no output (the mobile media query at `css/style.css:701-745` still references `.hero__art`/`.mockup*` at this point — that's Task 3's job to clean up, so seeing matches there is expected and fine for *this* step; if you see any match in `index.html` or outside the `@media (max-width: 640px)` block, that's a real problem to fix before committing).

- [ ] **Step 4: Verify in the browser at desktop width**

Open `index.html` in a browser at ~1280px width (or wider). Confirm:
- The video fills the entire hero section edge to edge (no visible gap/border at the sides), with the poster showing while the video loads.
- The heading, subtitle, button, and stats are readable in white/light text over the darker left side of the video.
- The right side of the hero shows the video clearly (less/no dark overlay).
- `.hero` has real vertical height (not collapsed to just the text's natural height).

- [ ] **Step 5: Commit**

```bash
git add css/style.css
git commit -m "Style full-width hero background video with lateral text overlay"
```

---

### Task 3: Rework mobile/responsive hero overrides

**Files:**
- Modify: `css/style.css:701-708` (first responsive block)
- Modify: `css/style.css:711-718` (mobile hero/mockup overrides)

**Interfaces:**
- Consumes: `.hero`, `.hero__video`, `.hero__overlay`, `.hero__copy` from Task 2.

- [ ] **Step 1: Remove the grid-column override (no grid anymore)**

Current at `css/style.css:701-708`:

```css
@media (max-width: 860px) {
  .hero { grid-template-columns: 1fr; padding-top: 48px; }
  .about__inner { grid-template-columns: 1fr; }
  .contact-card { grid-template-columns: 1fr; padding: 36px 6vw; }
  .nav__links { display: none; }
  .nav__burger { display: flex; }
  .nav-mobile { display: flex; }
}
```

Replace with:

```css
@media (max-width: 860px) {
  .hero__copy { padding-top: 48px; }
  .about__inner { grid-template-columns: 1fr; }
  .contact-card { grid-template-columns: 1fr; padding: 36px 6vw; }
  .nav__links { display: none; }
  .nav__burger { display: flex; }
  .nav-mobile { display: flex; }
}
```

(`.hero { grid-template-columns: 1fr; }` no longer means anything since `.hero` isn't a grid container anymore — deleted outright. The `padding-top: 48px` value is preserved, just moved onto `.hero__copy` — Task 2 moved the hero's padding there, so the override has to follow it to keep the same reduced top gap at tablet width that existed before this plan.)

- [ ] **Step 2: Replace the mobile hero/mockup overrides with hero__copy/overlay overrides**

Current at `css/style.css:711-718`:

```css
/* Tighter rhythm + lighter hero visual on small screens so there's less to scroll through */
@media (max-width: 640px) {
  .hero { padding-top: 28px; padding-bottom: 36px; gap: 36px; }
  .hero__art { max-width: 320px; margin: 0 auto; }
  .mockup { padding: 22px; }
  .mockup__body { padding: 20px 18px 22px; }
  .mockup__nav-row { margin-bottom: 20px; }
```

Replace with:

```css
/* Tighter rhythm + fuller overlay coverage on small screens so wrapped text stays legible */
@media (max-width: 640px) {
  .hero__copy { padding-top: 28px; padding-bottom: 36px; }
  .hero__overlay { background: linear-gradient(180deg, rgba(10,6,30,0.55) 0%, rgba(10,6,30,0.88) 55%, rgba(10,6,30,0.88) 100%); }
```

(Leave the rest of this media query block — `.section, .about { ... }`, `.hero__stats { ... }`, and the carousel rules below it — untouched; only the lines shown above change. `.hero { gap: 36px }` is deleted since `.hero` isn't a flex/grid container that needs a `gap` anymore. The overlay switches from a lateral gradient to a top-to-bottom one on mobile: lighter at the very top, darkening through the middle and bottom where the stacked single-column text now sits, since there's no "clear video on the right" concept once everything is one narrow column.)

- [ ] **Step 3: Confirm no orphaned selectors remain anywhere**

Run:

```bash
grep -n "badge\|hero__art\|mockup" css/style.css index.html
```

Expected: no output at all now (zero matches in both files).

- [ ] **Step 4: Verify in the browser at mobile width**

Using DevTools device toolbar, emulate a 375px-wide phone. Confirm:
- The video still fills the hero edge to edge.
- The heading/subtitle/button/stats are clearly readable against the (now top-to-bottom) overlay — no low-contrast text.
- No horizontal overflow/scrollbar introduced by the hero.

- [ ] **Step 5: Commit**

```bash
git add css/style.css
git commit -m "Rework mobile hero overlay for the full-width video layout"
```

---

### Task 4: Update the JS video selector

**Files:**
- Modify: `js/main.js:70`

**Interfaces:**
- Consumes: `.hero__video` element produced by Task 1 (replaces the old `.mockup__video` selector, which no longer exists in the DOM after Task 1).

- [ ] **Step 1: Update the selector**

Current at `js/main.js:70`:

```javascript
  const heroVideo = document.querySelector('.mockup__video');
```

Replace with:

```javascript
  const heroVideo = document.querySelector('.hero__video');
```

No other lines in this block change (`if (heroVideo && !reduceMotion) { heroVideo.play().catch(() => {}); }` on the following lines stays exactly as-is).

- [ ] **Step 2: Verify autoplay still works**

Open `index.html` in a browser with reduced-motion OFF (default). Open DevTools console and run:

```javascript
document.querySelector('.hero__video').paused
```

Expected: `false` (video is playing).

- [ ] **Step 3: Verify reduced-motion fallback still works**

In Chrome DevTools: `Cmd/Ctrl+Shift+P` → "Show Rendering" → set "Emulate CSS media feature prefers-reduced-motion" to `reduce`. Reload the page. Run the same console check:

```javascript
document.querySelector('.hero__video').paused
```

Expected: `true` (video did not autoplay, stays on poster). Turn the emulation back to "No emulation" afterward.

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "Point hero video autoplay logic at the new .hero__video element"
```

---

### Task 5: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Full-page smoke test**

Open `index.html` in a browser with reduced-motion OFF. Confirm across the full page:
- Hero video autoplays, loops, fills the section edge to edge, no visible seams/borders.
- Text and button are legible over the video at every point during the loop (the video's content doesn't have a bright moment that washes out the text — if it does, note it, since the overlay may need a slightly higher opacity, but do not change values without flagging it first).
- Clicking "Cotiza tu proyecto por WhatsApp" opens the correct `wa.me` link (unchanged behavior from before this plan).
- Rest of the page (nav, services, portfolio, pricing, about, FAQ, contact, footer) is unaffected — this change touched only the hero.

- [ ] **Step 2: Responsive sweep**

Using DevTools device toolbar, check at 1280px, 860px, 640px, and 375px widths. Confirm no horizontal overflow, no layout breakage, and the overlay keeps text readable at every width.

- [ ] **Step 3: Network sanity check**

Confirm `assets/video/hero-demo.mp4` and `assets/video/hero-demo-poster.jpg` load with 200 status in the DevTools Network tab.

- [ ] **Step 4: Final commit check**

```bash
git log --oneline -5
git status
```

Expected: four commits from Tasks 1–4 (markup, desktop CSS, mobile CSS, JS selector), working tree clean aside from anything unrelated already pending before this plan started.
