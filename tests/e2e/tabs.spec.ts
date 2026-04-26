import { test, expect } from '@playwright/test'

test.describe('Tab management — desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('initial active tab is kamil.spec.ts', async ({ page }) => {
    await expect(page.locator('[data-file-tab="spec"]')).toHaveAttribute('aria-selected', 'true')
  })

  test('clicking tab switches editor view', async ({ page }) => {
    await page.locator('[data-file-tab="md"]').click()
    await expect(page.locator('.editor-view[data-file="md"]')).toBeVisible()
    await expect(page.locator('[data-file-tab="md"]')).toHaveAttribute('aria-selected', 'true')
  })

  test('closing a tab removes it from the bar', async ({ page }) => {
    await page.locator('[data-file-tab="md"] .close').click()
    await expect(page.locator('[data-file-tab="md"]')).not.toBeVisible()
  })

  test('after closing tab, another tab becomes active', async ({ page }) => {
    await page.locator('[data-file-tab="md"]').click()
    await page.locator('[data-file-tab="md"] .close').click()
    const activeTab = page.locator('.tab[aria-selected="true"]')
    await expect(activeTab).toBeVisible()
  })

  test('playwright.config.ts tab is visible on desktop', async ({ page }) => {
    await expect(page.locator('[data-file-tab="pwconfig"]')).toBeVisible()
  })

  test('switching from spec to json via tab', async ({ page }) => {
    await page.locator('[data-file-tab="json"]').click()
    await expect(page.locator('.editor-view[data-file="json"]')).toBeVisible()
    await expect(page.locator('.editor-view[data-file="spec"]')).not.toBeVisible()
  })
})

test.describe('Tab management — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('playwright.config.ts tab is hidden on mobile', async ({ page }) => {
    const pwTab = page.locator('[data-file-tab="pwconfig"]')
    await expect(pwTab).not.toBeVisible()
  })

  test('other tabs remain visible on mobile', async ({ page }) => {
    await expect(page.locator('[data-file-tab="spec"]')).toBeVisible()
  })
})
