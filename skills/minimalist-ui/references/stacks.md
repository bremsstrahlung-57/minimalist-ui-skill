# Stack detection, token mapping, and adapters

Read this file only after identifying the project's stack and styling system. Recipes illustrate lifecycle, not complete application templates. Keep the existing router, component library, build setup, theme behavior, and markup conventions.

## Detect before changing

1. Read the package manifest and lockfile; identify framework, renderer, version, scripts, and already-installed packages.
2. Inspect config and representative source: CSS entrypoints, component imports, theme/provider setup, server rendering, and existing canvas/effect lifecycle.
3. Identify styling: utility classes, CSS modules, CSS-in-JS, design tokens, Sass, component-library theme, plain CSS, or server templates. Verify conventions in actual use rather than relying on dependencies alone.
4. Reuse existing abstractions. Never install a framework, utility system, CSS-in-JS package, or UI library just for this aesthetic.

## Token mapping

Keep the semantic roles and map them to existing variables/theme config. Theme values remain CSS custom properties so switching attributes updates all components. If a library owns controls, restyle through its theme/provider tokens, not parallel replacement components.

| Existing styling system | Mapping approach |
| --- | --- |
| Tailwind v3 | Extend `theme.colors` with `var(--page)` etc. If using opacity modifiers, define RGB channels with `<alpha-value>` as required by the project's config. |
| Tailwind v4 | Declare semantic names in `@theme` using `var(--page)` etc.; retain custom properties as the source of truth. |
| shadcn/ui | Map role variables into the established `--background`, `--foreground`, `--card`, `--border`, `--primary`, `--destructive` and related variables in the expected color format. Keep existing component contracts. |
| MUI | Map roles to the theme palette (`background.default`, `background.paper`, `text.primary`, `text.secondary`, `divider`, `primary`, `error`, `success`, `warning`). Ensure theme mode changes with root attributes. |
| Mantine | Set color scheme and semantic colors through the existing provider/theme; use CSS variables for roles and override component variables locally where appropriate. |
| Chakra | Map roles through the existing semantic tokens and color mode configuration; do not add another provider or theme layer. |
| CSS Modules | Keep module-local component selectors; define shared role custom properties in the existing global theme file and consume via `var()`. |
| Sass | Keep Sass for structure if already used, but let CSS custom properties carry runtime theme roles. Avoid duplicating theme hexes in compiled Sass. |
| Plain CSS / server templates | Include the role-token stylesheet and base classes in the existing stylesheet pipeline; change root attributes in the shared document layout. |
| CSS-in-JS / vanilla-extract / other | Map to the project's existing token and theme API, with CSS custom properties as the runtime boundary. |

## SSR, hydration, and theme timing

Run a tiny theme-preference script inline in `<head>` before paint, on every stack. It reads saved theme/mode defensively, otherwise follows system light/dark; set root attributes before styles render. A strict content-security policy needs the project's nonce/hash mechanism. Do not generate different structural markup on server and client. Canvas code runs only after client mount/hydration; no browser globals during server render. Initialize the canvas empty or static in markup so server and client output match. If initial theme is unavailable server-side, preserve stable markup and avoid suppressing hydration warnings unless the existing framework explicitly requires it.

## Ambient adapter recipes

All examples assume an accessible `<canvas aria-hidden="true">` already exists, a visible pause control, and a color array derived from tokens. Add a visibility listener to pause while hidden and remove it on teardown. Adapt names and event syntax to the versions already installed. `create()` handles resizing; always call `destroy()` on teardown. For reduced motion pass `reducedMotion: true`, yielding a static initial frame.

### React

```jsx
"use client";
import { useEffect, useRef } from "react";
import { create } from "./ambient.js";
export function Ambient({ mode, colours, reducedMotion }) {
  const canvas = useRef(null), core = useRef(null);
  useEffect(() => {
    const themeColours = colours ?? [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()];
    core.current = create(canvas.current, { mode, colours: themeColours, reducedMotion });
    const visibility = () => core.current?.setPaused(document.hidden || reducedMotion);
    document.addEventListener("visibilitychange", visibility); visibility();
    return () => { document.removeEventListener("visibilitychange", visibility); core.current?.destroy(); core.current = null; };
  }, [mode, colours, reducedMotion]);
  return <canvas ref={canvas} aria-hidden="true" className="ambient" />;
}
```

