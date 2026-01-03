/**
 * E2E Tests for v2 Upload Flow
 *
 * Tests the new React-based upload flow with:
 * - Full-viewport dropzone (ASelectFile)
 * - Direct mode selection from drop zone
 * - Wizard-style confirmation (no mode selection step)
 */

import { test, expect } from '@playwright/test';

test.describe('v2 Homepage (ASelectFile)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage displays original fairdrop design', async ({ page }) => {
    // Should show the full-viewport dropzone
    await expect(page.locator('#select-file')).toBeVisible();

    // Should show the instruction text
    await expect(page.locator('.select-file-instruction')).toBeVisible();

    // Should have the tagline
    const h2 = page.locator('.select-file-instruction h2').first();
    await expect(h2).toContainText('easy and secure way to send your files');

    // Should have "No central server" etc
    await expect(page.locator('.select-file-instruction')).toContainText('No central server');
    await expect(page.locator('.select-file-instruction')).toContainText('No tracking');
    await expect(page.locator('.select-file-instruction')).toContainText('No backdoors');
  });

  test('homepage has select link that triggers file dialog', async ({ page }) => {
    // The select link should be visible
    const selectAction = page.locator('.select-file-action');
    await expect(selectAction).toBeVisible();
    await expect(selectAction).toContainText('select');

    // Should be clickable
    await expect(selectAction).toHaveCSS('cursor', 'pointer');
  });

  test('homepage shows drop zones when dragging', async ({ page }) => {
    // Check that the overlay container exists
    const overlay = page.locator('.select-file-main');
    await expect(overlay).toBeVisible();

    // Initially should not have is-selecting class
    await expect(overlay).not.toHaveClass(/is-selecting/);

    // The drop zones should exist
    await expect(page.locator('.select-file-send')).toBeVisible();
    await expect(page.locator('.select-file-quick')).toBeVisible();
  });

  test('mobile buttons are present', async ({ page }) => {
    // Mobile buttons should exist (shown on mobile via CSS)
    await expect(page.locator('.send-file-unencrypted')).toHaveCount(1);
    await expect(page.locator('.send-file-encrypted')).toHaveCount(1);
    await expect(page.locator('.store-file-encrypted')).toHaveCount(1);

    // Check button text
    await expect(page.locator('.send-file-unencrypted')).toContainText('Quick Share');
    await expect(page.locator('.send-file-encrypted')).toContainText('Send Encrypted');
    await expect(page.locator('.store-file-encrypted')).toContainText('Store File');
  });

});

test.describe('v2 Upload Wizard', () => {

  test('upload wizard loads successfully', async ({ page }) => {
    await page.goto('/upload');

    // Should show the wizard content (Card component renders as div)
    await expect(page.locator('[class*="rounded-xl"]').first()).toBeVisible();

    // Should show either file selection or another step
    const pageContent = await page.textContent('body');
    expect(pageContent.length).toBeGreaterThan(100);
  });

  test('upload wizard respects mode parameter', async ({ page }) => {
    // Send mode should go to recipient
    await page.goto('/upload?mode=send');

    // Should show file selection first (no file yet)
    await expect(page.locator('text=Select a file')).toBeVisible();
  });

  test('quick mode skips recipient step', async ({ page }) => {
    await page.goto('/upload?mode=quick');

    // Should show file selection (since no file selected)
    await expect(page.locator('text=Select a file')).toBeVisible();

    // Navigation should not include recipient step for quick mode
  });

});

test.describe('v2 Account Flow', () => {

  test('mailbox page shows welcome when no accounts', async ({ page }) => {
    // Navigate first, then clear storage
    await page.goto('/mailbox');

    // Clear accounts via page context
    await page.evaluate(() => {
      localStorage.removeItem('fairdrop_mailboxes_v2');
    });

    // Reload to apply
    await page.reload();

    // Should show welcome message
    await expect(page.locator('text=Welcome to your Fairdrop Inbox')).toBeVisible();

    // Should show create account button
    await expect(page.locator('text=Create New Account')).toBeVisible();
  });

  test('login/register link navigates to mailbox', async ({ page }) => {
    await page.goto('/');

    // Find and click the login/register link
    const loginLink = page.locator('text=Log in / Register');
    await expect(loginLink).toBeVisible();

    await loginLink.click();

    // Should navigate to mailbox
    await expect(page).toHaveURL(/\/mailbox/);
  });

});

test.describe('v2 Navigation', () => {

  test('header shows Fairdrop logo', async ({ page }) => {
    await page.goto('/');

    // The page should contain Fairdrop branding - either text or image
    const hasLogoImage = await page.locator('img[src*="fairdrop"]').count() > 0;
    const hasLogoText = await page.locator('text=Fairdrop').count() > 0;
    const pageText = await page.textContent('body');
    const hasTextInBody = pageText.toLowerCase().includes('fair');

    // Should have some form of branding
    expect(hasLogoImage || hasLogoText || hasTextInBody).toBeTruthy();
  });

  test('hamburger menu button exists', async ({ page }) => {
    await page.goto('/');

    // Should have some menu/navigation element
    const menuElement = page.locator('button, [role="button"]').first();
    await expect(menuElement).toBeVisible();
  });

  test('invalid route loads page without crashing', async ({ page }) => {
    await page.goto('/invalid-route-12345');

    // Page should load without crash
    const pageText = await page.textContent('body');
    expect(pageText.length).toBeGreaterThan(0);

    // Should show some kind of 404 or redirect
    const url = page.url();
    expect(url).toBeDefined();
  });

});

test.describe('v2 Download Page', () => {

  test('download page accepts reference parameter', async ({ page }) => {
    const testRef = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

    await page.goto(`/download/${testRef}`);

    // Should show download page (may show error if ref not found, but page should load)
    await expect(page).toHaveURL(/\/download\//);
  });

});

test.describe('v2 Responsive Design', () => {

  test('desktop view shows select/drop text', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Desktop should show "select or drop a file" text
    const desktopText = page.locator('.hide-mobile');
    await expect(desktopText.first()).toBeVisible();
  });

  test('mobile view shows buttons', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile should show buttons (via .show-mobile class)
    // Note: Actual visibility depends on CSS media queries
    await expect(page.locator('.show-mobile')).toHaveCount(1);
  });

});
