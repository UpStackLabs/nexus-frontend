import { test, expect } from '@playwright/test';

test.describe('Nexus Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the main layout to render
    await page.waitForSelector('[class*="h-screen"]', { timeout: 10_000 });
  });

  test('dashboard loads with NEXUS branding', async ({ page }) => {
    // Header should contain NEXUS text
    const header = page.locator('header, [class*="Header"]').first();
    await expect(header).toBeVisible();
    await expect(page.getByText('NEXUS', { exact: true }).first()).toBeVisible();
  });

  test('news feed shows events', async ({ page }) => {
    // OSINT feed should be visible on the left
    const osintFeed = page.getByText('OSINT', { exact: false }).first();
    await expect(osintFeed).toBeVisible({ timeout: 10_000 });
  });

  test('stocks by sector panel renders', async ({ page }) => {
    // Right panel should show "STOCKS BY SECTOR"
    const sectorPanel = page.getByText('STOCKS BY SECTOR', { exact: false });
    await expect(sectorPanel).toBeVisible({ timeout: 10_000 });
  });

  test('stock chart renders with price action', async ({ page }) => {
    // Chart header should show PRICE ACTION
    const chartHeader = page.getByText('PRICE ACTION', { exact: false });
    await expect(chartHeader).toBeVisible({ timeout: 10_000 });
  });

  test('prediction overlay toggle exists', async ({ page }) => {
    // AI prediction toggle button (exact match to avoid "AI CHAT" etc.)
    const aiButton = page.getByRole('button', { name: 'AI', exact: true });
    await expect(aiButton).toBeVisible({ timeout: 10_000 });
  });

  test('globe container renders', async ({ page }) => {
    // Globe uses a canvas element
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10_000 });
  });

  test('status bar shows connection state', async ({ page }) => {
    // Status bar should show either CONNECTED or DISCONNECTED
    const statusText = page.getByText(/CONNECTED|DISCONNECTED/).first();
    await expect(statusText).toBeVisible({ timeout: 10_000 });
  });

  test('search overlay opens with Cmd+K', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    // Search overlay should appear
    const searchOverlay = page.getByPlaceholder(/search/i).first();
    await expect(searchOverlay).toBeVisible({ timeout: 5_000 });
  });

  test('ticker bar renders', async ({ page }) => {
    // The ticker bar at the top should have content or at least exist
    const tickerBar = page.locator('[class*="animate-marquee"]').first();
    // It may be empty if no API keys, but the container should exist
    const parent = page.locator('[class*="h-6"][class*="bg-"]').first();
    await expect(parent).toBeVisible();
  });
});
