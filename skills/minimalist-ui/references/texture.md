# Texture toolbox

Texture is a deliberate budget, not a checklist. At most one focal decorative treatment per screen; choose effects that suit its density and purpose. Dense data and long-form reading should not have motion or visible texture behind the content.

## Ambient canvas

`assets/ambient.js` is a plain ES module with no framework dependency. It accepts a canvas and token colours in `create(canvas, options)` and returns `start()`, `stop()`, `setMode(mode)`, `setPaused(boolean)`, and `destroy()`. Modes: Game of Life (`life`), Rule 30/90/110 (`rule30`, `rule90`, `rule110`), Langton's ant (`ant`), ASCII noise (`noise`), flow field (`flow`), dither/halftone (`halftone`), character starfield (`stars`), calm glyph rain (`rain`), and Truchet box-drawing tiles (`truchet`).

Shared constraints: opacity 0.08–0.2; use theme token colours; cells at least 10px; cap at 30fps; resize safely; reseed a dead simulation; canvas is `aria-hidden="true"`, behind content, and `pointer-events:none`. Provide a visible pause/play control whose accessible state stays in sync. Pause while the document is hidden; adapters own the visibility listener and remove it on teardown. With reduced motion, draw one static frame and do not schedule animation. Cancel animation and release observers on unmount. Use CSS-only static fallback when scripting, canvas, or a theme colour cannot be provided:

```css
.ambient-fallback { background-image: radial-gradient(var(--line) 1px, transparent 1px); background-size: 16px 16px; }
```

Never put a canvas behind dense tables, dashboards, long text, or forms that require precision. Avoid making the canvas a prerequisite for reading.

## ASCII and box drawing

Useful details include dividers, a frame, a small wordmark, empty and 404 states, loading/progress bars, tree views, badges, and `*` bullets. Use actual text in semantic elements; decorative art gets `aria-hidden="true"`. Meaningful art may use `role="img"` and a concise `aria-label`. Real information must not exist only in ASCII; keep meaningful text copyable. Align using `ch`, test proportional fallback and wide glyphs, and scale or hide ornament on narrow screens. Usually spend one ASCII motif per screen.

## Dashed, dotted, and solid

- Dashed: the page frame, a section-title underline, a key action, or a purposeful callout.
- Dotted: quiet, secondary separation or progress texture; do not use it for essential focus.
- Solid: forms, tables, dense grouping, and boundaries that need continuous clarity.
- Keep corners square. Keep stroke weights stable across interaction states. Use a dashed accent focus ring with an offset; never substitute a dashed border for focus indication.
- Avoid more than two nested frames. A heavy outer frame plus multiple framed cards overwhelms the content.

## Micro-interactions

A blinking block cursor, one boot line that types once, a small hover inversion/bevel, limited text-scramble on hover, selection colour, ASCII scroll-progress bar, and opacity-plus-12px entrance rise are optional. Motion dial defaults low; entrance is once-only and never hides content. No required boot delay. Scramble must preserve the real accessible label and must not obstruct copy, selection, or touch use. Keep status understandable without motion.

## Optional flavors

Both flavors are opt-in, clearly switchable off, and off by default. The base visual language works without either.

- **CRT:** use static scanlines, restrained accent glow, and optional rounded screen corners. Never flicker, roll a band, clip content, obscure focus, or glow over long text. Turning it off restores ordinary clear text and corners. Under reduced motion, remove any animation; preferably keep scanlines static or disable them.
- **Win98:** use purposeful modal/help/error windows with a grey face, dark readable text, a blue title strip, square geometry, and raised/inset button treatment. Preserve native dialog semantics, Escape, focus containment/restoration, and honest controls. Do not simulate operating-system errors for a real failure.
- A single bitmap-font headline or subtle grain may be added if legible and low-cost. Do not change the body font or add grain by default. `assets/base.css` has an opt-in `.grain` class: add it to the root, it multiplies on light modes and screens at lower opacity on dark modes, and it never intercepts input.
- Halftone dots (`.halftone`, bipolar fills, `dotted-corner`) are the data-friendly texture; prefer them over canvas where the page shows numbers.

Never stack every effect. The TEXTURE dial decides how many visual details the task can support.
