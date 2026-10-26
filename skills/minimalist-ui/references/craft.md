# Craft layer

What made a well-regarded worked example (a quiz-and-results app with a risograph look) feel designed rather than assembled, translated into this skill's monospace, themed, square-cornered language. Take the decisions, not the surface. This skill keeps one typeface, square corners, no gradients, and its own theme palettes. Everything here is opt-in and sized by the TEXTURE dial; `assets/base.css` has the classes and `assets/starter.html` shows them.

## The moves

1. **Scale contrast is the hierarchy.** One oversized headline (`.display`, tight tracking, weight 800) set against small uppercase `kicker` lines and ordinary body text. Emphasise one word with italic and the accent; at TEXTURE 6+ it may carry a faint offset shadow (an overprint hint). With a single typeface, size, weight, italic, and case do the work that extra families would otherwise do. Large display text only needs 3:1, so check the accent at that threshold, not 4.5:1.
2. **A ruled label line, not a badge row.** Two or three short facts (what, how many, how long) as `rule-labels`: each is a small kicker with a solid rule above it. It reads like a masthead and replaces chips, pills, and fake status text. Use only true facts.
3. **One signature object that is real data.** The best screen had a hero visual that showed the product's actual model (a map with the user's position), not decoration. If the content has numbers, categories, or a position, draw that as the focal motif and let ASCII, canvas, and grain stay quiet. A decorative motif is the fallback, not the first choice.
4. **Numbers get their own surface.** `stats`: a hairline-ruled grid of big value + tiny uppercase label (+ optional `meter`). `bipolar`: a bar that grows outward from a centre line for opposed pairs, each end named with its value, and a plain-language foot line ("Leans Plan by 35"). Halftone dots over the fill give data texture without a gradient. Real text always carries the value; the bar is the second channel.
5. **Segmented strip instead of a thin progress bar.** One cell per step (`strip`), the current cell raised, answered cells filled with the colour of what they answered, neutral answers hatched. It doubles as progress, history, and a small fingerprint of the session (and can be reused on the share card).
6. **Category colour is a slot, never the message.** `--cat-1..6` come from each theme's own palette. Always pair a colour with a label, glyph, or position, and outline filled shapes in ink: several light-theme category colours measure under 3:1 against the page, so colour cannot be the boundary. Text on a category fill uses `--ink` over a light mix (`--tint`, 12% by default; Tokyo Day uses 0% because its ink is already near 4.5:1), never white-on-colour. If a hue is too weak in one mode, switch to a different palette step for that mode rather than darkening it.
7. **Tactile primary action.** `.button--primary` has a hard offset shadow in the accent. Hover is the usual inversion and the geometry does not move; on `:active` it travels the shadow distance and the shadow collapses, so it feels pressed. Secondary buttons stay dashed and flat. This is the one place a hard shadow belongs.
8. **Choice cards with keycaps.** `choice` is a dashed card; selecting makes the border solid and tints it with the option's own category colour. A `keycap` shows the key that picks it. Dashed means available, solid means chosen, the keycap inverts: three cues, none of them colour alone.
9. **Playful touches, one per screen, never in transactions.** A rotated `stamp` ("LOGGED") that lands when an answer is committed; an outlined ghost numeral behind a question or section; a drop cap on the first paragraph of a long reading; a small hover-grown dot field on grid cards (`dotted-corner`). Pick one. If two compete, remove both.
10. **The share card is part of the design.** If a user can export or share a result, render it with the same tokens: wordmark and an id at the top, the title, the central visual, the key numbers, the strip, and the URL at the bottom, inside a ruled frame. It is the one place the brand travels without the page, so it must read at thumbnail size and contain real data only.
11. **Voice.** Short, specific, a little dry: "Not a label. A location." beats "Welcome to our platform". Name the real cost and the real output ("~4 minutes", "no sign-up", "shareable card"). Label the interface with what it does. No filler superlatives; never invent proof.
12. **Empty and loading states carry the same weight as success.** `empty-state` gets a real heading at title scale and a clear next action. If a result takes visible time, show a short `boot-log` of the real steps being run; if nothing real is happening, show nothing and go straight through.

## Behaviour that earned the polish

- **Never drop input.** The quiz let fast typists press the next key during the 380 ms transition; the pending advance was flushed first and the key then handled. Do the same for any step-by-step flow with animation.
- **Direction-aware transitions.** New cards slide in from the right, back moves slide from the left; under reduced motion the animation becomes a 120 ms swap.
- **Live feedback while answering.** A small, sticky preview of the result (collapsing to a thumbnail row on phones) with an honest placeholder until there is enough data ("3 more answers to get a reading"), then a live title and percent complete.
- **Resume, don't restart.** Persist progress; on return show "Picked up where you left off" and a one-line resume link on the landing page with the previous result.
- **Two-step destructive actions.** The first press changes the label to "Tap again to clear"; it disarms after a short timeout. No modal for a recoverable reset.
- **Keyboard accelerators for repeated choose-one flows only**, shown as keycaps, hidden when `(hover: none)`, never the only way to act, and ignored while typing in a field or while a dialog is open. This is function, not furniture.
- **Colour modes.** If ink overprints or grain are used, blend with `multiply` on light and `screen` on dark, with lower grain opacity on dark. Do it with a mode-driven token, not two code paths.

## Do not carry over

- A second and third typeface, circular glyph discs, rotated tape, drop shadows on every panel, a scrolling ticker, or a paper-grain default. They are the example's identity, not this skill's. Use them only if the user asks for that identity.
- Fixed-colour text (`#1E1B18`) on category fills. Use tokens and the tint rule above so every theme stays readable.
- Cosmetic "analysing…" theatre over an instant computation.

## Use at each dial

| TEXTURE | Spend |
| --- | --- |
| 1–3 | Scale contrast, rule labels, stats, bipolar, strip, choice cards, tactile primary. No stamps or ghost numerals. |
| 4–6 | Add one playful touch per screen, `dotted-corner` on a grid, and an optional dropcap. |
| 7–10 | Add the overprint shadow on the display word, grain, and an ambient canvas or ASCII motif, one at a time. |
