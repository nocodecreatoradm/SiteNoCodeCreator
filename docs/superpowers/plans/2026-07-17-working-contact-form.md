# Working Contact Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage contact form actually deliver messages to `hola@nocodecreatoria.com`, replacing the current no-op demo submit handler.

**Architecture:** Pure static-site change across `index.html`, `css/style.css`, and `js/main.js`. The form submits via client-side `fetch()` directly to the Web3Forms API (`https://api.web3forms.com/submit`) — no backend added to this project. No build step, no test framework — verification is manual browser inspection, including one real end-to-end test submission.

**Tech Stack:** Vanilla HTML/CSS/JS, no frameworks, no bundler. Third-party service: Web3Forms.

## Global Constraints

- Web3Forms access key (already created by the user against `hola@nocodecreatoria.com`): `c0b410bf-a28e-4f6f-aa36-bbae5e3a9c30`. This key is meant to be public — it ships in the page HTML, no secrecy required.
- Field `name` attributes must be exactly `name`, `email`, `message` (Web3Forms' documented standard names).
- Honeypot field must be named `botcheck` (Web3Forms' auto-recognized convention) and must be visually hidden via CSS (not `type="hidden"`, not `display:none`/`visibility:hidden` — those are commonly skipped by unsophisticated bots; use a clip-based visually-hidden technique instead).
- On successful submission: show the success message, clear the form.
- On failed submission (network error OR a parsed response with `success: false`): show an error message directing the user to WhatsApp, and leave the user's typed values untouched — do not clear the form.
- The submit button must be disabled with "Enviando..." text while the request is in flight, and restored afterward regardless of outcome.

---

### Task 1: Add form fields for Web3Forms and update message copy

**Files:**
- Modify: `index.html:297-307`

**Interfaces:**
- Produces: form fields named `name`, `email`, `message`, `access_key`, `botcheck` — Task 3's JS reads all of these via `new FormData(form)`. Element ids `contactSuccess` (existing, copy changes) and `contactError` (new) — Task 3's JS toggles both by id.

- [ ] **Step 1: Replace the form's contents**

Current content at `index.html:297-307`:

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

Replace with:

```html
      <form class="contact-form" id="contactForm">
        <input type="hidden" name="access_key" value="c0b410bf-a28e-4f6f-aa36-bbae5e3a9c30">
        <input type="checkbox" name="botcheck" class="contact-form__botcheck" tabindex="-1" autocomplete="off">
        <input type="text" name="name" placeholder="Tu nombre" required>
        <input type="email" name="email" placeholder="Tu email" required>
        <textarea name="message" placeholder="Cuéntanos sobre tu proyecto..." rows="4" required></textarea>
        <label class="contact-form__consent">
          <input type="checkbox" required>
          <span>Acepto que mis datos se usen solo para responder mi consulta, según la <a href="privacidad.html">Política de Privacidad</a>.</span>
        </label>
        <button type="submit">Enviar mensaje</button>
        <p class="contact-form__success" id="contactSuccess" hidden>¡Gracias! Tu mensaje fue enviado — te responderemos pronto.</p>
        <p class="contact-form__error" id="contactError" hidden>No pudimos enviar tu mensaje. Escríbenos directo por WhatsApp mientras lo resolvemos.</p>
      </form>
```

Note: the consent checkbox (`required`, no `name` attribute) is intentionally left as-is — it's a UI-only confirmation gate, not data Web3Forms needs to receive.

- [ ] **Step 2: Verify markup renders without errors**

Open `index.html` directly in a browser. Confirm:
- No console errors.
- The form looks visually unchanged from before (the new hidden/honeypot inputs must not be visible or affect layout — they will not yet be styled, since that's Task 2; a raw unstyled checkbox may be briefly visible at this point, which is expected and fixed by the next task).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add Web3Forms fields to contact form and update message copy"
```

---

### Task 2: Style the honeypot field and the new error message

**Files:**
- Modify: `css/style.css:582` (add error rule near the existing success rule)
- Modify: `css/style.css:552` area (add botcheck visually-hidden rule near the other `.contact-form` rules)

**Interfaces:**
- Consumes: `.contact-form__botcheck` class and `.contact-form__error` id/class produced by Task 1.

- [ ] **Step 1: Add the visually-hidden honeypot rule**

Current at `css/style.css:552`:

```css
.contact-form { display: flex; flex-direction: column; gap: 14px; }
```

Insert immediately after this line:

```css
.contact-form__botcheck {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 2: Add the error message style next to the success style**

Current at `css/style.css:582`:

```css
.contact-form__success { font-size: 13.5px; color: var(--green-text); margin: 0; }
```

Replace with:

```css
.contact-form__success { font-size: 13.5px; color: var(--green-text); margin: 0; }
.contact-form__error { font-size: 13.5px; color: oklch(0.5 0.18 25); margin: 0; }
```

- [ ] **Step 3: Verify in the browser**

Open `index.html` in a browser, scroll to the contact form. Confirm:
- The honeypot checkbox is not visible anywhere in the form (visually identical to the form before Task 1).
- Using the browser's accessibility/DOM inspector, confirm the honeypot input is still present in the DOM (just visually clipped), not `display:none`.

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "Style honeypot field and add error message styling"
```

---

### Task 3: Wire the form up to Web3Forms

**Files:**
- Modify: `js/main.js:40-47`

**Interfaces:**
- Consumes: `#contactForm` (with fields `name`, `email`, `message`, `access_key`, `botcheck` from Task 1), `#contactSuccess`, `#contactError` (from Task 1).

- [ ] **Step 1: Replace the fake submit handler with a real one**

Current at `js/main.js:40-47`:

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

Replace with:

```javascript
  const form = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');
  const error = document.getElementById('contactError');
  if (form && success && error) {
    const submitButton = form.querySelector('button[type="submit"]');
    const submitButtonDefaultText = submitButton.textContent;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      success.hidden = true;
      error.hidden = true;
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
        .then((response) => response.json())
        .then((data) => {
          submitButton.disabled = false;
          submitButton.textContent = submitButtonDefaultText;
          if (data.success) {
            success.hidden = false;
            form.reset();
          } else {
            error.hidden = false;
          }
        })
        .catch(() => {
          submitButton.disabled = false;
          submitButton.textContent = submitButtonDefaultText;
          error.hidden = false;
        });
    });
  }
```

- [ ] **Step 2: Verify a real successful submission**

Open `index.html` in a browser (via a local static server, not `file://` — `fetch` to a cross-origin API can behave differently under `file://`). Fill in the form with real-looking test data (e.g. name "Prueba Plan", a real email you can check, and a short message noting it's a test) and submit. Open DevTools Network tab first so you can inspect the request.

Confirm:
- The button briefly shows "Enviando..." and is disabled during the request.
- The request to `https://api.web3forms.com/submit` returns a 200 response with `"success": true` in its JSON body.
- The success message appears, and the form fields are cleared.
- Ask the user (or check the inbox yourself if you have access) to confirm the email actually arrived at `hola@nocodecreatoria.com` — this is the real proof the integration works end-to-end, not just that the API accepted the request.

- [ ] **Step 3: Verify the error path**

In Chrome DevTools, open the Network tab and set throttling to "Offline". Fill in the form again and submit.

Confirm:
- The button shows "Enviando..." then returns to its normal state and text.
- The error message appears (not the success one).
- The form's typed values are still present (not cleared).

Set the Network throttling back to "No throttling" (technically "Online"/normal) afterward.

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "Wire contact form submission to Web3Forms"
```

---

### Task 4: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Full form smoke test**

Open `index.html` in a browser. Confirm:
- All three visible fields (name, email, message) and the consent checkbox still enforce `required` — submitting with any of them empty shows the browser's native validation message and does not fire the `fetch` call.
- With all fields filled and consent checked, submitting works exactly as verified in Task 3 (success path).

- [ ] **Step 2: Confirm no regressions elsewhere on the page**

Confirm the rest of the `#contacto` section (WhatsApp link, email link) and the rest of the page are unaffected — this change touched only the contact form.

- [ ] **Step 3: Final commit check**

```bash
git log --oneline -4
git status
```

Expected: three commits from Tasks 1–3 (HTML fields, CSS, JS wiring), working tree clean aside from anything unrelated already pending before this plan started.
