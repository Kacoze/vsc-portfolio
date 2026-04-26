import { test, expect } from '@playwright/test'

test.describe('GitHub Actions CI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-win-id="actions"]').waitFor({ state: 'attached', timeout: 5000 })
    await page.locator('.dock-icon[data-win="actions"]').click()
    await expect(page.locator('[data-win-id="actions"]')).toBeVisible()
  })

  test('clicking CI job expands steps', async ({ page }) => {
    const job = page.locator('.ci-job').first()
    const steps = job.locator('+ .ci-steps')
    await expect(steps).not.toBeVisible()
    await job.click()
    await expect(steps).toBeVisible()
    await expect(job).toHaveClass(/open/)
  })

  test('clicking CI job again collapses steps', async ({ page }) => {
    const job = page.locator('.ci-job').first()
    const steps = job.locator('+ .ci-steps')
    await job.click()
    await job.click()
    await expect(steps).not.toBeVisible()
    await expect(job).not.toHaveClass(/open/)
  })

  test('re-run button triggers running state', async ({ page }) => {
    await page.locator('#ci-rerun').click()
    await expect(page.locator('#ci-badge')).toHaveClass(/running/)
  })

  test('re-run completes back to passed', async ({ page }) => {
    await page.locator('#ci-rerun').click()
    await expect(page.locator('#ci-badge')).not.toHaveClass(/running/, { timeout: 6000 })
    await expect(page.locator('#ci-badge')).toContainText('Passed')
  })

  test('diff tooltip appears on hover', async ({ page }) => {
    await page.locator('.dock-icon[data-win="vscode"]').click()
    await page.locator('.act-btn[data-panel="sc"]').click()
    const hash = page.locator('.sc-hash[data-diff]').first()
    await hash.hover()
    await expect(page.locator('.diff-pop')).toBeVisible()
  })

  test('diff tooltip disappears on mouseout', async ({ page }) => {
    await page.locator('.dock-icon[data-win="vscode"]').click()
    await page.locator('.act-btn[data-panel="sc"]').click()
    const hash = page.locator('.sc-hash[data-diff]').first()
    await hash.hover()
    await expect(page.locator('.diff-pop')).toBeVisible()
    await page.mouse.move(0, 0)
    await expect(page.locator('.diff-pop')).not.toBeVisible()
  })

  test('diff tooltip contains diff-add and diff-del lines', async ({ page }) => {
    await page.locator('.dock-icon[data-win="vscode"]').click()
    await page.locator('.act-btn[data-panel="sc"]').click()
    const hash = page.locator('.sc-hash[data-diff]').first()
    await hash.hover()
    await expect(page.locator('.diff-pop .diff-add')).not.toHaveCount(0)
    await expect(page.locator('.diff-pop .diff-del')).not.toHaveCount(0)
  })
})
