import { test, expect } from '@playwright/test'

test.describe('Run and Debug panel — desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('.act-btn[data-panel="run"]').click()
    await expect(page.locator('.panel-view[data-panel="run"]')).toBeVisible()
  })

  test('run panel opens when clicking activity bar icon', async ({ page }) => {
    await expect(page.locator('.panel-view[data-panel="run"]')).toBeVisible()
  })

  test('all 5 scripts are listed', async ({ page }) => {
    await expect(page.locator('.run-list li[data-run="test"]')).toBeVisible()
    await expect(page.locator('.run-list li[data-run="build"]')).toBeVisible()
    await expect(page.locator('.run-list li[data-run="lint"]')).toBeVisible()
    await expect(page.locator('.run-list li[data-run="deploy"]')).toBeVisible()
    await expect(page.locator('.run-list li[data-run="contact"]')).toBeVisible()
  })

  test('npm test — terminal shows playwright output', async ({ page }) => {
    await page.locator('.run-list li[data-run="test"]').click()
    await expect(page.locator('.term-body')).toContainText('Running')
    await expect(page.locator('.term-body')).toContainText('passed')
  })

  test('npm run build — terminal shows vite output', async ({ page }) => {
    await page.locator('.run-list li[data-run="build"]').click()
    await expect(page.locator('.term-body')).toContainText('vite')
    await expect(page.locator('.term-body')).toContainText('built in')
  })

  test('npm run lint — terminal shows eslint output', async ({ page }) => {
    await page.locator('.run-list li[data-run="lint"]').click()
    await expect(page.locator('.term-body')).toContainText('eslint')
    await expect(page.locator('.term-body')).toContainText('0 errors')
  })

  test('npm run deploy — terminal shows cloudflare output', async ({ page }) => {
    await page.locator('.run-list li[data-run="deploy"]').click()
    await expect(page.locator('.term-body')).toContainText('wrangler')
    await expect(page.locator('.term-body')).toContainText('kamil.kozieradzcy.com')
  })

  test('npm run contact — terminal shows webhook output', async ({ page }) => {
    await page.locator('.run-list li[data-run="contact"]').click()
    await expect(page.locator('.term-body')).toContainText('200 OK')
  })

  test('running script switches bottom panel to terminal', async ({ page }) => {
    await page.locator('.run-list li[data-run="build"]').click()
    await expect(page.locator('.ptab[data-ptab="terminal"]')).toHaveClass(/active/)
  })

  test('Enter key also runs a script', async ({ page }) => {
    await page.locator('.run-list li[data-run="lint"]').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.term-body')).toContainText('eslint')
  })
})
