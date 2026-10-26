---
name: minimalist-ui
description: "Use this skill whenever a user asks for a minimal, clean, simple, nerdy or terminal-inspired interface, monospace typography, ASCII, dashed borders, Gruvbox, Tokyo Night, Catppuccin, Nord, Rose Pine, Game of Life or another generative background, or says make it look good but not generic. Apply its textured-minimal aesthetic to any website or app. Skip it when the user specifies a different explicit style or brand system, or asks for conventional corporate or luxury design."
license: MIT
---

# Textured minimal

Few elements and little chrome, with each element carrying character. Keep content
clear and the interface useful; make restraint tactile rather than empty. This is
neither white-space-first corporate minimalism nor a terminal costume. Apply to any
real page or app: storefronts, docs, blogs, dashboards, forms, tools, community
pages, and personal sites among others. There is no default page structure.

## Scope and precedence

- Work only inside the current workspace and this skill's own folder. An empty
  workspace means build from `assets/starter.html`. If the user refers to a site
  not present in the workspace, ask them for its files.
- Preserve real content, routes, brand constraints, existing flows, and
  architecture. This skill decides look and feel; other applicable guidance may
  add non-style requirements such as real content, accessibility, and motion
  budgets.
- Teach decisions, not a page to clone. `assets/starter.html` is neutral
  placeholder content and a reference implementation of the output, not a required
  stack.
- Inspect the actual project before coding. Read its package manifest,
  configuration and source to identify the stack and styling system. Match its
  conventions; never add a framework, utility CSS system, or component library it
  does not already use.
- State the chosen dials in one line before building:
  `TEXTURE n / DENSITY n / MOTION n`.

## Direction and dials

Set one focal point and one primary action per view. Choose composition around the
task, not a preset content sequence. Use monospace throughout, themed paper and
ink, one restrained accent, a strong dashed outer frame where it fits, dashed
accent underlines for section titles, `*` bullets, and muted `meta` lines. Give
buttons a dashed resting border and an inverted or subtly beveled hover. A
low-opacity cellular or generative canvas is optional; if present, show an
accessible pause control. A fixed footer bar can hold theme choice; floating
dashed utility controls are for a real, useful action. Add the opacity-plus-12px-
rise entrance once, and never make content depend on animation.

Dials run from 1 to 10; defaults are `TEXTURE 4 / DENSITY 5 / MOTION 3`. Texture
is visual ornament, density is content and control packing, motion is nonessential
movement. Pick values for the task and state them before implementation. Starting
points:

| Page type | Texture | Density | Motion |
| --- | ---: | ---: | ---: |
| Docs, articles, reading | 2 | 4 | 1 |
| Dashboards, data tools | 2 | 8 | 1 |
| Forms, checkout, settings | 3 | 5 | 1 |
| Storefronts, directories | 4 | 5 | 2 |
| Landing pages | 7 | 4 | 4 |
| Personal sites | 7 | 4 | 4 |

At low texture, keep the palette, type, and one clear dashed detail; omit glow and
default canvas on docs and dashboards. Higher texture means a few more deliberate
touches, not every effect at once. See `references/page-types.md` to calibrate by
task.

## Taste and visual decisions

- Keep body type comfortably readable, usually at least 16px with open line
  spacing. A reading measure near 45–75 characters is a useful start; data and
  controls may need more width.
- Establish hierarchy through size, weight, alignment, and grouping before adding
  boxes. Use regular spacing steps and align related labels, controls, and headings.
- Use flat themed surfaces. Dashed strokes signal emphasis; solid rules organize
  repeated data or fields. Do not outline every paragraph or control.
- Keep square corners as the baseline. Bevels belong on a pressable control or an
  intentional dialog, not every surface. Make hover geometry stable.
- Make the primary action obvious before hover. Secondary actions remain visible
  and understandable without decoration.
- Images, product photography, charts, and other media are welcome when real and
  useful. Reserve their dimensions; retain captions and meaningful detail.
- If a composition feels empty, restore content and hierarchy before adding
  ornament. If it feels like a terminal costume, remove prompts and fake system
  labels.
- Use one distinctive motif tied to the task. Prefer restraint over stacking the
  frame, canvas, CRT, animation, grain, and ASCII art in one view.
- Let scale contrast carry hierarchy: one oversized headline with one emphasised
  word against small uppercase labels. When the content has numbers, categories,
  or a position, draw that real data as the focal motif before reaching for
  decoration. Colour a category only alongside a label, glyph, or outline.
  `references/craft.md` has the full set of moves and what not to copy.

