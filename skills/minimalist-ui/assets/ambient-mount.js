import { create } from './ambient.js';

/* Optional auto-wiring for the ambient canvas. Markup contract:
     <canvas class="ambient" data-ambient="life" aria-hidden="true"></canvas>
     <button class="button" type="button" data-ambient-pause>Pause background</button>   (optional)
   data-ambient picks the mode; data-cell sets the cell size. The pause button's text is managed here.
   Behaviour: theme colours follow --accent and --muted live; paused while the tab is hidden, when
   reduced motion is on, when the reader paused it, and under data-voice="professional" (canvas and
   button are hidden there). Reduced motion draws one static frame. Everything is released on pagehide.
   If reduced motion changes after load, reload to switch between the static frame and animation. */
export function mount(scope = document) {
  const html = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  return [...scope.querySelectorAll('canvas[data-ambient]')].map((canvas) => {
    const colours = () => {
      const styles = getComputedStyle(html);
      return [styles.getPropertyValue('--accent').trim(), styles.getPropertyValue('--muted').trim()].filter(Boolean);
    };
    const core = create(canvas, {
      mode: canvas.dataset.ambient || 'life',
      cellSize: Number(canvas.dataset.cell) || undefined,
      colours: colours(),
      reducedMotion: reduced.matches
    });
    const button = scope.querySelector('[data-ambient-pause]');
    let manual = false;
    const sync = () => {
      const quiet = html.dataset.voice === 'professional';
      canvas.hidden = quiet;
      core.setPaused(document.hidden || reduced.matches || manual || quiet);
      if (!button) return;
      button.hidden = quiet;
      button.disabled = reduced.matches;
      button.setAttribute('aria-pressed', String(manual));
      button.textContent = reduced.matches ? 'Background paused (reduced motion)' : manual ? 'Resume background' : 'Pause background';
    };
    const onClick = () => { manual = !manual; sync(); };
    const observer = new MutationObserver(() => { core.setColours(colours()); sync(); });
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme', 'data-mode', 'data-voice'] });
    button?.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    const destroy = () => {
      observer.disconnect();
      button?.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', sync);
      core.destroy();
    };
    addEventListener('pagehide', destroy, { once: true });
    sync();
    return { core, destroy };
  });
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', () => mount(), { once: true });
else mount();
