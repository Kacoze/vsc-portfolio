import { test, expect } from '@playwright/test'

test.describe('Mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('VS Code window is visible on load', async ({ page }) => {
    await expect(page.locator('[data-win-id="vscode"]')).toBeVisible()
  })

  test('minimize button does nothing on mobile', async ({ page }) => {
    const win = page.locator('[data-win-id="vscode"]')
    await win.locator('.tl .y').click()
    await expect(win).toBeVisible()
  })

  test('maximize button does nothing on mobile — window stays in same state', async ({ page }) => {
    const win = page.locator('[data-win-id="vscode"]')
    // Window starts maximized; on mobile toggleMax is a no-op, so class stays
    await win.locator('.tl .g').click()
    await expect(win).toHaveClass(/maximized/)
  })

  test('close button does nothing on mobile', async ({ page }) => {
    const win = page.locator('[data-win-id="vscode"]')
    await win.locator('.tl .r').click()
    await expect(win).toBeVisible()
  })

  test('.tab-desktop-only tab is hidden on mobile', async ({ page }) => {
    await expect(page.locator('.tab-desktop-only')).not.toBeVisible()
  })

  test('dock is hidden on small mobile (≤767px)', async ({ page }) => {
    await expect(page.locator('.dock')).not.toBeVisible()
  })

  test('sidebar is hidden on mobile', async ({ page }) => {
    await expect(page.locator('.sidebar')).not.toBeVisible()
  })

  test('terminal is accessible', async ({ page }) => {
    await expect(page.locator('.term-input')).toBeVisible()
  })
})

test.describe('Mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('default file (spec) is shown on load', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="spec"]')).toBeVisible()
  })

  test('terminal commands work on mobile', async ({ page }) => {
    const input = page.locator('.term-input')
    await input.fill('whoami')
    await input.press('Enter')
    await expect(page.locator('.term-body')).toContainText('kamil')
  })

  test('terminal ls works on mobile', async ({ page }) => {
    const input = page.locator('.term-input')
    await input.fill('ls')
    await input.press('Enter')
    await expect(page.locator('.term-body')).toContainText('README.md')
  })
})