### Next

Use a client component for the canvas; put `"use client"` at its top. The theme script stays in the server-rendered document head and runs before paint. Start the core in `useEffect`, never while rendering. `destroy()` cancels its scheduled animation frame and releases its resize observer. Keep server/client markup identical and do not read browser globals during render. The React recipe above is the client implementation; place it in a client boundary and pass the current mode, colors, and reduced-motion setting from its parent.

In the server page, render the stable component boundary and pass serializable
props. Keep the head script (`assets/head.js`, see `themes.md`) in the document layout; do not
read saved preferences during server rendering.

### Vue

```vue
<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { create } from './ambient.js';
const props = defineProps({ mode: String, colours: Array, reducedMotion: Boolean });
const canvas = ref(null); let core, onVisibility;
onMounted(() => {
  const colours = props.colours ?? [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()];
  core = create(canvas.value, { mode: props.mode, colours, reducedMotion: props.reducedMotion });
  onVisibility = () => core.setPaused(document.hidden || props.reducedMotion);
  document.addEventListener('visibilitychange', onVisibility); onVisibility();
});
watch(() => props.mode, value => core?.setMode(value));
onBeforeUnmount(() => { document.removeEventListener('visibilitychange', onVisibility); core?.destroy(); });
</script>
<template><canvas ref="canvas" class="ambient" aria-hidden="true"></canvas></template>
```

### Nuxt

Put the canvas behind the framework's client-only boundary. Keep theme selection in the shared head before paint, not in a mounted hook. Use the Vue recipe's mounted/unmount lifecycle and do not access browser globals in server setup.

```vue
<script setup>
import Ambient from '~/components/Ambient.vue';
</script>
<template>
  <ClientOnly>
    <Ambient mode="life" />
    <template #fallback><div class="ambient-static" aria-hidden="true"></div></template>
  </ClientOnly>
</template>
```

The canvas element and fallback must not change surrounding page content or its keyboard order.

### Svelte

```svelte
<script>
  import { onMount } from 'svelte';
  import { create } from './ambient.js';
  export let mode, colours, reducedMotion = false;
  let canvas;
  onMount(() => {
    const themeColours = colours ?? [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()];
    const core = create(canvas, { mode, colours: themeColours, reducedMotion });
    const visibility = () => core.setPaused(document.hidden || reducedMotion);
    document.addEventListener('visibilitychange', visibility); visibility();
    return () => { document.removeEventListener('visibilitychange', visibility); core.destroy(); };
  });
</script>
<canvas bind:this={canvas} class="ambient" aria-hidden="true"></canvas>
```

### SvelteKit

Use the Svelte recipe's `onMount`; it runs only in the browser. Keep theme initialization in the shared head and keep module initialization and server load functions free of browser APIs.

```svelte
<!-- +page.svelte; child canvas component is the Svelte recipe above -->
<script>
  import Ambient from '$lib/Ambient.svelte';
  export let data;
</script>
<svelte:head><title>{data.title}</title></svelte:head>
<main><h1>{data.title}</h1><Ambient mode="life" colours={data.ambientColours} /></main>
```

Pass data from the normal server load when possible; do not query local storage during SSR. Keep the page and island markup stable through hydration.

### Astro

Keep the page/theme head and canvas shell in server-rendered markup. Hydrate only a small island where the canvas is useful; theme script remains in head. A client-only React island can use the React recipe above:

```astro
---
import Ambient from '../components/Ambient.jsx';
---
<html><head><title>Current page</title></head><body>
  <main><h1>Current page</h1><Ambient client:load mode="life" /></main>
</body></html>
```

