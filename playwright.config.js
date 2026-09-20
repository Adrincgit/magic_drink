// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: process.env.MAGIC_DRINK_TEST_URL || 'http://127.0.0.1:4321',
    headless: true,
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    video: 'off',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
    },
  ],
  outputDir: './tests/results',
});
