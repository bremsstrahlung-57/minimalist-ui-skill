# minimalist-ui

A skill for a textured-minimal visual language: monospace type, themed paper and ink, restrained dashed details, accessible controls, and optional generative texture. It teaches aesthetic and UX decisions for any website or application stack rather than prescribing a page template.

Install the skill with `npx skills add bremsstrahlung-57/minimalist-ui-skill`.

`references/craft.md` holds the polish layer (headline scale, data surfaces, segmented progress, category colour slots, tactile primary action, choice cards), distilled from a reviewed worked example and adapted to the skill's single-typeface, square-corner language.

## Voice and type

Three voices (`data-voice`: `nerd`, `neutral`, `professional`) dial the terminal motifs down without changing structure or themes, and a `data-type="readable"` preset keeps mono headings and labels over a proportional body. Both persist with the theme and are applied before paint by `head.js`.

## Standalone build

`npm run build` (no dependencies) writes `dist/` and mirrors it into `skills/minimalist-ui/dist/` so an installed skill carries it. `npm run check` fails if either copy is stale.

```html
<script src="head.js"></script>
<link rel="stylesheet" href="minimalist.min.css">
<canvas class="ambient" data-ambient="life" aria-hidden="true"></canvas>   <!-- optional -->
<button class="button" type="button" data-ambient-pause>Pause background</button>   <!-- optional -->
<script type="module" src="minimalist-ambient.js"></script>   <!-- optional -->
```

`dist/example.html` is a working page that uses only those files. Serve it over HTTP; browsers block module scripts on `file://`. The ambient file is not minified (no minifier is bundled); it is about 9 KB.

The skill's plain HTML reference lives in `skills/minimalist-ui/assets/starter.html`; its theme tokens, base CSS, ambient canvas core, and implementation notes are in that folder.

Author: Sagar Sharma
License: MIT
