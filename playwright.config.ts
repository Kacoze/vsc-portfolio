import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      testDir: 'tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      testDir: 'tests/e2e',
      use: { ...devices['Pixel 5'] },
    },
  ],
})
