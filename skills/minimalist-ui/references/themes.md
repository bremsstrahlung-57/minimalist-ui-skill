# Themes and contrast

Use three independent choices: theme family (`data-theme`), light/dark appearance (`data-mode`), and system preference when no saved mode exists. `assets/tokens.css` implements the role tokens `--page`, `--surface`, `--ink`, `--muted`, `--faint`, `--line`, `--accent`, `--accent-soft`, `--danger`, `--ok`, and `--warn`. Keep roles stable when mapping into the project's existing theme system. A role's hue may change; its job must not.

Included palettes are Gruvbox (default; light and dark), Tokyo Night (Night and Storm dark; Day light), Catppuccin (Mocha dark; Latte light), Rose Pine (main dark; Dawn light), Nord (dark only), and Everforest (light and dark). Do not invent modes for families without a published variant. Theme names use `data-theme`; mode uses `data-mode="light|dark"`.

## Applying before paint

Put this small inline script in the document head before styles can paint. It validates saved choices, defaults to Gruvbox plus system light/dark preference, and safely handles unavailable storage. Keep the root attributes synchronous and independent of the ambient renderer.

```html
<script>
(() => {
  const modes = {
    gruvbox: ['light', 'dark'], 'tokyo-night': ['dark'], 'tokyo-storm': ['dark'],
    'tokyo-day': ['light'], 'catppuccin-latte': ['light'], 'catppuccin-mocha': ['dark'],
    'rose-pine': ['dark'], 'rose-pine-dawn': ['light'], nord: ['dark'],
    everforest: ['light', 'dark']
  };
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  try {
    const saved = JSON.parse(localStorage.getItem('textured-minimal-theme') || '{}');
    const theme = Object.prototype.hasOwnProperty.call(modes, saved.theme) ? saved.theme : 'gruvbox';
    const mode = modes[theme].includes(saved.mode) ? saved.mode : (modes[theme].includes(system) ? system : modes[theme][0]);
    root.dataset.theme = theme; root.dataset.mode = mode;
  } catch {
    root.dataset.theme = 'gruvbox'; root.dataset.mode = system;
  }
})();
</script>
```

The picker changes family and mode, reflects the active state, and persists a JSON choice with `localStorage.setItem('textured-minimal-theme', JSON.stringify({theme, mode}))`. Save `mode: 'system'` when the user selected system-following behavior; resolve that against `matchMedia` before applying. If the system setting changes while that choice remains active, update the root mode. A storage failure must not disable the picker.

## Contrast is measured, not eyeballed

Muted and faint text must each reach 4.5:1 against `--page` in every supported theme/mode. Check all foreground text roles against every surface they are placed on, plus focus and selection states. Semantic status also needs readable text or symbols. The following small Node script parses the token declarations and checks page/muted/faint; run it after palette edits (include computed CSS if declarations become more complex):

```js
const fs = require('node:fs');
const css = fs.readFileSync('skills/minimalist-ui/assets/tokens.css', 'utf8');
const blocks = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)];
function hex(s) { const m = s.match(/#([\da-f]{6})/i); return m && m[1].match(/../g).map(x => parseInt(x, 16) / 255); }
function lum(rgb) { const c = rgb.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126*c[0] + .7152*c[1] + .0722*c[2]; }
function ratio(a,b) { const x=lum(a), y=lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
let bad = 0;
for (const [, selector, body] of blocks) {
  if (!selector.includes('[data-theme=')) continue;
  const vars = Object.fromEntries([...body.matchAll(/--(page|muted|faint):\s*(#[\da-f]{6})/gi)].map(([,k,v]) => [k.toLowerCase(), hex(v)]));
  if (!vars.page || !vars.muted || !vars.faint) continue;
  for (const key of ['muted','faint']) { const value=ratio(vars.page,vars[key]); if (value < 4.5) { bad++; console.error(`${selector.trim()} ${key}: ${value.toFixed(2)}:1`); } else console.log(`${selector.trim()} ${key}: ${value.toFixed(2)}:1`); }
}
if (bad) process.exitCode=1;
```

The script intentionally checks concrete hex declarations only. CSS aliases, opacity, gradients, or cascade changes require computing the final resolved colours separately. Do not paper over a failing ratio by claiming visual adequacy.

## Derive a theme from three colours

Start with one intended page colour, one ink colour that passes contrast, and one accent. Select actual palette values rather than arbitrarily shifting hues. Choose surface and accent-soft as nearby official palette steps; select line, danger, ok, and warn from the same palette where possible. Make muted and faint by choosing other palette steps that independently pass 4.5:1 on page, not by mixing toward the background. Then run the contrast check and inspect every semantic role in context.
