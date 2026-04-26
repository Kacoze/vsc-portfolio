import { test, expect } from '@playwright/test'

async function runCmd(page: any, cmd: string) {
  const input = page.locator('.term-input')
  await input.fill(cmd)
  await input.press('Enter')
}

test.describe('Terminal commands — desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('help — lists available commands', async ({ page }) => {
    await runCmd(page, 'help')
    await expect(page.locator('.term-body')).toContainText('Available commands')
    await expect(page.locator('.term-body')).toContainText('npm')
    await expect(page.locator('.term-body')).toContainText('git')
  })

  test('ls — shows file listing', async ({ page }) => {
    await runCmd(page, 'ls')
    await expect(page.locator('.term-body')).toContainText('src')
    await expect(page.locator('.term-body')).toContainText('README.md')
    await expect(page.locator('.term-body')).toContainText('package.json')
  })

  test('ls -la — shows detailed listing', async ({ page }) => {
    await runCmd(page, 'ls -la')
    await expect(page.locator('.term-body')).toContainText('drwxr-xr-x')
    await expect(page.locator('.term-body')).toContainText('.env')
  })

  test('pwd — shows working directory', async ({ page }) => {
    await runCmd(page, 'pwd')
    await expect(page.locator('.term-body')).toContainText('/Users/kamil/kamil-portfolio')
  })

  test('whoami — returns kamil', async ({ page }) => {
    await runCmd(page, 'whoami')
    await expect(page.locator('.term-body')).toContainText('kamil')
  })

  test('date — returns a date string', async ({ page }) => {
    await runCmd(page, 'date')
    const body = await page.locator('.term-body').textContent()
    expect(body).toMatch(/\d{4}/)
  })

  test('echo — returns the argument', async ({ page }) => {
    await runCmd(page, 'echo hello world')
    await expect(page.locator('.term-body')).toContainText('hello world')
  })

  test('git status — shows branch and changes', async ({ page }) => {
    await runCmd(page, 'git status')
    await expect(page.locator('.term-body')).toContainText('On branch')
    await expect(page.locator('.term-body')).toContainText('main')
  })

  test('git log — shows commit hashes', async ({ page }) => {
    await runCmd(page, 'git log')
    await expect(page.locator('.term-body')).toContainText('ca99037')
    await expect(page.locator('.term-body')).toContainText('45a01c1')
  })

  test('git unknown subcommand — shows error', async ({ page }) => {
    await runCmd(page, 'git rebase')
    await expect(page.locator('.term-body')).toContainText('is not a git command')
  })

  test('npm test — shows playwright test output', async ({ page }) => {
    await runCmd(page, 'npm test')
    await expect(page.locator('.term-body')).toContainText('Running')
    await expect(page.locator('.term-body')).toContainText('passed')
  })

  test('npm run build — shows vite build output', async ({ page }) => {
    await runCmd(page, 'npm run build')
    await expect(page.locator('.term-body')).toContainText('vite')
    await expect(page.locator('.term-body')).toContainText('built in')
  })

  test('npm run lint — shows eslint output', async ({ page }) => {
    await runCmd(page, 'npm run lint')
    await expect(page.locator('.term-body')).toContainText('eslint')
    await expect(page.locator('.term-body')).toContainText('0 errors')
  })

  test('npm run deploy — shows cloudflare output', async ({ page }) => {
    await runCmd(page, 'npm run deploy')
    await expect(page.locator('.term-body')).toContainText('wrangler')
    await expect(page.locator('.term-body')).toContainText('kamil.kozieradzcy.com')
  })

  test('npm run contact — shows webhook output', async ({ page }) => {
    await runCmd(page, 'npm run contact')
    await expect(page.locator('.term-body')).toContainText('200 OK')
    await expect(page.locator('.term-body')).toContainText('delivered')
  })

  test('cat about.md — dumps file content', async ({ page }) => {
    await page.waitForSelector('.editor-view[data-file="md"]', { state: 'attached', timeout: 5000 })
    await runCmd(page, 'cat about.md')
    await expect(page.locator('.term-body')).toContainText('Kamil Kozieradzki')
  })

  test('cat missing-file — shows error', async ({ page }) => {
    await runCmd(page, 'cat missing.txt')
    await expect(page.locator('.term-body')).toContainText('No such file or directory')
  })

  test('unknown command — shows command not found', async ({ page }) => {
    await runCmd(page, 'foobar')
    await expect(page.locator('.term-body')).toContainText('command not found: foobar')
  })

  test('Ctrl+L clears terminal output', async ({ page }) => {
    await runCmd(page, 'ls')
    await page.locator('.term-input').press('Control+l')
    const lines = page.locator('.term-body .t-line')
    await expect(lines).toHaveCount(1)
  })

  test('arrow up restores previous command', async ({ page }) => {
    await runCmd(page, 'whoami')
    await page.locator('.term-input').press('ArrowUp')
    await expect(page.locator('.term-input')).toHaveValue('whoami')
  })

  test('arrow down after up resets to empty', async ({ page }) => {
    await runCmd(page, 'whoami')
    const input = page.locator('.term-input')
    await input.press('ArrowUp')
    await input.press('ArrowDown')
    await expect(input).toHaveValue('')
  })
})

test.describe('Terminal — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('terminal input is accessible on mobile', async ({ page }) => {
    await expect(page.locator('.term-input')).toBeVisible()
  })

  test('commands work on mobile', async ({ page }) => {
    await runCmd(page, 'whoami')
    await expect(page.locator('.term-body')).toContainText('kamil')
  })

  test('git log works on mobile', async ({ page }) => {
    await runCmd(page, 'git log')
    await expect(page.locator('.term-body')).toContainText('ca99037')
  })
})
