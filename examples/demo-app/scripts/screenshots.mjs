// Full-page screenshot suite and visual regression gates for examples/demo-app.
// Build the demo app first, then run from examples/demo-app:
//   node scripts/screenshots.mjs
// Point at another app with DEMO_APP=<dir> or --app <dir>.
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const flag = process.argv.indexOf('--app')
const appOption = flag === -1 ? process.env.DEMO_APP : process.argv[flag + 1]
const appRoot = appOption
  ? resolve(appOption)
  : fileURLToPath(new URL('../', import.meta.url))

// vite and playwright install with the demo app, not with this skill.
const requireApp = createRequire(resolve(appRoot, 'package.json'))
async function load(name) {
  try {
    return await import(pathToFileURL(requireApp.resolve(name)).href)
  } catch {
    throw new Error(`Cannot resolve "${name}" from ${appRoot}. Run "npm install" in examples/demo-app first.`)
  }
}
const vite = await load('vite')
const playwright = await load('playwright')
const preview = vite.preview ?? vite.default?.preview
const chromium = playwright.chromium ?? playwright.default?.chromium

const routes = [
  { slug: 'index', path: '/', family: 'graphite', voice: 'neutral' },
  { slug: 'landing', path: '/landing', family: 'everforest', voice: 'professional' },
  { slug: 'dashboard', path: '/dashboard', family: 'tokyo', voice: 'professional' },
  { slug: 'docs', path: '/docs', family: 'catppuccin', voice: 'neutral' },
  { slug: 'store', path: '/store', family: 'rosepine', voice: 'neutral' },
  { slug: 'quiz', path: '/quiz', family: 'gruvbox', voice: 'neutral' },
  { slug: 'portfolio', path: '/portfolio', family: 'nord', voice: 'nerd' },
  { slug: 'checkout', path: '/checkout', family: 'graphite', voice: 'professional' },
  { slug: 'luxury', path: '/luxury', family: 'atelier', voice: 'professional' },
]
const demos = routes.filter((route) => route.slug !== 'index')
const modes = ['light', 'dark']
const widths = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]

const output = new URL('screenshots/', pathToFileURL(appRoot))
await mkdir(output, { recursive: true })

const server = await preview({
  root: appRoot,
  preview: { port: 4173, strictPort: true, host: '127.0.0.1' },
  logLevel: 'error',
})
const baseURL = 'http://127.0.0.1:4173'
const browser = await chromium.launch()
const problems = []
const luminance = new Map()
const captured = new Set()

const shotName = (slug, width, mode) => `${slug}-${width}-${mode}.png`
const shotPath = (slug, width, mode) => fileURLToPath(new URL(shotName(slug, width, mode), output))

async function meanLuminance(page, buffer) {
  return page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()
    const scale = Math.min(1, 520 / image.width)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    let total = 0
    let count = 0
    for (let index = 0; index < data.length; index += 4 * 5) {
      const channels = [data[index], data[index + 1], data[index + 2]].map((value) => {
        const channel = value / 255
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      })
      total += channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
      count += 1
    }
    return total / count
  }, buffer.toString('base64'))
}

async function clippedText(page) {
  return page.evaluate(() => {
    const found = new Set()
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim()) continue
      const parent = node.parentElement
      if (!parent || parent.closest('.sr-only, .skip-link, svg')) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      const rects = [...range.getClientRects()]
      if (rects.length === 0) continue
      let clipper = parent
      let scrollable = false
      while (clipper && clipper !== document.body) {
        const overflow = getComputedStyle(clipper).overflowX
        if (overflow === 'auto' || overflow === 'scroll') {
          scrollable = true
          break
        }
        if (overflow === 'hidden' || overflow === 'clip') break
        clipper = clipper.parentElement
      }
      if (scrollable || !clipper || clipper === document.body) continue
      const box = clipper.getBoundingClientRect()
      for (const rect of rects) {
        if (rect.width < 1) continue
        if (rect.right > box.right + 1 || rect.left < box.left - 1) {
          const cls = String(clipper.className ?? '').trim().replace(/\s+/g, '.')
          found.add(`${clipper.tagName.toLowerCase()}${cls ? `.${cls}` : ''} > "${node.textContent.trim().slice(0, 24)}"`)
          break
        }
      }
    }
    return [...found].slice(0, 8)
  })
}

