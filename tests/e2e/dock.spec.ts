import { test, expect } from '@playwright/test'

test.describe('Dock — desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Postman icon has dock-bounce class on load', async ({ page }) => {
    await expect(page.locator('.dock-icon[data-win="postman"]')).toHaveClass(/dock-bounce/)
  })

  test('clicking Postman icon removes dock-bounce', async ({ page }) => {
    await page.locator('.dock-icon[data-win="postman"]').click({ force: true })
    await expect(page.locator('.dock-icon[data-win="postman"]')).not.toHaveClass(/dock-bounce/)
  })

  test('VS Code icon has win-open class on load', async ({ page }) => {
    await expect(page.locator('.dock-icon[data-win="vscode"]')).toHaveClass(/win-open/)
  })

  test('Postman icon has win-minimized class on load', async ({ page }) => {
    await expect(page.locator('.dock-icon[data-win="postman"]')).toHaveClass(/win-minimized/)
  })

  test('minimizing vscode window → icon gets win-minimized', async ({ page }) => {
    await page.locator('[data-win-id="vscode"] .tl .y').click()
    await expect(page.locator('.dock-icon[data-win="vscode"]')).toHaveClass(/win-minimized/)
  })

  test('closing vscode window → icon gets win-closed', async ({ page }) => {
    await page.locator('[data-win-id="vscode"] .tl .r').click()
    await expect(page.locator('.dock-icon[data-win="vscode"]')).toHaveClass(/win-closed/)
  })

  test('restoring closed vscode via dock → icon gets win-open', async ({ page }) => {
    await page.locator('[data-win-id="vscode"] .tl .r').click()
    await page.locator('.dock-icon[data-win="vscode"]').click()
    await expect(page.locator('.dock-icon[data-win="vscode"]')).toHaveClass(/win-open/)
    await expect(page.locator('.dock-icon[data-win="vscode"]')).not.toHaveClass(/win-closed/)
  })

  test('clicking Postman icon opens Postman window', async ({ page }) => {
    // wait for lazy injection before clicking
    await page.waitForSelector('[data-win-id="postman"]', { state: 'attached', timeout: 5000 })
    await page.locator('.dock-icon[data-win="postman"]').click({ force: true })
    await expect(page.locator('[data-win-id="postman"]')).toBeVisible({ timeout: 5000 })
  })

  test('clicking Actions icon when minimized restores it', async ({ page }) => {
    await page.locator('.dock-icon[data-win="actions"]').click()
    await expect(page.locator('[data-win-id="actions"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.dock-icon[data-win="actions"]')).toHaveClass(/win-open/)
  })

  test('all three dock icons are visible', async ({ page }) => {
    await expect(page.locator('.dock-icon[data-win="vscode"]')).toBeVisible()
    await expect(page.locator('.dock-icon[data-win="postman"]')).toBeVisible()
    await expect(page.locator('.dock-icon[data-win="actions"]')).toBeVisible()
  })
})

test.describe('Dock — mobile (dock hidden at ≤767px)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('dock is not visible on small mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.dock')).not.toBeVisible()
  })
})