## Build in layers

1. **Design language:** use semantic design tokens as CSS custom properties and
   plain CSS component classes. Preserve the project's styling and component
   conventions by mapping the roles into them; do not replace an existing system.
2. **Ambient core:** when an ambient canvas is useful, use or adapt
   `assets/ambient.js`, a framework-free ES module. `create(canvas, options)`
   returns `start`, `stop`, `setMode`, `setPaused`, and `destroy`. Pass token
   colours. The module owns drawing, not application markup or theme persistence.
3. **Adapter:** detect the actual stack first, then read `references/stacks.md`
   for its short adapter recipe. The file includes all supported stacks; do not
   read it until detection is complete. Keep framework code thin and lifecycle-safe.

Theme choice and light/dark mode are separate. Apply saved theme and mode in a tiny
inline head script before paint, with system preference as the initial light/dark
setting. Persist safely; storage failure must not break the page. Canvas setup is
client-only; server and client markup must match. Reduced motion renders one static
ambient frame. Pause when the tab is hidden and on teardown. If there is no canvas,
use the CSS static fallback.

### Implementation sequence

1. Identify the actual page purpose, audience, content, route, and main task.
2. Inspect the existing source, assets, styling system, and component conventions.
3. Choose the dials, theme roles, content width, density, and one optional motif.
4. Build hierarchy and useful static content first; keep all real actions working.
5. Finish empty, loading, error, success, and disabled states that the flow needs.
6. Add texture only after the core is clear; keep it removable and low-cost.
7. Check the narrow layout, keyboard path, supported themes, and relevant states.

## UX rules outrank style

- Every state is designed: empty, loading, error, success, disabled. Never fake a
  working action or success.
- Show form labels; put errors by the field and associate them accessibly. Keep
  keyboard order logical, focus visible, and Escape able to close dialogs.
- Meet 4.5:1 contrast for normal text, including muted and faint tokens on the
  page colour. Status is never conveyed by colour alone.
- Work at 390px; interactive targets are at least 40px; tables scroll in their own
  labelled container. Prevent layout shift and apply theme before paint.
- Respect `prefers-reduced-motion`. Keep real content selectable and copyable. Do
  not invent testimonials, logos, statistics, or product facts; mark prototype
  content as placeholder.
- Keep decorative art out of accessible names. Give meaningful visualizations a
  text alternative and retain their important information in real text.
- Keep persistent controls clear of content, focus, form errors, and mobile safe
  areas. Do not make essential navigation depend on hover.

Avoid gradients, soft-shadow rounded cards, glassmorphism, emoji grids, fake logo
walls, mixed typefaces, animating everything, glow over long text, neon green on
black, and centring everything. Do not use command palettes or keyboard jump keys
as aesthetic furniture.

## Supporting files — progressive disclosure

Read only the material relevant to the work. Detect the stack before opening
`references/stacks.md`.

| File | Read when |
| --- | --- |
| `references/page-types.md` | Choosing composition and dials for a particular kind of page. |
| `references/themes.md` | Selecting or adding a theme, mapping roles, or checking contrast. |
| `references/craft.md` | Raising polish: headline scale, stat and bipolar data surfaces, segmented progress, category colour, tactile primary action, choice cards, share cards, copy voice. |
| `references/texture.md` | Considering the ambient canvas, ASCII, border language, micro-interactions, CRT, or Win98 details. |
| `references/components.md` | Implementing common controls, content patterns, tables, or component states. |
| `references/interaction-states.md` | Building forms, asynchronous feedback, menus, dialogs, keyboard behaviour, or motion. |
| `references/responsive-layout.md` | Choosing geometry, adapting dense views, or fixing responsive behaviour. |
| `references/stacks.md` | Only after identifying the project's stack and styling system; use its detection, mapping, and matching adapter recipe. |
| `assets/tokens.css` | Using the supplied role tokens or comparing the included palette definitions. |
| `assets/base.css` | Using the plain CSS component and base classes as an adaptable reference. |
| `assets/ambient.js` | Adding the framework-free ambient canvas core. |
| `assets/starter.html` | Workspace is empty, or a runnable neutral reference is useful. |

## Completion check

Use the real content and existing flows. Check theme contrast, keyboard focus and
dialog dismissal, reduced motion, hidden-tab pause, storage failure, long labels,
and 390px layout. Prefer a targeted build or test and a rendered review where
available. Report what was verified; say when visual or adapter testing was not
possible.