async function contactSheet(mode) {
  const images = []
  for (const route of routes) {
    const buffer = await readFile(shotPath(route.slug, 1280, mode))
    images.push({ slug: route.slug, url: `data:image/png;base64,${buffer.toString('base64')}` })
  }
  const sheetBrowser = await chromium.launch()
  const page = await sheetBrowser.newPage({ viewport: { width: 2000, height: 1400 }, colorScheme: mode })
  const dataURL = await page.evaluate(async ({ images, mode }) => {
    const columns = 3
    const cellWidth = 600
    const cellHeight = 620
    const gap = 26
    const pad = 30
    const header = 58
    const labelHeight = 30
    const rows = Math.ceil(images.length / columns)
    const dark = mode === 'dark'
    const paper = dark ? '#141414' : '#f6f3ec'
    const card = dark ? '#1f1f1f' : '#ffffff'
    const ink = dark ? '#ececec' : '#1d1d1b'
    const muted = dark ? '#9a9a9a' : '#6d6a63'
    const rule = dark ? '#3a3a3a' : '#d6d0c4'

    const canvas = document.createElement('canvas')
    canvas.width = pad * 2 + columns * cellWidth + (columns - 1) * gap
    canvas.height = pad * 2 + header + rows * (cellHeight + labelHeight) + (rows - 1) * gap
    const context = canvas.getContext('2d')
    context.fillStyle = paper
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = ink
    context.font = '600 22px ui-monospace, monospace'
    context.fillText(`TEXTURED MINIMAL / EIGHT DEMOS / ${mode.toUpperCase()} / 1280PX`, pad, pad + 22)
    context.fillStyle = muted
    context.font = '400 14px ui-monospace, monospace'
    context.fillText('index + landing / dashboard / docs / store / quiz / portfolio / checkout / luxury', pad, pad + 46)

    for (const [index, entry] of images.entries()) {
      const column = index % columns
      const row = Math.floor(index / columns)
      const x = pad + column * (cellWidth + gap)
      const y = pad + header + row * (cellHeight + labelHeight + gap)
      const image = new Image()
      image.src = entry.url
      await image.decode()
      context.fillStyle = card
      context.fillRect(x, y, cellWidth, cellHeight)
      const scale = Math.min(cellWidth / image.width, cellHeight / image.height)
      const drawWidth = image.width * scale
      const drawHeight = image.height * scale
      context.drawImage(image, x + (cellWidth - drawWidth) / 2, y + (cellHeight - drawHeight) / 2, drawWidth, drawHeight)
      context.strokeStyle = rule
      context.lineWidth = 1
      context.strokeRect(x + 0.5, y + 0.5, cellWidth - 1, cellHeight - 1)
      context.fillStyle = ink
      context.font = '600 15px ui-monospace, monospace'
      context.fillText(`${String(index + 1).padStart(2, '0')} / ${entry.slug}`, x, y + cellHeight + 20)
      context.fillStyle = muted
      context.textAlign = 'right'
      context.font = '400 13px ui-monospace, monospace'
      context.fillText(`${mode} / full page`, x + cellWidth, y + cellHeight + 20)
      context.textAlign = 'left'
    }
    return canvas.toDataURL('image/png')
  }, { images, mode })
  await page.close()
  await sheetBrowser.close()
  const file = fileURLToPath(new URL(`contact-${mode}.png`, output))
  await writeFile(file, Buffer.from(dataURL.split(',')[1], 'base64'))
  console.log(`contact sheet ${mode.padEnd(5)} -> ${file}`)
}

