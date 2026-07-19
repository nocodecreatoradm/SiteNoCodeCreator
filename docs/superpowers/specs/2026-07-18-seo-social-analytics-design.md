# SEO, social sharing, and analytics — design spec

## Context

An earlier audit of the site (start of this working history) flagged several
gaps: no Open Graph/Twitter meta tags, no `robots.txt`/`sitemap.xml`, no
structured data, and no analytics. The user asked to tackle SEO/social
sharing and analytics together, with two pieces of real-world context that
shape the design:

- They have a Facebook Page for the business that exists but has zero posts
  published on it yet.
- They want to share the site URL in a post on their personal LinkedIn.

Generating actual Facebook post content was raised and explicitly deferred
to a separate future conversation — out of scope here. This spec covers:
meta tags for link-preview quality, a generated social preview image,
`robots.txt`/`sitemap.xml`, JSON-LD structured data, a Facebook link in the
footer, and analytics (GA4 + Meta Pixel).

## Decisions made during brainstorming

- **Social image (og:image)**: a new static 1200×630px image, generated
  once and saved to `assets/og-image.png`. Layout "B2" from the visual
  comparison: a large white rounded-square logo mark (`</>` glyph, drop
  shadow) on the left acting like an app icon, with the headline "Tu web o
  app, profesional y lista en semanas" and "NoCode Creator ·
  nocodecreatoria.com" stacked to its right, on the same purple/navy
  gradient + radial-blob background used elsewhere on the site
  (`linear-gradient(155deg, var(--navy), var(--blue))` plus a soft violet
  radial blob in the top-right corner, echoing `.bg-scene__blob--violet`).
- **Structured data type**: `ProfessionalService` (schema.org), not
  `LocalBusiness` — the user explicitly does not want a street address
  published. Meetings happen over Teams/Meet, with occasional in-person
  meetings at rented coworking space (WeWork or similar) with no fixed
  address of their own. Structured data uses `areaServed: "Surco, Lima,
  Perú"` instead of a `PostalAddress`, and omits `openingHours` entirely
  (not meaningful for a remote-first service).
- **Facebook**: link only in the footer (an icon/link to the Page) plus
  Meta Pixel installed site-wide. No Facebook post content is created as
  part of this work — the Page stays empty for now; that's a separate,
  future initiative.
- **Analytics**: both Google Analytics 4 (`gtag.js`) and Meta Pixel,
  installed on every page. The user has neither account yet — during
  implementation, the assistant guides them step-by-step to create the GA4
  property and the Meta Pixel, the same way the Web3Forms access key was
  obtained in an earlier piece of work: the user creates the account
  themselves (this assistant cannot log into Google/Meta on their behalf),
  copies out the Measurement ID (`G-XXXXXXXXXX`) and Pixel ID, and hands
  them over to be wired into the code.
- **Canonical domain**: `https://nocodecreatoria.com/` — used for
  `og:url`, the canonical link tag, and the sitemap.

## Current state being extended

`index.html:1-13` — the `<head>` currently has only charset, viewport,
`<title>`, `<meta name="description">`, favicon link, font preconnects/
stylesheet, and the site's own stylesheet. No Open Graph, Twitter Card,
canonical, or JSON-LD tags exist anywhere in the file.

`index.html:330-333` — the footer's `.footer__links` currently has two
links (Privacidad, Aviso Legal) and no social icons.

No `robots.txt`, `sitemap.xml`, or `assets/og-image.png` exist in the repo
yet.

## New head tags (`index.html`)

Added inside `<head>`, after the existing `<meta name="description">` line
and before the favicon link — reusing the exact existing title/description
copy, not inventing new copy:

```html
<link rel="canonical" href="https://nocodecreatoria.com/">
<meta property="og:type" content="website">
<meta property="og:url" content="https://nocodecreatoria.com/">
<meta property="og:title" content="NoCode Creator — Tu web o app, lista en semanas">
<meta property="og:description" content="NoCode Creator diseña y desarrolla páginas web, plataformas y aplicaciones a medida, con procesos ágiles y estándares profesionales. Rápido, funcional y a un costo justo.">
<meta property="og:image" content="https://nocodecreatoria.com/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="es_PE">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="NoCode Creator — Tu web o app, lista en semanas">
<meta name="twitter:description" content="NoCode Creator diseña y desarrolla páginas web, plataformas y aplicaciones a medida, con procesos ágiles y estándares profesionales. Rápido, funcional y a un costo justo.">
<meta name="twitter:image" content="https://nocodecreatoria.com/assets/og-image.png">
```

`og:image`/`twitter:image` use the full absolute URL (required by most
platforms' crawlers, relative URLs are unreliable here).

## Structured data (`index.html`)

A `<script type="application/ld+json">` block, placed at the end of
`<head>` (after the stylesheet link):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "NoCode Creator",
  "description": "Diseño y desarrollo de páginas web, plataformas y aplicaciones a medida, sin código tradicional.",
  "url": "https://nocodecreatoria.com/",
  "telephone": "+51908844210",
  "email": "hola@nocodecreatoria.com",
  "areaServed": "Surco, Lima, Perú",
  "sameAs": [
    "https://www.facebook.com/profile.php?id=61584407983305"
  ]
}
</script>
```

No `address` or `openingHours` fields — per the brainstorming decision,
deliberately omitted.

## `robots.txt` (new file, site root)

```
User-agent: *
Allow: /

