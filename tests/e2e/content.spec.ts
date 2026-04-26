import { test, expect } from '@playwright/test'

test.describe('Editor content — about.md', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-file-sidebar="md"]').click()
  })

  test('quote is present', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="md"]')).toContainText('QA & Test Automation Lead at BF Games')
  })

  test('personal intro sentence is present', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="md"]')).toContainText("I've spent 8 years making sure other people's code doesn't break in production")
  })

  test('Approach section heading is present', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="md"]')).toContainText('## Approach')
  })

  test('Approach bullet: People, not just pipelines', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="md"]')).toContainText('People, not just pipelines')
  })

  test('Background section is present', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="md"]')).toContainText('## Background')
  })
})

test.describe('Editor content — package.json', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-file-sidebar="json"]').click()
  })

  test('playwright tool is listed', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="json"]')).toContainText('@playwright/test')
  })

  test('typescript is listed', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="json"]')).toContainText('typescript')
  })

  test('consulting: true', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="json"]')).toContainText('"consulting"')
  })

  test('no jenkins --pipeline (regression)', async ({ page }) => {
    const text = await page.locator('.editor-view[data-file="json"]').textContent()
    expect(text).not.toContain('jenkins --pipeline')
  })

  test('CI includes Jenkins and GitHub Actions', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="json"]')).toContainText('Jenkins')
    await expect(page.locator('.editor-view[data-file="json"]')).toContainText('GitHub Actions')
  })
})

test.describe('Editor content — README.md', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-file-sidebar="readme"]').click()
  })

  test('personal intro line', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="readme"]')).toContainText('I write tests for a living')
  })

  test("What's where section present", async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="readme"]')).toContainText("## What's where")
  })

  test('GitHub link @kacoze present', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="readme"] a[href*="github.com/kacoze"]')).toBeVisible()
  })

  test('LinkedIn link present', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="readme"] a[href*="linkedin"]')).toBeVisible()
  })
})

test.describe('Editor content — .env', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-file-sidebar="env"]').click()
  })

  test('CONSULTING_AVAILABLE=true', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="env"]')).toContainText('CONSULTING_AVAILABLE')
    await expect(page.locator('.editor-view[data-file="env"]')).toContainText('true')
  })

  test('TIMEZONE=Europe/Warsaw', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="env"]')).toContainText('TIMEZONE')
    await expect(page.locator('.editor-view[data-file="env"]')).toContainText('Europe/Warsaw')
  })

  test('RESPONSE_TIME present', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="env"]')).toContainText('RESPONSE_TIME')
  })

  test('secrets are redacted', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="env"]')).toContainText('***REDACTED***')
  })
})

test.describe('Editor content — kamil.spec.ts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('header shows name and role', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="spec"]')).toContainText('Kamil Kozieradzki')
  })

  test('describe("experience") block present', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="spec"]')).toContainText("'experience'")
  })

  test('describe("leadership") block present', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="spec"]')).toContainText("'leadership'")
  })

  test('8 years tenure assertion present', async ({ page }) => {
    await expect(page.locator('.editor-view[data-file="spec"]')).toContainText('8')
  })
})
