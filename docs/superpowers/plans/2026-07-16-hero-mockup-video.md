# Hero Mockup Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static fake browser content inside the hero mockup on the homepage with the looping demo video already generated and placed at `assets/video/hero-demo.mp4`.

**Architecture:** Pure static-site change across three files (`index.html`, `css/style.css`, `js/main.js`). No build step, no test framework — this is a plain HTML/CSS/JS site served by nginx (see `Dockerfile`/`nginx.conf`). "Testing" in this plan means opening `index.html` directly in a browser (or via a local static server) and visually/DevTools verifying behavior, since there is no existing automated test suite to extend.

**Tech Stack:** Vanilla HTML/CSS/JS, no frameworks, no bundler.

## Global Constraints

- Video and poster assets already exist — do not regenerate them: `assets/video/hero-demo.mp4` (960×540, H.264, no audio, ~484 KB, 10s loop) and `assets/video/hero-demo-poster.jpg` (960×540 still frame at 7.5s).
- The video must be decorative only: `aria-hidden="true"`, no autoplay via the raw HTML attribute — playback is gated in JS behind `prefers-reduced-motion` so reduced-motion users see only the static poster (per the approved spec at `docs/superpowers/specs/2026-07-16-hero-mockup-video-design.md`).
- Keep the existing `.mockup__bar` / `.mockup__nav-row` (fake browser chrome) untouched — only the content area below it changes.
- No lazy-loading — the hero renders above the fold and must load immediately.

---

### Task 1: Replace hero mockup fake content with the video element

**Files:**
- Modify: `index.html:92-104`

**Interfaces:**
- Produces: a `<video class="mockup__video">` element inside `.mockup__body`, which Task 2 styles and Task 3 controls via JS (`document.querySelector('.mockup__video')`).

- [ ] **Step 1: Replace the `.mockup__content` block with the video element**

Current content at `index.html:92-104`:

```html
          <div class="mockup__body">
            <div class="mockup__nav-row">
              <span class="mockup__nav-dot"></span>
              <span class="mockup__nav-link">Inicio</span>
              <span class="mockup__nav-link">Nosotros</span>
              <span class="mockup__nav-cta">Contacto</span>
            </div>
            <div class="mockup__content">
              <h3 class="mockup__heading">Tu negocio,<br>en línea.</h3>
              <p class="mockup__sub">Diseño profesional, resultados reales.</p>
              <span class="mockup__cta">Empezar ahora</span>
            </div>
          </div>
```

Replace with:

```html
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
```

Note: `autoplay` is intentionally omitted here — Task 3 starts playback from JS only when the user hasn't requested reduced motion, so reduced-motion users only ever see the `poster` frame.

- [ ] **Step 2: Verify markup renders without errors**

Open `index.html` directly in a browser (double-click the file, or use `file://` path). Confirm:
- No console errors about the video element.
- A static image (the poster frame — a polished website screenshot) shows in place of the old "Tu negocio, en línea." fake text mockup.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Replace hero mockup fake content with demo video element"
```

---

### Task 2: Style the video and remove dead mockup-content CSS

**Files:**
- Modify: `css/style.css:369` (`.mockup__body`)
- Modify: `css/style.css:394-411` (`.mockup__content`, `.mockup__heading`, `.mockup__sub`, `.mockup__cta`)
- Modify: `css/style.css:726` (mobile `.mockup__body` override)

**Interfaces:**
- Consumes: `.mockup__video` class produced by Task 1.
- Produces: `.mockup__video` CSS rule — Task 3 does not depend on any CSS, but relies on this class existing on the element it queries.

- [ ] **Step 1: Remove the now-unused `min-height` on `.mockup__body`**

Current at `css/style.css:369`:

```css
.mockup__body { padding: 30px 26px 34px; min-height: 260px; }
```

Replace with:

```css
.mockup__body { padding: 30px 26px 34px; }
```

(`min-height: 260px` existed to keep the box from collapsing around the old short text content. The video defines its own height via `aspect-ratio`, so this is no longer needed.)

- [ ] **Step 2: Replace the dead `.mockup__content` rules with `.mockup__video`**

Current at `css/style.css:394-411`:

```css
.mockup__content { display: flex; flex-direction: column; align-items: flex-start; }
.mockup__heading {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 10px;
}
.mockup__sub { font-size: 13px; color: var(--text-body); margin: 0 0 18px; }
.mockup__cta {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: var(--blue);
  padding: 10px 20px;
  border-radius: 9px;
}
```

Replace with:

```css
.mockup__video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 8px;
  background: oklch(0.94 0.01 260);
}
```

(`.mockup__heading`, `.mockup__sub`, `.mockup__cta`, `.mockup__content` are deleted outright — nothing in `index.html` references them anymore after Task 1. The `background` on `.mockup__video` shows briefly if the poster image is slow to load.)

- [ ] **Step 3: Simplify the mobile override**

Current at `css/style.css:726`:

```css
  .mockup__body { padding: 20px 18px 22px; min-height: 0; }
