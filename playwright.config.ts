import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests/browser', timeout: 60000, use: { baseURL: 'http://127.0.0.1:4200', channel: 'msedge', headless: true }, webServer: { command: 'npm run serve:offline', url: 'http://127.0.0.1:4200', reuseExistingServer: true }, reporter: 'list' });
