import { test, expect } from '@playwright/test'

const FILES = [
  { key: 'spec',     name: 'kamil.spec.ts',       bc: 'kamil.spec.ts' },
  { key: 'md',       name: 'about.md',             bc: 'about.md' },
  { key: 'json',     name: 'package.json',         bc: 'package.json' },
  { key: 'pwconfig', name: 'playwright.config.ts', bc: 'playwright.config.ts' },
  { key: 'readme',   name: 'README.md',            bc: 'README.md' },
  { key: 'env',      name: '.env',                 bc: '.env' },
  { key: 'license',  name: 'LICENSE',              bc: 'LICENSE' },
]

test.describe('Sidebar — desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  for (const file of FILES) {
    test(`${file.name} — editor panel visible`, async ({ page }) => {
      await page.locator(`[data-file-sidebar="${file.key}"]`).click()
      await expect(page.locator(`.editor-view[data-file="${file.key}"]`)).toBeVisible()
      await expect(page.locator('.vsc-win')).toHaveAttribute('data-active', file.key)
    })
  }

  test('active tab switches to clicked file', async ({ page }) => {
    await page.locator('[data-file-sidebar="md"]').click()
    await expect(page.locator('[data-file-tab="md"]')).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('[data-file-tab="spec"]')).toHaveAttribute('aria-selected', 'false')
  })

  test('breadcrumb shows correct filename — package.json', async ({ page }) => {
    await page.locator('[data-file-sidebar="json"]').click()
    await expect(page.locator('[data-bc-file]')).toHaveText('package.json')
  })

  test('breadcrumb shows correct filename — .env', async ({ page }) => {
    await page.locator('[data-file-sidebar="env"]').click()
    await expect(page.locator('[data-bc-file]')).toHaveText('.env')
  })

  test('breadcrumb shows correct filename — about.md', async ({ page }) => {
    await page.locator('[data-file-sidebar="md"]').click()
    await expect(page.locator('[data-bc-file]')).toHaveText('about.md')
  })

  test('switching file hides previous editor panel', async ({ page }) => {
    await page.locator('[data-file-sidebar="json"]').click()
    await expect(page.locator('.editor-view[data-file="spec"]')).not.toBeVisible()
  })
})

test.describe('Sidebar — mobile (sidebar hidden)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('sidebar is not visible on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.sidebar')).not.toBeVisible()
  })

  test('activity bar is not visible on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.act-bar')).not.toBeVisible()
  })

  test('default editor view (spec) is visible without sidebar', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.editor-view[data-file="spec"]')).toBeVisible()
  })
})
