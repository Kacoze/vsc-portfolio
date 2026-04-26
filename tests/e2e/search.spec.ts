import { test, expect } from '@playwright/test'

test.describe('Search panel — desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('.act-btn[data-panel="search"]').click()
    await expect(page.locator('.panel-view[data-panel="search"]')).toBeVisible()
  })

  test('search panel opens when clicking activity bar icon', async ({ page }) => {
    await expect(page.locator('.panel-view[data-panel="search"]')).toBeVisible()
  })

  test('search input is focused and accepts text', async ({ page }) => {
    const input = page.locator('.panel-view[data-panel="search"] .sb-search')
    await input.fill('spec')
    await expect(input).toHaveValue('spec')
  })

  test('searching "playwright" returns results', async ({ page }) => {
    await page.locator('.panel-view[data-panel="search"] .sb-search').fill('playwright')
    await expect(page.locator('.sb-search-results')).not.toBeEmpty()
  })

  test('searching "spec" returns kamil.spec.ts', async ({ page }) => {
    await page.locator('.panel-view[data-panel="search"] .sb-search').fill('spec')
    await expect(page.locator('.sb-search-results')).toContainText('kamil.spec.ts')
  })

  test('searching "describe" returns results', async ({ page }) => {
    await page.locator('.panel-view[data-panel="search"] .sb-search').fill('describe')
    await expect(page.locator('.sb-search-results')).not.toBeEmpty()
  })

  test('clearing search input resets results to empty state', async ({ page }) => {
    const input = page.locator('.panel-view[data-panel="search"] .sb-search')
    await input.fill('playwright')
    await expect(page.locator('.sb-search-results')).not.toContainText('Type to search')
    await input.fill('')
    await input.dispatchEvent('input')
    await expect(page.locator('.sb-search-results')).toContainText('Type to search')
  })

  test('search returns different result sets for different queries', async ({ page }) => {
    const input = page.locator('.panel-view[data-panel="search"] .sb-search')
    await input.fill('playwright')
    const resultsA = await page.locator('.sb-search-results .sr-file span').allTextContents()
    await input.fill('CONSULTING_AVAILABLE')
    const resultsB = await page.locator('.sb-search-results .sr-file span').allTextContents()
    expect(resultsA).not.toEqual(resultsB)
  })
})

test.describe('Search panel — mobile (activity bar hidden)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('activity bar is hidden on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.act-bar')).not.toBeVisible()
  })

  test('search panel is not visible without activity bar', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.panel-view[data-panel="search"]')).not.toBeVisible()
  })
})
