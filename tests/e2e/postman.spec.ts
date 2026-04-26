import { test, expect } from '@playwright/test'

test.describe('Postman', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-win-id="postman"]').waitFor({ state: 'attached', timeout: 5000 })
    const postman = page.locator('[data-win-id="postman"]')
    if (!(await postman.isVisible())) {
      await page.locator('.dock-icon[data-win="postman"]').click({ force: true })
      await expect(postman).toBeVisible()
    }
  })

  test('tab switching shows correct panel', async ({ page }) => {
    await page.locator('[data-rtab="auth"]').click()
    await expect(page.locator('[data-rpanel="auth"]')).toBeVisible()
    await expect(page.locator('[data-rpanel="body"]')).not.toBeVisible()
  })

  test('switching back to body tab', async ({ page }) => {
    await page.locator('[data-rtab="auth"]').click()
    await page.locator('[data-rtab="body"]').click()
    await expect(page.locator('[data-rpanel="body"]')).toBeVisible()
  })

  test('submit empty form shows validation errors', async ({ page }) => {
    await page.locator('#contact-form button[type="submit"]').click()
    const errFields = page.locator('.field[data-err="1"]')
    await expect(errFields).toHaveCount(3)
  })

  test('invalid email shows error', async ({ page }) => {
    await page.locator('[name="name"]').fill('Kamil')
    await page.locator('[name="email"]').fill('notanemail')
    await page.locator('[name="message"]').fill('This is a long enough message.')
    await page.locator('#contact-form button[type="submit"]').click()
    await expect(page.locator('#f-email').locator('../..')).toHaveAttribute('data-err', '1')
  })

  test('short message shows error', async ({ page }) => {
    await page.locator('[name="name"]').fill('Kamil')
    await page.locator('[name="email"]').fill('kamil@example.com')
    await page.locator('[name="message"]').fill('Hi')
    await page.locator('#contact-form button[type="submit"]').click()
    await expect(page.locator('#f-msg').locator('../..')).toHaveAttribute('data-err', '1')
  })

  test('valid form submission (mocked fetch)', async ({ page }) => {
    await page.route('**/contact**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    )
    await page.locator('[name="name"]').fill('Kamil')
    await page.locator('[name="email"]').fill('kamil@example.com')
    await page.locator('[name="message"]').fill('This is a test message that is long enough.')
    await page.locator('#contact-form button[type="submit"]').click()
    await expect(page.locator('.rest-win')).toContainText('200')
  })

  test('auth type cycles on click', async ({ page }) => {
    await page.locator('[data-rtab="auth"]').click()
    const authVal = page.locator('.rest-auth-val')
    await expect(authVal).toContainText('No Auth')
    await authVal.click()
    await expect(authVal).toContainText('Bearer Token')
    await authVal.click()
    await expect(authVal).toContainText('Basic Auth')
    await authVal.click()
    await expect(authVal).toContainText('No Auth')
  })

  test('run tests button shows results', async ({ page }) => {
    await page.locator('[data-rtab="tests"]').click()
    await page.locator('#run-tests-btn').click()
    await expect(page.locator('#rest-test-results')).not.toBeEmpty({ timeout: 2000 })
  })
})
