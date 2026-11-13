import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        defaultBrowserType: 'chromium',
        channel: 'chrome',
      },
    },
    {
      name: 'safari',
      use: { ...devices['iPhone 13'], browserName: 'webkit', channel: '' },
    },
    {
      name: 'desktop',
      use: { channel: 'chrome', viewport: { width: 1440, height: 1050 } },
    },
  ],
  webServer: {
    command: 'bun run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
  },
});
