// Keyboard, form and state smoke tests for examples/demo-app.
// Build the demo app first, then run from examples/demo-app:
//   node scripts/smoke.mjs
// Point at another app with DEMO_APP=<dir> or --app <dir>.
import assert from 'node:assert/strict'
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

const server = await preview({
  root: appRoot,
  preview: { port: 4174, strictPort: true, host: '127.0.0.1' },
  logLevel: 'error',
})
const base = 'http://127.0.0.1:4174'
const browser = await chromium.launch()
const results = []
const failures = []

async function run(name, fn) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    await fn(page)
    assert.equal(errors.length, 0, errors.join('; '))
    results.push(name)
    console.log(`PASS ${name}`)
  } catch (error) {
    failures.push(`${name}: ${error.message}`)
    console.error(`FAIL ${name}: ${error.message}`)
  } finally {
    await context.close()
  }
}

const active = (page) =>
  page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    text: document.activeElement?.textContent?.trim().slice(0, 80),
    cls: document.activeElement?.className,
  }))

function contrastRatio(foreground, background) {
  const luminance = (color) => {
    const values = (String(color).match(/[\d.]+/g) ?? []).map(Number)
    const channels = (/^color\(/i.test(String(color)) ? values.slice(-3).map((value) => value * 255) : values.slice(0, 3))
    const [r, g, b] = channels.map((value) => {
      const channel = value / 255
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return r * 0.2126 + g * 0.7152 + b * 0.0722
  }
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

try {
  await run('index skip link and 8 demo links', async (page) => {
    await page.goto(`${base}/?theme=gruvbox&mode=light&voice=neutral&type=readable`)
    await page.keyboard.press('Tab')
    const first = await active(page)
    assert.match(String(first.cls), /skip-link/)
    assert.equal(await page.locator('a.index-row').count(), 8)
    await page.keyboard.press('Enter')
    assert.match(page.url(), /#main$/)
  })

  await run('index defaults to graphite, quiz stays gruvbox', async (page) => {
    await page.goto(`${base}/`)
    assert.equal(await page.locator('html').getAttribute('data-family'), 'graphite')
    await page.goto(`${base}/quiz`)
    assert.equal(await page.locator('html').getAttribute('data-family'), 'gruvbox')
  })

  await run('display dialog keyboard and reset', async (page) => {
    await page.goto(`${base}/landing?theme=everforest&mode=light&voice=professional&type=readable`)
    const toggle = page.getByRole('button', { name: 'Display' })
    const box = await toggle.boundingBox()
    assert.ok(box && box.width >= 40 && box.height >= 40, 'display toggle target is under 40px')
    await toggle.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Display' })
    await dialog.waitFor()
    await page.getByRole('radio', { name: 'Dark' }).check()
    assert.equal(await page.locator('html').getAttribute('data-mode'), 'dark')
    await page.getByRole('button', { name: 'Reset to page default' }).click()
    const note = await page.locator('.display-note').textContent()
    assert.match(String(note), /Saved preferences cleared/)
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    await page.waitForTimeout(50)
    const focused = await active(page)
    assert.match(String(focused.cls), /display-toggle/)
  })

  await run('landing form validation and success', async (page) => {
    await page.goto(`${base}/landing?theme=everforest&mode=light&voice=professional&type=readable`)
    await page.getByRole('button', { name: 'Request the demo trial' }).click()
    assert.equal(await page.locator('#email-error').count(), 1)
    assert.equal(await page.locator('#site-error').count(), 1)
    await page.locator('#work-email').fill('ops@example.com')
    await page.locator('#site-type').selectOption({ index: 1 })
    await page.getByRole('button', { name: 'Request the demo trial' }).click()
    await page.getByText('Demo check complete.').waitFor()
    assert.equal(await page.getByRole('button', { name: 'Request the demo trial' }).count(), 1)
  })

  await run('dashboard demo states by keyboard', async (page) => {
    await page.goto(`${base}/dashboard?theme=tokyo&mode=light&voice=professional&type=readable`)
    const empty = page.getByRole('button', { name: 'Empty' })
    await empty.focus()
    await page.keyboard.press('Enter')
    await page.getByText('Feed clear').waitFor()
    const loading = page.getByRole('button', { name: 'Loading' })
    await loading.focus()
    await page.keyboard.press('Enter')
    await page.locator('.dash-loading').waitFor()
    const error = page.getByRole('button', { name: 'Error' })
    await error.focus()
    await page.keyboard.press('Enter')
    await page.getByRole('alert').filter({ hasText: 'incident feed' }).waitFor()
    const live = page.getByRole('button', { name: 'Live' })
    await live.focus()
    await page.keyboard.press('Enter')
    assert.equal(await page.locator('.dash-table[role="region"]').count(), 1)
  })

  await run('dashboard mobile order and collapsed controls', async (page) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${base}/dashboard?theme=tokyo&mode=light&voice=professional&type=readable`)
    const details = page.locator('.dash-side__details')
    assert.equal(await details.evaluate((node) => node.open), false, 'controls should start collapsed at 390')
    const ring = await page.locator('#ring').boundingBox()
    const side = await page.locator('.dash-side').boundingBox()
    assert.ok(ring && side && ring.y < side.y, 'status and ring should precede demo controls at 390')
    const summary = page.locator('.dash-side__summary')
    const box = await summary.boundingBox()
    assert.ok(box && box.height >= 40, 'details summary target under 40px')
    await summary.click()
    assert.equal(await details.evaluate((node) => node.open), true)
    await page.getByRole('button', { name: 'Empty' }).click()
    await page.getByText('Feed clear').waitFor()
  })

  await run('docs copy control', async (page) => {
    await page.goto(`${base}/docs?theme=catppuccin&mode=light&voice=neutral&type=readable`)
    const copy = page.locator('.code-copy').first()
    await copy.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    assert.match(String(await copy.textContent()), /Copied|Copy failed/)
  })

  await run('store cart dialog and checkout note', async (page) => {
    await page.goto(`${base}/store?theme=rosepine&mode=light&voice=neutral&type=readable`)
    await page.getByRole('button', { name: /Add .* to cart/ }).first().click()
    const dialog = page.getByRole('dialog', { name: 'Your cart' })
    await dialog.waitFor()
    assert.equal(await dialog.evaluate((node) => node === document.querySelector('dialog[open]')), true)
    const focused = await active(page)
    assert.ok(focused.text)
    await dialog.getByRole('button', { name: /Increase .* quantity/ }).click()
    await dialog.getByRole('button', { name: 'Checkout / demo' }).click()
    await dialog.getByText(/Checkout is not connected/).waitFor()
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    const back = await active(page)
    assert.match(String(back.cls), /store-row__add/)
  })

  await run('quiz completes with number keys', async (page) => {
    await page.goto(`${base}/quiz?theme=gruvbox&mode=light&voice=neutral&type=readable`)
    await page.getByRole('button', { name: /Start/ }).first().click()
    await page.locator('.quiz-choice').first().waitFor()
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press('1')
      await page.waitForTimeout(80)
    }
    await page.locator('.quiz-result').waitFor()
    assert.match(String(await page.locator('#result-title').textContent()), /\S/)
    await page.getByRole('button', { name: 'Review answers' }).click()
    await page.locator('.quiz-play').waitFor()
  })

  await run('portfolio details and scrollable trace', async (page) => {
    await page.goto(`${base}/portfolio?theme=everforest&mode=light&voice=nerd&type=readable`)
    const details = page.locator('details.patch__entry').first()
    await details.locator('summary').focus()
    await page.keyboard.press('Enter')
    assert.equal(await details.evaluate((node) => node.open), true)
    const trace = page.locator('.portfolio-trace__scroll')
    await trace.focus()
    const before = await trace.evaluate((node) => node.scrollLeft)
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)
    const after = await trace.evaluate((node) => node.scrollLeft)
    assert.ok(after >= before)
  })

  await run('checkout validation, auth cancel, success', async (page) => {
    await page.goto(`${base}/checkout?theme=graphite&mode=light&voice=professional&type=readable`)
    await page.getByRole('button', { name: /Pay \$12/ }).click()
    await page.locator('.checkout-errors').waitFor()
    const summaryFocus = await page.evaluate(
      () => document.activeElement?.classList.contains('checkout-errors'),
    )
    assert.equal(summaryFocus, true)

    await page.locator('#checkout-email').fill('buyer@example.com')
    await page.locator('#checkout-name').fill('Ada Lovelace')
    await page.locator('#checkout-card').fill('4242424242424242')
    await page.locator('#checkout-expiry').fill('12/30')
    await page.locator('#checkout-cvc').fill('123')
    await page.locator('#checkout-country').selectOption('US')
    await page.locator('#checkout-postal').fill('10001')
    await page.locator('#checkout-outcome').selectOption('authenticate')
    await page.getByRole('button', { name: /Pay \$12/ }).click()
    const auth = page.getByRole('dialog', { name: 'Authentication required.' })
    await auth.waitFor({ timeout: 4000 })
    await page.keyboard.press('Escape')
    await auth.waitFor({ state: 'hidden' })
    await page.getByText(/No charge was made/).waitFor()

    await page.locator('#checkout-outcome').selectOption('approved')
    await page.getByRole('button', { name: /Pay \$12/ }).click()
    await page.getByRole('heading', { name: 'You are in.' }).waitFor({ timeout: 4000 })
    const successFocus = await page.evaluate(
      () => document.activeElement?.id === 'success-title',
    )
    assert.equal(successFocus, true)
  })

  await run('checkout dark field borders stay above 3:1', async (page) => {
    await page.goto(`${base}/checkout?theme=graphite&mode=dark&voice=professional&type=readable`)
    const colors = await page.evaluate(() => {
      const input = document.querySelector('.checkout-form input')
      return {
        border: getComputedStyle(input).borderTopColor,
        page: getComputedStyle(document.body).backgroundColor,
      }
    })
    const ratio = contrastRatio(colors.border, colors.page)
    assert.ok(ratio >= 3, `checkout dark input border ${ratio.toFixed(2)}:1 (${colors.border} on ${colors.page})`)
    console.log(`  checkout dark field ${ratio.toFixed(2)}:1`)
  })

  await run('luxury validation and success', async (page) => {
    await page.goto(`${base}/luxury?theme=atelier&mode=light&voice=professional&type=readable`)
    await page.getByRole('button', { name: 'Send enquiry' }).click()
    const alert = page.getByRole('alert').filter({ hasText: 'Please check the marked fields.' })
    await alert.waitFor()
    const nameFocus = await page.evaluate(
      () => document.activeElement?.getAttribute('name') === 'name',
    )
    assert.equal(nameFocus, true)
    await page.locator('input[name="name"]').fill('Ada Lovelace')
    await page.locator('input[name="email"]').fill('ada@example.com')
    await page.locator('input[name="city"]').fill('London')
    await page.locator('select[name="interest"]').selectOption({ index: 1 })
    await page.getByRole('button', { name: 'Send enquiry' }).click()
    const heading = page.getByRole('heading', { name: /Thank you/ })
    await heading.waitFor()
    const headingFocus = await page.evaluate(
      () => document.activeElement?.textContent?.includes('Thank you'),
    )
    assert.equal(headingFocus, true)
  })

  await run('reduced motion and 390px overflow', async (page) => {
    await page.setViewportSize({ width: 390, height: 844 })
    for (const path of ['/', '/landing', '/dashboard', '/docs', '/store', '/quiz', '/portfolio', '/checkout', '/luxury']) {
      await page.goto(`${base}${path}?mode=light&type=readable`)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      assert.ok(overflow <= 1, `${path} overflow ${overflow}px`)
    }
    await page.goto(`${base}/quiz?mode=light&type=readable`)
    await page.getByRole('button', { name: /Start/ }).first().click()
    await page.locator('.quiz-question').waitFor()
    const animation = await page.locator('.quiz-question').evaluate(
      (node) => getComputedStyle(node).animationName,
    )
    assert.equal(animation, 'none')
  })
} finally {
  await browser.close()
  await server.close()
}

console.log(`\n${results.length} passed, ${failures.length} failed`)
if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
}
