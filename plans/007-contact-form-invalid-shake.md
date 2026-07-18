# 007 — Add shake feedback for invalid contact-form fields

- **Status**: TODO
- **Commit**: 599da54
- **Severity**: LOW
- **Category**: Missed opportunity (feedback)
- **Estimated scope**: 2 files (`css/style.css`, `js/main.js`), ~25 lines added

## Problem

The contact form's three required visible fields (`name`, `email`, `message` — `index.html:299-301`) and the consent checkbox rely entirely on native HTML5 constraint validation: if a user tries to submit with something missing/invalid, the browser blocks the `submit` event and shows its own default validation bubble UI (browser-styled tooltip pointing at the field). There is no additional visual feedback from the site itself — no highlight, no motion — beyond that native browser tooltip, which is easy to miss (it's small, positioned inconsistently across browsers, and disappears quickly).

`js/main.js:40-74` — the current submit handler only runs its logic (button disable, fetch, success/error messaging) for submissions that already passed native validation; it has no hook for the invalid case at all.

## Target

Listen for the native `invalid` event (fires on a field when the browser's own constraint validation rejects it, before/instead of `submit`) on each required field, and play a brief shake animation on that field to reinforce the browser's own validation message with something more noticeable.

```css
/* new keyframe, place near floatUp/statRise keyframes */
@keyframes fieldShake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
.is-shaking { animation: fieldShake 400ms var(--ease-in-out); }

@media (prefers-reduced-motion: reduce) {
  .is-shaking { animation: none; border-color: oklch(0.5 0.18 25) !important; }
}
```

```javascript
// new block in js/main.js, near the existing contact-form block
if (form) {
  form.querySelectorAll('[required]').forEach((field) => {
    field.addEventListener('invalid', () => {
      field.classList.add('is-shaking');
      field.addEventListener('animationend', () => field.classList.remove('is-shaking'), { once: true });
    });
  });
}
```

This introduces a second strong easing token, `--ease-in-out`, for on-screen oscillating movement (per the AUDIT playbook's decision order: "Moving / morphing on screen → ease-in-out"; a shake moves back and forth rather than simply entering/exiting, so `--ease-out` — used everywhere else in this plan set — isn't the right curve here).

## Repo conventions to follow

- Keyframes are declared near the top of `css/style.css`, grouped with `floatUp` (`css/style.css:123-126`) and, if plan 005 has run, `statRise` right after it — add `fieldShake` in that same cluster.
- The reduced-motion override pattern used throughout this plan set (plans 001, 002, 005, 006) is "drop the animation, but if the animation was the only feedback mechanism, substitute a static equivalent" — for `[data-reveal]` and the hero stats, static equivalent was just "fully visible, no motion"; here, since the shake IS the feedback, the reduced-motion substitute is a static red border instead of no feedback at all. Follow this same "substitute, don't just delete" approach.
- `js/main.js` is a single IIFE with sequential `const`/`if` blocks, one per feature (WhatsApp links, scroll-reveal, contact form, parallax, hero video, mobile menu) — add this as its own new block, don't merge it into the existing contact-form submit-handler block.

## Steps

1. In `css/style.css`, check whether `:root` already has `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` (added by an earlier plan in this set). If not, add it to `:root` (`css/style.css:1-32`). Then, regardless, add this new token as well (it will not exist yet from any other plan in this set):

   ```css
     --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
   ```

2. In `css/style.css`, find the `floatUp` keyframe block (`css/style.css:123-126`, or if plan 005 already ran, find `statRise` immediately after it — either way, find the end of that keyframe cluster). Add the new keyframe and its animation class immediately after:

   ```css
   @keyframes fieldShake {
     10%, 90% { transform: translateX(-1px); }
     20%, 80% { transform: translateX(2px); }
     30%, 50%, 70% { transform: translateX(-4px); }
     40%, 60% { transform: translateX(4px); }
   }
   .is-shaking { animation: fieldShake 400ms var(--ease-in-out); }
   ```

3. In `css/style.css`, find the existing reduced-motion media query block (its exact contents depend on which of plans 001/002/005/006 have already run — find whichever version currently exists in the file). Add one more line inside it:

   ```css
     .is-shaking { animation: none; border-color: oklch(0.5 0.18 25) !important; }
   ```

4. In `js/main.js`, add this new block. Insert it immediately after the closing `}` of the existing contact-form submit-handler block (currently ending at `js/main.js:74`) and before the blank line preceding the parallax block (currently starting at `js/main.js:76`):

   ```javascript
     if (form) {
       form.querySelectorAll('[required]').forEach((field) => {
         field.addEventListener('invalid', () => {
           field.classList.add('is-shaking');
           field.addEventListener('animationend', () => field.classList.remove('is-shaking'), { once: true });
         });
       });
     }
   ```

   Note: this reuses the `form` constant already declared earlier in the file at `js/main.js:40` (`const form = document.getElementById('contactForm');`) — do not redeclare it.

## Boundaries

- Do NOT change native validation behavior (still block submission the same way) — this plan only adds visual feedback on top of it.
- Do NOT add custom validation messages or replace the browser's native validation tooltip — that's a separate, larger UX decision outside this plan's scope.
- Do NOT apply the shake to the submit button itself — only to the individual invalid field(s) that triggered the `invalid` event, since each field fires its own event.
- Do NOT touch the `access_key` or `botcheck` hidden/honeypot fields even though they don't have `required` (they don't — this is just a note that `form.querySelectorAll('[required]')` naturally excludes them, no extra filtering needed).
- If `js/main.js:40` or `:74` don't match the cited content (drift since commit 599da54), STOP and report instead of guessing where the contact-form block starts/ends.

## Verification

- **Mechanical**: no build step in this repo. Open `index.html` in a browser and confirm no console errors.
- **Feel check**: open the contact form, leave the "Tu nombre" field empty, fill the rest, and click "Enviar mensaje":
  - The browser's native validation tooltip should still appear (unchanged behavior).
  - The empty "Tu nombre" field should also visibly shake for about 400ms.
  - Fix the name field and resubmit with the email field invalid (e.g. "notanemail") — confirm the email field shakes instead.
  - Trigger the shake twice in a row on the same field (submit invalid, wait for shake to finish, submit invalid again) — confirm it replays cleanly each time, not just once.
  - In DevTools, set Animations panel playback to 10% and confirm the shake is a symmetric back-and-forth wobble, not a jump.
  - Toggle `prefers-reduced-motion` (Rendering panel) to `reduce`, reload, and repeat the empty-field submit: confirm the field's border turns red/highlighted instead of shaking — feedback is still present, just non-animated.
- **Done when**: submitting an invalid field visibly shakes it once (400ms), and reduced-motion users get a static red-border highlight instead.
