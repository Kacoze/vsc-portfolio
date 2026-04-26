import { test } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'
import { chromium } from 'playwright-core'
import * as fs from 'fs'

function resolveChromePath(): string {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH
  }
  return chromium.executablePath()
}

const CHROME_PATH = resolveChromePath()

async function audit(port: number, formFactor: 'desktop' | 'mobile') {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    args: [`--remote-debugging-port=${port}`, '--no-sandbox'],
    headless: true,
  })
  const page = await browser.newPage()
  await page.goto('http://localhost:4173')

  await playAudit({
    page,
    thresholds: { performance: 100, accessibility: 100, 'best-practices': 100, seo: 100 },
    port,
    disableLogs: true,
    opts: {
      throttlingMethod: 'provided',
      formFactor,
      screenEmulation:
        formFactor === 'mobile'
          ? { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false }
          : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    },
  })
  await browser.close()
}

test.describe('Lighthouse 100/100', () => {
  test.setTimeout(120_000)

  test('desktop: all categories 100', async () => {
    await audit(9222, 'desktop')
  })

  test('mobile: all categories 100', async () => {
    await audit(9223, 'mobile')
  })
})
