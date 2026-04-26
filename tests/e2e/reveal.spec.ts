import { test, expect } from '@playwright/test'

test.describe('Terminal reveal animation', () => {
  test('all .t-line elements are visible after page load', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => {
      const lines = document.querySelectorAll('.t-line')
      if (lines.length === 0) return false
      return Array.from(lines).every(
        (el) => parseFloat(window.getComputedStyle(el).opacity) >= 0.99
      )
    }, null, { timeout: 10_000 })
  })

  test('t-line elements exist in DOM', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.t-line').first()).toBeAttached()
  })
})
