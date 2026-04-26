import { test, expect } from '@playwright/test'

test.describe('Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('initial active file is spec', async ({ page }) => {
    await expect(page.locator('.vsc-win')).toHaveAttribute('data-active', 'spec')
    await expect(page.locator('.editor-view[data-file="spec"]')).toBeVisible()
  })

  test('clicking sidebar file switches active view', async ({ page }) => {
    await page.locator('[data-file-sidebar="json"]').click()
    await expect(page.locator('.vsc-win')).toHaveAttribute('data-active', 'json')
    await expect(page.locator('.editor-view[data-file="json"]')).toBeVisible()
    await expect(page.locator('.editor-view[data-file="spec"]')).not.toBeVisible()
  })

  test('clicking tab switches active file', async ({ page }) => {
    await page.locator('[data-file-tab="md"]').click()
    await expect(page.locator('.vsc-win')).toHaveAttribute('data-active', 'md')
    await expect(page.locator('[data-file-tab="md"]')).toHaveAttribute('aria-selected', 'true')
  })

  test('closing a tab removes it', async ({ page }) => {
    await page.locator('[data-file-tab="md"] .close').click()
    await expect(page.locator('[data-file-tab="md"]')).not.toBeVisible()
  })

  test('activity bar: switching to Search panel', async ({ page }) => {
    await page.locator('.act-btn[data-panel="search"]').click()
    await expect(page.locator('.panel-view[data-panel="search"]')).toBeVisible()
  })

  test('search input filters files', async ({ page }) => {
    await page.locator('.act-btn[data-panel="search"]').click()
    const searchPanel = page.locator('.panel-view[data-panel="search"]')
    await searchPanel.locator('.sb-search').fill('spec')
    await expect(page.locator('.sb-search-results')).not.toBeEmpty()
  })

  test('clicking line adds .hi class', async ({ page }) => {
    const line = page.locator('.editor-view[data-file="spec"] .ln').first()
    await line.click()
    await expect(line).toHaveClass(/hi/)
  })

  test('right-click shows context menu', async ({ page }) => {
    const line = page.locator('.editor-view[data-file="spec"] .ln').first()
    await line.click({ button: 'right' })
    await expect(page.locator('.ctx-menu')).toBeVisible()
  })

  test('Escape closes context menu', async ({ page }) => {
    const line = page.locator('.editor-view[data-file="spec"] .ln').first()
    await line.click({ button: 'right' })
    await page.keyboard.press('Escape')
    await expect(page.locator('.ctx-menu')).not.toBeVisible()
  })

  test('status bar branch click shows dropdown', async ({ page }) => {
    await page.locator('.status [aria-label="Branch"]').click()
    await expect(page.locator('.branch-dropdown')).toBeVisible()
  })

  test('status bar encoding cycles on click', async ({ page }) => {
    const enc = page.locator('.status span').filter({ hasText: /^UTF/ })
    const initial = await enc.textContent()
    await enc.click()
    const next = await enc.textContent()
    expect(next).not.toBe(initial)
  })

  test('status bar line ending cycles on click', async ({ page }) => {
    const le = page.locator('.status span').filter({ hasText: /^(LF|CRLF|CR)$/ })
    const initial = await le.textContent()
    await le.click()
    const next = await le.textContent()
    expect(next).not.toBe(initial)
  })

  test('breadcrumb updates when switching file', async ({ page }) => {
    const bcFile = page.locator('[data-bc-file]')
    const initialText = await bcFile.textContent()
    await page.locator('[data-file-sidebar="json"]').click()
    const newText = await bcFile.textContent()
    expect(newText).not.toBe(initialText)
  })

  test('minimap is visible', async ({ page }) => {
    await expect(page.locator('.minimap')).toBeVisible()
  })

  test('terminal: typing help shows output', async ({ page }) => {
    const input = page.locator('.term-input')
    await input.fill('help')
    await input.press('Enter')
    await expect(page.locator('.term-body')).toContainText('npm')
  })

  test('terminal: typing ls shows output', async ({ page }) => {
    const input = page.locator('.term-input')
    await input.fill('ls')
    await input.press('Enter')
    await expect(page.locator('.term-body')).toContainText('src')
  })

  test('terminal: Ctrl+L clears output', async ({ page }) => {
    const input = page.locator('.term-input')
    await input.fill('ls')
    await input.press('Enter')
    await input.press('Control+l')
    const lines = page.locator('.term-body .t-line')
    await expect(lines).toHaveCount(1)
  })

  test('terminal: arrow up restores previous command', async ({ page }) => {
    const input = page.locator('.term-input')
    await input.fill('ls')
    await input.press('Enter')
    await input.press('ArrowUp')
    await expect(input).toHaveValue('ls')
  })

  test('source control stage toggle', async ({ page }) => {
    await page.locator('.act-btn[data-panel="sc"]').click()
    const status = page.locator('.sc-status').first()
    const before = await status.textContent()
    await status.click()
    const after = await status.textContent()
    expect(after).not.toBe(before)
  })
})