The island owns the hidden-tab listener and destroys the core on unmount. Do not hydrate the whole page for a decorative canvas; use the CSS static fallback if no island is warranted.

### Solid

Create a small client component. Start in `onMount`, pause on hidden tabs, and clean up both the listener and core in `onCleanup`.

```jsx
import { onCleanup, onMount } from 'solid-js';
import { create } from './ambient.js';
export function Ambient(props) {
  let canvas;
  onMount(() => {
    const core = create(canvas, { mode: props.mode, colours: props.colours, reducedMotion: props.reducedMotion });
    const visibility = () => core.setPaused(document.hidden || props.reducedMotion);
    document.addEventListener('visibilitychange', visibility); visibility();
    onCleanup(() => { document.removeEventListener('visibilitychange', visibility); core.destroy(); });
  });
  return <canvas ref={canvas} class="ambient" aria-hidden="true" />;
}
```

Render the same canvas shell on server and client; do not read browser globals during server execution.

### Angular

Create after view initialization, not in the constructor or template evaluation. Clean up listener and core on component destroy.

```ts
@ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
private core?: ReturnType<typeof create>;
private visibility = () => this.core?.setPaused(document.hidden);
ngAfterViewInit() {
  if (!isPlatformBrowser(this.platformId)) return;
  this.core = create(this.canvas.nativeElement, { mode: this.mode, colours: this.colours, reducedMotion: this.reducedMotion });
  document.addEventListener('visibilitychange', this.visibility); this.visibility();
}
ngOnDestroy() {
  document.removeEventListener('visibilitychange', this.visibility);
  this.core?.destroy();
}
```

Inject the platform ID and use the existing server-rendering guard. Keep canvas markup stable in both outputs.

### Plain HTML

Load the module after the canvas markup; keep a static CSS fallback for script-disabled browsers.

```html
<canvas id="ambient" class="ambient" aria-hidden="true"></canvas>
<button id="pause" type="button" aria-pressed="false">Pause background</button>
<script type="module">
  import { create } from './ambient.js';
  const canvas = document.querySelector('#ambient');
  const styles = getComputedStyle(document.documentElement);
  const core = create(canvas, { mode: 'life', colours: [styles.getPropertyValue('--accent').trim()] });
  const button = document.querySelector('#pause');
  button.addEventListener('click', () => {
    const paused = !core.paused; core.setPaused(paused);
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Resume background' : 'Pause background';
  });
  const visibility = () => core.setPaused(document.hidden || button.getAttribute('aria-pressed') === 'true');
  document.addEventListener('visibilitychange', visibility);
  addEventListener('pagehide', () => { document.removeEventListener('visibilitychange', visibility); core.destroy(); }, { once: true });
</script>
```

Keep `head.js` before paint. `assets/ambient-mount.js` auto-mounts any `canvas[data-ambient]` and follows theme, mode, and voice changes; use `create` from `assets/ambient.js` directly only for custom lifecycle control.

### Server templates

Put the validated inline theme script from `themes.md` in the shared base layout's `<head>` before styles. Include token/base CSS through the existing asset pipeline and keep the canvas shell in the shared body layout.

```html
<head>

  <link rel="stylesheet" href="/assets/tokens.css">
  <link rel="stylesheet" href="/assets/base.css">
</head>
<body>
  <canvas id="ambient" class="ambient" aria-hidden="true"></canvas>
  <main>Server-rendered page content</main>
  <script type="module">
    import { create } from '/assets/ambient.js';
    const canvas = document.querySelector('#ambient');
    const colours = [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()];
    const core = create(canvas, { mode: 'life', colours });
    const visibility = () => core.setPaused(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    addEventListener('pagehide', () => { document.removeEventListener('visibilitychange', visibility); core.destroy(); }, { once: true });
  </script>
</body>
```

The optional adapter derives role colors after the theme is applied, creates the core in browser code, synchronizes mode/pause controls, and pauses on hidden tabs. Keep server output useful without script. If navigation replaces the page without a full reload, destroy the old core and listeners when the view is removed.