```

Replace with:

```css
  .mockup__body { padding: 20px 18px 22px; }
```

(`min-height: 0` was overriding the now-removed base `min-height: 260px`; with that base rule gone, this override has nothing to do.)

- [ ] **Step 4: Verify styling in the browser**

Open `index.html` in a browser at desktop width (~1280px):
- The video/poster fills the mockup content area edge-to-edge below the fake browser tab row, with slightly rounded corners, no leftover whitespace shaped for the old text block.

Resize the browser (or use DevTools device toolbar) to below 640px width:
- The mockup shrinks to fit `max-width: 320px` (existing `.hero__art` rule), the video scales proportionally, no overflow or squishing.

- [ ] **Step 5: Commit**

```bash
git add css/style.css
git commit -m "Style hero mockup video and remove unused mockup-content CSS"
```

---

### Task 3: Gate autoplay behind `prefers-reduced-motion`

**Files:**
- Modify: `js/main.js:49-68`

**Interfaces:**
- Consumes: `.mockup__video` element produced by Task 1; the existing `reduceMotion` constant already declared in this file at line 50.

- [ ] **Step 1: Add the hero video playback block**

Current at `js/main.js:49-68`:

```javascript
  const parallaxLayers = document.querySelectorAll('.bg-scene__layer');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (parallaxLayers.length && !reduceMotion) {
    let ticking = false;
    const updateParallax = () => {
      const y = window.scrollY;
      parallaxLayers.forEach((layer) => {
        const factor = parseFloat(layer.dataset.parallax || '0');
        layer.style.transform = `translate3d(0, ${y * factor}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }
```

Insert immediately after this block (still before the burger-menu code that follows):

```javascript

  const heroVideo = document.querySelector('.mockup__video');
  if (heroVideo && !reduceMotion) {
    heroVideo.play().catch(() => {});
  }
```

(No `else` branch needed — when `reduceMotion` is true, or the browser blocks autoplay, the video simply stays on its `poster` frame, which is the desired fallback.)

- [ ] **Step 2: Verify default playback**

With OS/browser reduced-motion OFF (the default), open `index.html` in a browser. Confirm the hero mockup video plays automatically, muted, and loops seamlessly after ~10 seconds.

- [ ] **Step 3: Verify reduced-motion fallback**

In Chrome DevTools: `Cmd/Ctrl+Shift+P` → "Show Rendering" → set "Emulate CSS media feature prefers-reduced-motion" to `reduce`. Reload the page. Confirm:
- The background parallax blobs stop moving (existing behavior, unchanged).
- The hero mockup video does NOT play — it stays on the static poster frame.

Turn the emulation back to "No emulation" afterward.

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "Autoplay hero mockup video only when reduced motion isn't requested"
```

---

### Task 4: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Full-page smoke test**

Open `index.html` in a browser with reduced-motion OFF. Confirm across the full page:
- Hero mockup video autoplays, loops, has no visible controls, and has no audio.
- No layout shift/jump in the hero section as the video loads in.
- Rest of the page (nav, services, portfolio, pricing, about, FAQ, contact, footer) is unaffected — this change touched only the hero mockup.

- [ ] **Step 2: Mobile viewport check**

Using DevTools device toolbar, emulate a 375px-wide phone. Confirm the mockup (including video) stays within `max-width: 320px`, centered, matching the existing mobile hero layout.

- [ ] **Step 3: View source sanity check**

Confirm `assets/video/hero-demo.mp4` and `assets/video/hero-demo-poster.jpg` load with 200 status in the DevTools Network tab (filter by "Media" or "Img").

- [ ] **Step 4: Final commit check**

```bash
git log --oneline -4
git status
```

Expected: three commits from Tasks 1–3 (video markup, CSS, JS), working tree clean aside from anything unrelated already pending before this plan started.
