# Hero mockup video — design spec

## Context

The user asked whether videos/animations like those on hostinger.com/es could
be added to the site. Reference screenshots showed: a full-bleed hero
background video, a product-demo video inside a UI frame, and a
horizontal portfolio carousel with playable video thumbnails.

After discussion, scope was narrowed to a single deliverable: replace the
static fake content inside the existing hero mockup
(`.mockup__body` / `.mockup__content` in `index.html`) with a short looping
video, generated with Google Veo (available via the user's Gemini Pro
account). Portfolio carousel and other animation work are explicitly
out of scope for this spec — a possible future phase.

A full-bleed background video of people/hands on laptops (Hostinger's
climbing-video pattern) was considered and rejected: AI-generated video of
people/hands is the category most prone to visible artifacts, and it would
replace the site's existing intentional device-mockup design rather than
build on it. Putting the video inside the existing browser-chrome mockup
reuses established visual language and only requires Veo to render UI
elements (wireframe → polished site transition), which is a safer
generation target.

A real screen-recording of an existing client site (e.g. Dermotienda) was
also considered as an alternative to an AI-generated clip — more
authentic, zero AI-artifact risk — but the user chose to go with a
Veo-generated clip instead.

## Concept

A short (5–8s), seamless-loop clip shown inside the hero mockup's browser
frame: starts as a grayscale wireframe/sketch of a generic website layout,
morphs into a polished, colorful, professional site, with a cursor
scrolling smoothly. No people, no readable text/logos in the clip itself
(the surrounding page already carries the real copy).

Suggested Veo prompt (user runs this themselves in Gemini):

> "A close-up screen recording style animation of a browser window
> interface. It starts as a simple grayscale wireframe sketch of a website
> layout with rough boxes and placeholder lines, then smoothly morphs and
> transitions into a polished, colorful, professional website design with
> clean typography and a subtle cursor scrolling down the page. Minimal,
> modern, tech aesthetic, soft lighting, 8 seconds, seamless loop, no
> people, no text overlays, no logos."

The user may need to regenerate/trim/adjust the clip before it's usable;
that iteration happens outside this implementation (Veo generation is a
manual step the user performs, not something the coding agent can do).

## Assets

- `assets/video/hero-demo.mp4` — H.264, no audio, target 1–3 MB for the
  clip (the mockup renders at ≤320px wide on mobile, larger on desktop,
  so no need for high resolution — cap around 960px wide source, let CSS
  scale down).
- `assets/video/hero-demo-poster.jpg` — a representative still frame,
  used as the `<video poster>` and as what's shown when reduced motion is
  requested.

These files must exist before the video markup can render correctly; if
the user hasn't generated/placed them yet, implementation should still
wire up the markup/CSS/JS against these paths (broken video source is
fine short-term — same as any other asset placeholder in this repo).

## Markup change

In `index.html`, inside `.mockup__body` (currently ~line 92–104), the
`.mockup__nav-row` (fake browser tab bar) stays as-is. The
`.mockup__content` block (fake heading/subtitle/CTA text) is replaced by:

```html
<video class="mockup__video" autoplay muted loop playsinline
       poster="assets/video/hero-demo-poster.jpg" aria-hidden="true">
  <source src="assets/video/hero-demo.mp4" type="video/mp4">
</video>
```

`aria-hidden="true"` because this is decorative — the `<h1>` and
`hero__subtitle` already carry the equivalent message for assistive tech.

## Styling

Add `.mockup__video` in `css/style.css` near the existing `.mockup__*`
rules (~line 341–410): `width: 100%; height: 100%; object-fit: cover;`
plus whatever border-radius the existing `.mockup__body`/`.mockup__inner`
already applies, so the video fills the frame the same way the old fake
content did. `.mockup__body` sizing (`min-height`, padding) may need
adjusting so the video fills the frame cleanly rather than leaving the
padding gutter that was sized for text content.

## Reduced motion

Follow the existing pattern already used for the background parallax in
`js/main.js` (`window.matchMedia('(prefers-reduced-motion: reduce)')`):
when reduced motion is requested, do not autoplay the video — leave it on
the poster frame (static image), mirroring today's static-mockup
experience for those users. This means removing/conditionally applying
the `autoplay` behavior in JS rather than relying solely on the HTML
attribute, since `autoplay` in markup has no built-in reduced-motion
awareness.

## Loading

No lazy-loading — the hero is above the fold and should render
immediately, same as today.

## Out of scope

- Portfolio carousel / video thumbnails (Hostinger's "Hecho con
  Hostinger" pattern) — future phase.
- Any additional scroll/interaction animation work beyond what already
  exists (`data-reveal`, parallax).
- Actually generating/trimming/compressing the video file — the user
  does this manually with Veo before or during implementation.