try {
  for (const route of routes) {
    for (const mode of modes) {
      for (const viewport of widths) {
        const context = await browser.newContext({
          viewport,
          colorScheme: mode,
          reducedMotion: 'reduce',
        })
        const page = await context.newPage()
        const label = `${route.slug}/${mode}/${viewport.width}`
        page.on('pageerror', (error) => problems.push(`${label}: ${error.message}`))
        page.on('console', (message) => {
          if (message.type() === 'error') {
            problems.push(`${label}: console ${message.text()}`)
          }
        })
        const query = new URLSearchParams({
          theme: route.family,
          mode,
          voice: route.voice,
          type: 'readable',
        })
        await page.goto(`${baseURL}${route.path}?${query}`, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.waitForTimeout(200)

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        if (overflow > 1) {
          problems.push(`${label}: horizontal overflow ${overflow}px`)
        }

        if (viewport.width === 390) {
          const clipped = await clippedText(page)
          for (const element of clipped) problems.push(`${label}: clipped text in ${element}`)
        }

        if (route.slug === 'checkout' && mode === 'dark') {
          const contrast = await page.evaluate(() => {
            const input = document.querySelector('.checkout-form input')
            const parse = (value) => {
              const numbers = (value.match(/[\d.]+/g) ?? []).map(Number)
              const rgb = /^color\(/i.test(value) ? numbers.slice(-3).map((n) => n * 255) : numbers.slice(0, 3)
              return rgb
            }
            const luminance = (rgb) => {
              const [r, g, b] = rgb.map((channel) => {
                const c = channel / 255
                return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
              })
              return r * 0.2126 + g * 0.7152 + b * 0.0722
            }
            const border = parse(getComputedStyle(input).borderTopColor)
            const page = parse(getComputedStyle(document.body).backgroundColor)
            const [lighter, darker] = [luminance(border), luminance(page)].sort((a, b) => b - a)
            return (lighter + 0.05) / (darker + 0.05)
          })
          console.log(`checkout dark input border vs page: ${contrast.toFixed(2)}:1`)
          if (contrast < 3) problems.push(`${label}: input border contrast ${contrast.toFixed(2)}:1 < 3:1`)
        }

        const file = shotPath(route.slug, viewport.width, mode)
        const buffer = await page.screenshot({ path: file, fullPage: true })
        captured.add(shotName(route.slug, viewport.width, mode))
        luminance.set(`${route.slug}|${mode}`, await meanLuminance(page, buffer))
        console.log(`${route.slug.padEnd(10)} ${String(viewport.width).padStart(4)} ${mode.padEnd(5)} -> ${file}`)
        await context.close()
      }
    }
  }
} finally {
  await browser.close()
  await server.close()
}

console.log('\nMean relative luminance (full-page shots)')
for (const route of routes) {
  const light = luminance.get(`${route.slug}|light`)
  const dark = luminance.get(`${route.slug}|dark`)
  if (light === undefined || dark === undefined) continue
  const delta = Math.abs(light - dark)
  console.log(
    `  ${route.slug.padEnd(10)} light ${light.toFixed(4)}  dark ${dark.toFixed(4)}  delta ${delta.toFixed(4)}`,
  )
  if (delta < 0.004) {
    problems.push(`${route.slug}: light and dark screenshots have effectively identical mean luminance`)
  }
}

const expected = []
for (const route of demos) {
  for (const mode of modes) {
    for (const viewport of widths) expected.push(shotName(route.slug, viewport.width, mode))
  }
}
const missing = []
for (const name of expected) {
  try {
    const info = await stat(fileURLToPath(new URL(name, output)))
    if (info.size < 1024) missing.push(`${name} (suspiciously small)`)
  } catch {
    missing.push(name)
  }
}
console.log(`\nDemo shots: ${expected.length - missing.length}/${expected.length} present (${demos.length} routes x 2 modes x 2 widths)`)
if (missing.length > 0) {
  for (const name of missing) console.error(`MISSING ${name}`)
  problems.push(`${missing.length} demo screenshot(s) missing`)
}

console.log(`Extra index shots: ${modes.length * widths.length}/${modes.length * widths.length} present`)

await contactSheet('light')
await contactSheet('dark')

if (problems.length > 0) {
  console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'} found:`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exitCode = 1
} else {
  console.log(
    `\nCaptured ${captured.size} screenshots (${expected.length} demo + index) with no console errors, horizontal overflow, clipped 390px text or identical light/dark luminance.`,
  )
}
