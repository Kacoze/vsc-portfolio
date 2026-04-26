import { test, expect } from '@playwright/test'

test.describe('Window Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('VSCode window is visible on load', async ({ page }) => {
    await expect(page.locator('[data-win-id="vscode"]')).toBeVisible()
  })

  test('CI window is minimized on load (data-win-start=minimized)', async ({ page }) => {
    await expect(page.locator('[data-win-id="actions"]')).not.toBeVisible()
    await expect(page.locator('.dock-icon[data-win="actions"]')).toHaveClass(/win-minimized/)
  })

  test('minimize yellow button hides window', async ({ page }) => {
    const win = page.locator('[data-win-id="vscode"]')
    await win.locator('.tl .y').click()
    await expect(win).not.toBeVisible()
    await expect(page.locator('.dock-icon[data-win="vscode"]')).toHaveClass(/win-minimized/)
  })

  test('dock icon restores minimized window', async ({ page }) => {
    await page.locator('[data-win-id="vscode"] .tl .y').click()
    await expect(page.locator('[data-win-id="vscode"]')).not.toBeVisible()
    await page.locator('.dock-icon[data-win="vscode"]').click()
    await expect(page.locator('[data-win-id="vscode"]')).toBeVisible()
    await expect(page.locator('.dock-icon[data-win="vscode"]')).toHaveClass(/win-open/)
  })

  test('close red button hides window', async ({ page }) => {
    await page.locator('[data-win-id="vscode"] .tl .r').click()
    await expect(page.locator('[data-win-id="vscode"]')).not.toBeVisible()
    await expect(page.locator('.dock-icon[data-win="vscode"]')).toHaveClass(/win-closed/)
  })

  test('dock icon restores closed window', async ({ page }) => {
    await page.locator('[data-win-id="vscode"] .tl .r').click()
    await page.locator('.dock-icon[data-win="vscode"]').click()
    await expect(page.locator('[data-win-id="vscode"]')).toBeVisible()
  })

  test('maximize green button adds .maximized class', async ({ page }) => {
    const win = page.locator('[data-win-id="vscode"]')
    await win.locator('.tl .g').click()
    await win.locator('.tl .g').click()
    await expect(win).toHaveClass(/maximized/)
  })

  test('double-click on titlebar toggles maximize', async ({ page }) => {
    const win = page.locator('[data-win-id="vscode"]')
    await win.locator('.win-tb').dblclick()
    await expect(win).not.toHaveClass(/maximized/)
    await win.locator('.win-tb').dblclick()
    await expect(win).toHaveClass(/maximized/)
  })

  test('restore CI from dock', async ({ page }) => {
    await page.waitForSelector('[data-win-id="actions"]', { state: 'attached', timeout: 5000 })
    await page.locator('.dock-icon[data-win="actions"]').click()
    await expect(page.locator('[data-win-id="actions"]')).toBeVisible()
    await expect(page.locator('.dock-icon[data-win="actions"]')).toHaveClass(/win-open/)
  })

  test('restore-after-close: window visible and icon win-open after restoring closed window', async ({ page }) => {
    await page.locator('[data-win-id="vscode"] .tl .r').click()
    await expect(page.locator('[data-win-id="vscode"]')).not.toBeVisible()
    await page.locator('.dock-icon[data-win="vscode"]').click()
    await expect(page.locator('[data-win-id="vscode"]')).toBeVisible({ timeout: 500 })
    await expect(page.locator('.dock-icon[data-win="vscode"]')).toHaveClass(/win-open/)
    await expect(page.locator('.dock-icon[data-win="vscode"]')).not.toHaveClass(/win-closed/)
  })

  test('resize: dragging se handle increases window size', async ({ page }) => {
    const win = page.locator('[data-win-id="vscode"]')
    // First unmaximize so we can resize
    await win.locator('.tl .g').click()
    const handle = win.locator('.rh-se')
    const box = await handle.boundingBox()
    if (!box) throw new Error('resize handle not found')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100)
    await page.mouse.up()
    const newBox = await win.boundingBox()
    expect(newBox!.width).toBeGreaterThan(480)
    expect(newBox!.height).toBeGreaterThan(300)
  })
})

test.describe('Window Manager — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('minimize button does nothing on mobile', async ({ page }) => {
    await page.goto('/')
    const win = page.locator('[data-win-id="vscode"]')
    await win.locator('.tl .y').click()
    await expect(win).toBeVisible()
  })
})
