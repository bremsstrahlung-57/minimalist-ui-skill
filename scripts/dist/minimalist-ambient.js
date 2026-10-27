/*! minimalist-ui v1.1.0 | MIT */
const MODES = ["life", "rule30", "rule90", "rule110", "ant", "noise", "flow", "halftone", "stars", "rain", "truchet"];
function create(canvas, options = {}) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Ambient canvas requires a 2D context");
  let colours = options.colours?.length ? options.colours : ["#83a598"];
  let cell = Math.max(10, options.cellSize ?? 16);
  const fps = Math.min(30, Math.max(1, options.fps ?? 18));
  const reducedMotion = Boolean(options.reducedMotion);
  let mode = MODES.includes(options.mode) ? options.mode : "life";
  let paused = reducedMotion || Boolean(options.paused);
  let frame = 0, last = 0, raf = 0, dead = 0, width = 0, height = 0;
  let cols = 0, rows = 0, grid = [], ant = { x: 0, y: 0, dir: 0 }, ruleRow = [], ruleHistory = [];
  const random = () => Math.random();
  const pick = () => colours[Math.floor(random() * colours.length)];
  const resize = () => {
    const rect = canvas.getBoundingClientRect?.();
    const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    cell = Math.max(10, options.cellSize ?? 16) * dpr;
    width = Math.max(1, Math.round((rect?.width || canvas.width || 1) * dpr));
    height = Math.max(1, Math.round((rect?.height || canvas.height || 1) * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    cols = Math.max(1, Math.ceil(width / cell)); rows = Math.max(1, Math.ceil(height / cell));
    seed();
  };
  const seed = () => {
    frame = 0; dead = 0;
    if (mode.startsWith("rule")) {
      ruleRow = Array(cols).fill(0); ruleRow[Math.floor(cols / 2)] = 1; ruleHistory = [ruleRow.slice()];
    } else if (mode === "ant") {
      grid = Array.from({ length: rows }, () => Array(cols).fill(0)); ant = { x: cols >> 1, y: rows >> 1, dir: 0 };
    } else {
      grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => mode === "life" ? (random() < .24 ? 1 : 0) : (random() < .12 ? 1 : 0)));
    }
  };
  const square = (x, y, colour = pick()) => { context.fillStyle = colour; context.fillRect(x * cell, y * cell, Math.ceil(cell * .72), Math.ceil(cell * .72)); };
  const drawLife = () => {
    const next = Array.from({ length: rows }, () => Array(cols).fill(0)); let alive = 0;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += grid[(y + dy + rows) % rows][(x + dx + cols) % cols];
      const value = n === 3 || (grid[y][x] && n === 2) ? 1 : 0; next[y][x] = value;
      if (value) { square(x, y); alive++; }
    }
    grid = next; dead = alive ? 0 : dead + 1;
  };
  const drawRule = () => {
    const n = Number(mode.slice(4));
    const next = Array.from({ length: cols }, (_, x) => {
      const l = ruleRow[(x - 1 + cols) % cols], c = ruleRow[x], r = ruleRow[(x + 1) % cols];
      const value = (l << 2) | (c << 1) | r;
      return (n >> value) & 1;
    });
    ruleRow = next; ruleHistory.push(next);
    if (ruleHistory.length > rows) ruleHistory.shift();
    const offset = rows - ruleHistory.length;
    ruleHistory.forEach((line, y) => line.forEach((value, x) => { if (value) square(x, y + offset); }));
  };
  const drawAnt = () => {
    for (let i = 0; i < 3; i++) {
      const on = grid[ant.y][ant.x]; grid[ant.y][ant.x] = 1 - on; ant.dir = (ant.dir + (on ? 3 : 1)) % 4;
      ant.x = (ant.x + [0, 1, 0, -1][ant.dir] + cols) % cols; ant.y = (ant.y + [-1, 0, 1, 0][ant.dir] + rows) % rows;
    }
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (grid[y][x]) square(x, y);
    dead = 0;
  };
  const drawGlyphs = (flow = false) => {
    context.font = `${cell}px monospace`; context.textBaseline = "top";
    const glyphs = mode === "stars" ? ["·", "✦", "*", "⋆"] : [".", ":", "*", "+"];
    const density = flow ? .16 : mode === "stars" ? .045 : .08;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (random() < density) {
      const angle = Math.sin(x / 12 + frame / 30) + Math.cos(y / 10 - frame / 40);
      const glyph = flow ? ["─", "╲", "│", "╱"][Math.min(3, Math.floor(((angle + 2) / 4) * 4))] : glyphs[Math.floor(random() * glyphs.length)];
      context.fillStyle = pick(); context.fillText(glyph, x * cell, y * cell);
    }
  };
  const drawHalftone = () => {
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const amount = (Math.sin(x / 8 + frame / 80) + Math.cos(y / 7 - frame / 100) + 2) / 4;
      if (random() < amount * .55) square(x, y);
    }
  };
  const drawRain = () => {
    context.font = `${cell}px monospace`; context.textBaseline = "top";
    for (let x = 0; x < cols; x++) if (random() < .13) {
      const y = (Math.floor(random() * rows) + frame / 3) % rows;
      context.fillStyle = pick(); context.fillText(["░", "▒", "·", "╎"][Math.floor(random() * 4)], x * cell, y * cell);
    }
  };
  const drawTruchet = () => {
    context.font = `${cell}px monospace`; context.textBaseline = "top";
    const glyphs = ["┌", "┐", "└", "┘", "╭", "╮", "╰", "╯"];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      context.fillStyle = colours[(x + y + frame) % colours.length]; context.fillText(glyphs[Math.floor(random() * glyphs.length)], x * cell, y * cell);
    }
  };
  const render = () => {
    context.clearRect(0, 0, width, height);
    if (mode === "life") drawLife(); else if (mode.startsWith("rule")) drawRule(); else if (mode === "ant") drawAnt();
    else if (mode === "noise" || mode === "stars") drawGlyphs(false); else if (mode === "flow") drawGlyphs(true);
    else if (mode === "halftone") drawHalftone(); else if (mode === "rain") drawRain(); else drawTruchet();
    frame++;
    if (dead > 100) seed();
  };
  const tick = (time) => {
    raf = 0;
    if (paused) return;
    if (time - last >= 1000 / fps) { last = time; render(); }
    raf = globalThis.requestAnimationFrame(tick);
  };
  const start = () => { if (reducedMotion) { resize(); render(); return; } if (!raf && !paused) raf = globalThis.requestAnimationFrame(tick); };
  const stop = () => { if (raf) globalThis.cancelAnimationFrame(raf); raf = 0; };
  const setMode = (next) => { if (!MODES.includes(next)) throw new RangeError(`Unknown ambient mode: ${next}`); mode = next; resize(); render(); };
  const setPaused = (next) => { paused = Boolean(next); if (paused) { stop(); } else start(); };
  const setColours = (next) => { if (!next?.length) return; colours = [...next]; render(); };
  const destroy = () => { stop(); observer?.disconnect(); context.clearRect(0, 0, width, height); };
  resize();
  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  render();
  if (!paused) start();
  return { start, stop, setMode, setPaused, setColours, destroy, get mode() { return mode; }, get paused() { return paused; } };
}
function mount(scope = document) {
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
export { create, mount };
