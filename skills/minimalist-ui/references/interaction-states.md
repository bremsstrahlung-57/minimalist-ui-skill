# Interaction states and restrained motion

Read when implementing controls, forms, async feedback, overlays, or optional effects. Use native behavior and existing tested components before custom interaction code. Keep real flows and semantics intact; texture never hides a state or action.

## State coverage

Implement states required by the actual flow, not every possible state by default.

| Element | Considerations |
| --- | --- |
| Link | Clear destination, visible focus, distinguishable from nearby text |
| Button | Strong resting affordance, hover, focus, press, disabled or pending when applicable |
| Toggle | Discoverable label and synchronized visual, pressed/checked, and saved states |
| Field | Visible label, help, focus, value, validation, and preserved input on failure |
| Async action | Pending feedback, real success, actionable failure, duplicate protection when needed |
| Results | Loading, populated, empty, and failed states without losing filters/context |
| Menu | Open/closed state, expected keyboard behavior, sensible focus and dismissal |
| Dialog | Accessible name, focus containment, visible close, Escape, focus return |

Primary actions need a clear resting treatment; hover bevel cannot be their only signal. Selected differs from hovered. Disabled differs from pending.

## Forms and transactions

Use native input types and relevant autocomplete. Put errors beside fields and associate through descriptive relationships; mark invalid fields. With multiple submission errors, provide a concise summary and a route to correction. Do not clear valid input. Confirm destructive intent when appropriate and explain the consequence plainly. Never replace real success with a timer or simulated terminal output; if a service is unavailable, say so.

## Keyboard, focus, and overlays

Use semantic links, buttons, selects, and native dialog behavior when suitable. Show focus on every interactive element and ensure it is not clipped. Keep keyboard order aligned with visual task order. Return focus to the opener after closing an overlay, or to the next logical control if it no longer exists. Do not steal focus for routine updates. Use live announcements sparingly for meaningful async changes, not decorative effects or every keystroke.

## Fast flows

In repeated choose-one flows, never drop input typed during a transition: flush the pending advance, then handle the key. Direction-aware slides become a short swap under reduced motion. Number or letter shortcuts are acceptable here only as an accelerator, shown as keycaps, hidden on `(hover: none)`, ignored inside fields and open dialogs. A two-step "tap again to clear" is enough for a recoverable reset. Loading lines name steps that really run; skip them when the work is instant.

## Motion budget

Complete the static interface before adding motion. Small color/opacity feedback can be brief; entrances are optional, once-only, and never delay access. Reduced motion removes travel, flicker, rolling bands, and decorative loops while retaining state feedback. Do not require a boot sequence. Motion must not conceal missing content or animate layout on hover.

## Ambient effects

Keep effects independently removable and outside the primary flow. A canvas is decorative, ignored by assistive technology, and never intercepts input. Provide a visible pause control; pause when hidden; reduced motion renders a single frame. Cancel scheduled animation and release observers on teardown. For CRT, use static scanlines only; avoid flashing, heavy glow, cropped corners, or effects over precision workflows. Handle saved preference failure without breaking controls.

## Focused verification

Complete the main task by keyboard and at touch size. Test failure, retry, long labels, and empty states where relevant. For overlays, verify Escape, focus containment and return. For effects, verify reduced motion, hidden-tab pause, resize, teardown, and unavailable storage. State whether browser-tested or source-inspected only.
