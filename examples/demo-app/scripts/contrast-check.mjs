// Token contrast audit for the worked example, examples/demo-app.
// Run from examples/demo-app: node scripts/contrast-check.mjs
// Point at another app with DEMO_APP=<dir> or --app <dir>.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const flag = process.argv.indexOf('--app')
const appOption = flag === -1 ? process.env.DEMO_APP : process.argv[flag + 1]
const appRoot = appOption
  ? resolve(appOption)
  : fileURLToPath(new URL('../', import.meta.url))

const css = readFileSync(resolve(appRoot, 'src/styles/tokens.css'), 'utf8')
const blocks = new Map()
const unqualified = new Map()

for (const match of css.matchAll(/\[data-theme="([^"]+)"\](?:\[data-mode="([^"]+)"\])?\s*\{([^}]*)\}/g)) {
  const [, theme, mode, body] = match
  const tokens = {}
  for (const token of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[token[1]] = token[2].trim()
  }
  blocks.set(`${theme}|${mode ?? 'light'}`, tokens)
  // A theme block without a mode is the single palette for both modes (e.g. Graphite).
  if (!mode) unqualified.set(theme, tokens)
}

const variants = [
  { family: 'Gruvbox', mode: 'light', theme: 'gruvbox' },
  { family: 'Gruvbox', mode: 'dark', theme: 'gruvbox' },
  { family: 'Everforest', mode: 'light', theme: 'everforest' },
  { family: 'Everforest', mode: 'dark', theme: 'everforest' },
  { family: 'Tokyo Day', mode: 'light', theme: 'tokyo-day' },
  { family: 'Tokyo Night', mode: 'dark', theme: 'tokyo-night' },
  { family: 'Catppuccin Latte', mode: 'light', theme: 'catppuccin-latte' },
  { family: 'Catppuccin Mocha', mode: 'dark', theme: 'catppuccin-mocha' },
  { family: 'Rose Pine Dawn', mode: 'light', theme: 'rose-pine-dawn' },
  { family: 'Rose Pine', mode: 'dark', theme: 'rose-pine' },
  { family: 'Nord Snow', mode: 'light', theme: 'nord-snow' },
  { family: 'Nord Polar', mode: 'dark', theme: 'nord' },
  { family: 'Graphite', mode: 'light', theme: 'graphite' },
  { family: 'Graphite', mode: 'dark', theme: 'graphite' },
  { family: 'Atelier', mode: 'light', theme: 'atelier' },
  { family: 'Atelier', mode: 'dark', theme: 'atelier' },
]

const pairs = [
  ['ink', 'page', 4.5],
  ['ink', 'surface', 4.5],
  ['muted', 'page', 4.5],
  ['muted', 'surface', 4.5],
  ['faint', 'page', 4.5],
  ['faint', 'surface', 4.5],
  ['accent', 'page', 4.5],
  ['accent', 'surface', 4.5],
  ['danger', 'page', 4.5],
  ['ok', 'page', 4.5],
  ['warn', 'page', 4.5],
  ['page', 'ink', 4.5],
]

function parseColor(value) {
  const match = value?.match(/^#([0-9a-f]{6})$/i)
  if (!match) throw new Error(`Expected a six-digit hex token, received "${value}"`)
  return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255)
}

function luminance(value) {
  return parseColor(value)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0)
}

function ratio(foreground, background) {
  const foregroundLuminance = luminance(foreground)
  const backgroundLuminance = luminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

let failures = 0
let checks = 0
console.log(`Textured minimal / shipped token contrast — ${resolve(appRoot, 'src/styles/tokens.css')}`)

for (const variant of variants) {
  const tokens = blocks.get(`${variant.theme}|${variant.mode}`) ?? unqualified.get(variant.theme)
  if (!tokens) {
    console.error(`MISSING  ${variant.family} ${variant.mode} (${variant.theme}|${variant.mode})`)
    failures += 1
    continue
  }
  console.log(`\n${variant.family} / ${variant.mode}`)
  for (const [foreground, background, minimum] of pairs) {
    const value = ratio(tokens[foreground], tokens[background])
    const passed = value >= minimum
    checks += 1
    if (!passed) failures += 1
    const status = passed ? 'PASS' : 'FAIL'
    console.log(
      `  ${`${foreground}/${background}`.padEnd(18)} ${value.toFixed(2).padStart(6)}:1  min ${minimum.toFixed(1)}  ${status}`,
    )
  }
  if (tokens['field-line']) {
    const value = ratio(tokens['field-line'], tokens.page)
    const passed = value >= 3
    checks += 1
    if (!passed) failures += 1
    console.log(`  ${'field-line/page'.padEnd(18)} ${value.toFixed(2).padStart(6)}:1  min 3.0  ${passed ? 'PASS' : 'FAIL'}`)
  }
}

console.log(`\n${checks} checks, ${failures} failure${failures === 1 ? '' : 's'}`)
if (failures > 0) process.exitCode = 1