Sitemap: https://nocodecreatoria.com/sitemap.xml
```

## `sitemap.xml` (new file, site root)

Lists the three real pages, each with a `lastmod` set to the date this
plan is executed (not hardcoded here — the implementer fills in the actual
execution date):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nocodecreatoria.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://nocodecreatoria.com/privacidad.html</loc>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://nocodecreatoria.com/aviso-legal.html</loc>
    <priority>0.3</priority>
  </url>
</urlset>
```

## Social preview image (`assets/og-image.png`)

Generated once (not hand-drawn per-request at runtime) as a static PNG,
1200×630px, following layout B2 approved during brainstorming:

- Background: `linear-gradient(155deg, var(--navy), var(--blue))` (same
  gradient already used for `.mockup`-style elements historically in this
  codebase — reuse the same navy/blue token values, not new colors), plus
  one soft violet radial blob in the top-right corner for depth (visually
  consistent with `.bg-scene__blob--violet`'s color, much more subtle/
  smaller than the full-page background scene).
- Left: a white rounded-square (roughly 100×100px at this canvas size),
  `</>` glyph in navy, centered, with a soft drop shadow — sized and
  positioned like an app icon.
- Right of the icon: two lines of white/light-lavender text — the
  headline "Tu web o app, profesional y lista en semanas" (bold, large,
  `Space Grotesk`), and below it in smaller light-lavender text "NoCode
  Creator · nocodecreatoria.com".

Implementation approach: build this as a standalone HTML file styled with
the site's real CSS tokens, render it in a real browser at exactly
1200×630 viewport, and capture a screenshot — the same technique already
used successfully in this project's history for the hero video's poster
frame, adapted to a static composed layout instead of a video frame.

## Facebook link (`index.html` footer)

`index.html:330-333`'s `.footer__links` gets one more link, a Facebook
icon, added alongside (not replacing) the existing Privacidad/Aviso Legal
links:

```html
<div class="footer__links">
  <a href="privacidad.html">Política de Privacidad</a>
  <a href="aviso-legal.html">Aviso Legal</a>
  <a href="https://www.facebook.com/profile.php?id=61584407983305" target="_blank" rel="noopener" aria-label="Facebook">
    <!-- Facebook glyph, styled consistent with existing footer link treatment -->
  </a>
</div>
```

Exact icon markup (inline SVG vs. a small glyph) and any minor CSS needed
for it to sit well next to the text links is an implementation detail —
follow the existing `.footer__links a` styling conventions already in
`css/style.css`. Same Facebook Page URL as the structured-data `sameAs`
value above.

## Analytics (GA4 + Meta Pixel)

Both installed as `<script>` blocks in `<head>`, added once real IDs are
obtained (implementation-time, guided walkthrough — not part of this
spec's static content since the IDs don't exist yet):

- **GA4**: standard `gtag.js` snippet loading
  `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX` plus the
  inline `gtag('config', 'G-XXXXXXXXXX')` initializer, using whatever
  Measurement ID the user obtains.
- **Meta Pixel**: the standard Meta Pixel base code snippet (loads
  `fbevents.js`, calls `fbq('init', '<PIXEL_ID>')` and
  `fbq('track', 'PageView')`), using whatever Pixel ID the user obtains.

No custom event tracking beyond each platform's default page-view — e.g.
no explicit "WhatsApp click" conversion event wiring. That would be a
reasonable future enhancement but wasn't requested and is out of scope
here (YAGNI).

## Account creation walkthroughs (implementation-time, not this spec's content)

Two real-world account-creation steps happen during implementation, not
during this design phase, since they require the user's own Google/Meta
login:

1. **GA4 property**: user goes to analytics.google.com, creates a new
   GA4 property for `nocodecreatoria.com`, and retrieves the Measurement
   ID from Admin → Data Streams → (their web stream).
2. **Meta Pixel**: user goes to Meta Events Manager
   (business.facebook.com/events_manager), creates a new Pixel, and
   retrieves the Pixel ID.

The implementation plan must include explicit guided steps for both,
mirroring how the Web3Forms access key was obtained earlier in this
project's history (assistant explains where to click, user performs the
account action, user pastes the resulting ID back).

## Out of scope

- Any Facebook post content, scheduling, or publishing — deferred to a
  separate future conversation per explicit user decision during
  brainstorming.
- Custom analytics event tracking (button clicks, form-submit conversion
  events) beyond default page views.
- Any change to `privacidad.html`/`aviso-legal.html` content (e.g.
  disclosing GA4/Meta Pixel data collection) — worth flagging to the user
  as a likely follow-up given two new third-party trackers are being
  added, but not something this spec resolves; the implementer should
  raise it rather than silently editing the legal pages.
