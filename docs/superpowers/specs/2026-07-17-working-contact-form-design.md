# Working contact form — design spec

## Context

The homepage contact form (`index.html`, `#contactForm`) is currently a
non-functional demo: `js/main.js` intercepts `submit`, calls
`e.preventDefault()`, and just reveals a static "this form is a demo,
write to us on WhatsApp or email instead" message
(`#contactSuccess`). No data is ever sent anywhere. This was flagged as
the single highest-priority gap in the site (a real prospective client
filling it out gets no response and no indication anything went wrong
beyond the demo notice).

This spec makes the form actually deliver messages to
`hola@nocodecreatoria.com`.

## Decisions made during brainstorming

- **Delivery mechanism**: [Web3Forms](https://web3forms.com) — a
  third-party form-backend API. The form `fetch()`s
  `https://api.web3forms.com/submit` with the form fields plus an
  `access_key`; Web3Forms verifies the request and relays the message to
  the destination email registered with that key. No backend service is
  added to this project's own Docker/nginx deployment.
- **Access key**: `c0b410bf-a28e-4f6f-aa36-bbae5e3a9c30` — already
  created by the user against `hola@nocodecreatoria.com` /
  `nocodecreatoria.com`. This key is meant to be public (it ships in the
  page's HTML/JS, visible to anyone via view-source) — Web3Forms's abuse
  protection is origin/rate-limit-based, not secrecy-based. No further
  action needed to obtain or rotate it for this spec.
- **Spam protection**: add a honeypot field (an input hidden from real
  users via CSS, that only bots tend to fill in). Web3Forms
  auto-recognizes a field named `botcheck` as its honeypot convention and
  silently discards submissions where it's filled — free, no user-facing
  friction, no CAPTCHA.
- **UX states**: submit button shows a "Enviando..." busy state and is
  disabled during the request; on success, the existing success-message
  element is shown (copy updated — no longer says "this is a demo"); on
  failure (network error, non-OK response), an error message appears
  telling the user to reach out via WhatsApp instead, and the form's
  entered values are left intact (nothing is cleared) so the user doesn't
  lose what they typed.

## Current structure being replaced

`index.html` (~lines 297-307), inside `.contact-form`:

```html
<form class="contact-form" id="contactForm">
  <input type="text" placeholder="Tu nombre" required>
  <input type="email" placeholder="Tu email" required>
  <textarea placeholder="Cuéntanos sobre tu proyecto..." rows="4" required></textarea>
  <label class="contact-form__consent">
    <input type="checkbox" required>
    <span>Acepto que mis datos se usen solo para responder mi consulta, según la <a href="privacidad.html">Política de Privacidad</a>.</span>
  </label>
  <button type="submit">Enviar mensaje</button>
  <p class="contact-form__success" id="contactSuccess" hidden>¡Gracias! Este formulario es una demo — por ahora escríbenos directo por WhatsApp o email.</p>
</form>
```

`js/main.js` (~lines 40-47), inside the same IIFE as everything else:

```javascript
const form = document.getElementById('contactForm');
const success = document.getElementById('contactSuccess');
if (form && success) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    success.hidden = false;
  });
}
```

## New structure

**HTML** (`index.html`): the three visible fields (name, email, textarea)
keep their current `placeholder`s and `required` attributes unchanged —
Web3Forms reads them by `name` attribute, so each needs one added:
`name="name"`, `name="email"`, `name="message"` (Web3Forms' documented
standard field names, so its relayed email is nicely formatted without
extra configuration). Two additions:

- A hidden `access_key` input:
  `<input type="hidden" name="access_key" value="c0b410bf-a28e-4f6f-aa36-bbae5e3a9c30">`
- A honeypot input, visually hidden (not `type="hidden"`, since some spam
  bots skip genuinely hidden inputs — visually hidden via CSS is the
  documented Web3Forms recommendation):
  `<input type="checkbox" name="botcheck" class="contact-form__botcheck" tabindex="-1" autocomplete="off">`

The existing `#contactSuccess` element's copy changes from the "this is a
demo" text to a real confirmation, e.g. "¡Gracias! Tu mensaje fue
enviado — te responderemos pronto." A new sibling element for the error
state is added, same pattern as the success one:
`<p class="contact-form__error" id="contactError" hidden>...</p>` with
copy along the lines of "No pudimos enviar tu mensaje. Escríbenos
directo por WhatsApp mientras lo resolvemos." (linking or referencing the
WhatsApp CTA already elsewhere on the page — exact copy decided during
implementation, no need to nail the exact wording here).

**CSS** (`css/style.css`): one new rule to visually hide the honeypot
field without `display:none`/`visibility:hidden` (which some bots detect
and skip filling — the point is to make it invisible to a human but still
technically "visible" to a naive scraper), following the standard
visually-hidden pattern already used for screen-reader-only content
elsewhere on the web (absolute position, 1px size, overflow hidden,
clipped). A small style for the error message reusing/mirroring
`.contact-form__success`'s existing look (just a different accent color)
is also added.

**JS** (`js/main.js`): the `submit` handler changes from the fake
`preventDefault` + reveal to:

1. `e.preventDefault()` (still needed — we're taking over the submission
   ourselves via `fetch`, not letting the browser navigate).
2. Hide both `#contactSuccess` and `#contactError` (in case of a resubmit
   after a prior error).
3. Disable the submit button and swap its text to "Enviando...".
4. `fetch('https://api.web3forms.com/submit', { method: 'POST', headers:
   { 'Content-Type': 'application/json', Accept: 'application/json' },
   body: JSON.stringify(Object.fromEntries(new FormData(form))) })` (the
   honeypot field's value rides along automatically as part of
   `FormData` — no special handling needed, Web3Forms inspects it
   server-side).
5. On a response whose parsed JSON has `success: true` (Web3Forms'
   documented response shape): re-enable the button, restore its
   original text, show `#contactSuccess`, and reset the form fields
   (`form.reset()`) — successful submissions ARE cleared, since there's
   nothing left to preserve; only *failed* submissions keep the user's
   typed content intact per the brainstorming decision above.
6. On any failure (`fetch` rejecting, a non-OK HTTP status, or a parsed
   response with `success: false`): re-enable the button, restore its
   original text, show `#contactError`, and leave the form's field values
   untouched.

## Out of scope

- Any change to the WhatsApp/email contact links elsewhere on the
  `#contacto` section — untouched.
- Building a project-owned backend endpoint — explicitly rejected in
  favor of the third-party service during brainstorming.
- CAPTCHA or any spam defense beyond the honeypot field.
- Rotating or regenerating the Web3Forms access key.
