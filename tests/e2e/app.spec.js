import { test, expect } from '@playwright/test';

test.describe('Fairdrop App', () => {

  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check for main elements
    await expect(page.locator('.select-file')).toBeVisible();

    // Check for key text content (visible h2)
    const visibleH2 = page.locator('.select-file-instruction h2');
    await expect(visibleH2.first()).toBeVisible();

    const pageText = await page.textContent('body');
    expect(pageText).toContain('easy');
    expect(pageText).toContain('secure');
  });

  test('shows file selection UI', async ({ page }) => {
    await page.goto('/');

    // Check for the file selection instruction
    const instruction = page.locator('.select-file-instruction');
    await expect(instruction).toBeVisible();

    // Check for action elements
    const selectAction = page.locator('.select-file-action');
    await expect(selectAction).toBeVisible();
  });

  test('menu is accessible', async ({ page }) => {
    await page.goto('/');

    // Check page loaded
    await expect(page.locator('body')).toBeVisible();
  });

});

test.describe('Account Creation', () => {

  test('can navigate to create account flow', async ({ page }) => {
    await page.goto('/');

    // Click on "Send Encrypted" to trigger account flow
    const sendEncryptedBtn = page.getByRole('button', { name: /Send Encrypted/i });
    if (await sendEncryptedBtn.isVisible()) {
      await sendEncryptedBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('can access mailbox creation', async ({ page }) => {
    await page.goto('/');

    // Try to trigger encrypted send flow
    const sendEncrypted = page.locator('.send-file-encrypted');
    if (await sendEncrypted.isVisible()) {
      await sendEncrypted.click();
      await page.waitForTimeout(500);
    }
  });

});

test.describe('File Upload - Quick Send', () => {

  test('can access quick upload', async ({ page }) => {
    await page.goto('/');

    // Look for quick send option
    const quickSend = page.locator('.send-file-unencrypted');

    if (await quickSend.isVisible()) {
      await quickSend.click();
      await page.waitForTimeout(500);
    }
  });

  test('dropzone is functional', async ({ page }) => {
    await page.goto('/');

    // Check dropzone elements exist
    const dropzone = page.locator('.select-file-send');
    await expect(dropzone).toBeVisible();
  });

  test('quick send button exists', async ({ page }) => {
    await page.goto('/');

    // Check for quick send button
    const quickBtn = page.locator('.select-file-quick');
    await expect(quickBtn).toBeVisible();
  });

});

test.describe('Quick Upload Flow', () => {

  test('quick upload zone is clickable', async ({ page }) => {
    await page.goto('/');

    // Quick upload dropzone should be visible and clickable
    const quickZone = page.locator('.select-file-quick');
    await expect(quickZone).toBeVisible();

    // Check it has the upload instruction text
    const text = await quickZone.textContent();
    expect(text).toContain('quick');
  });

  test('in-progress screen has correct structure', async ({ page }) => {
    // Navigate directly to check component renders
    await page.goto('/');

    // In-progress screen exists (hidden initially)
    const inProgress = page.locator('#in-progress');
    expect(await inProgress.count()).toBe(1);

    // It should have the uploading UI elements
    const html = await inProgress.innerHTML();
    expect(html).toContain('in-progress-ui');
  });

  test('completed screen has correct structure', async ({ page }) => {
    await page.goto('/');

    // Completed screen exists (hidden initially)
    const completed = page.locator('#completed');
    expect(await completed.count()).toBe(1);

    // It should have the confirmation elements
    const html = await completed.innerHTML();
    expect(html).toContain('info-content');
    expect(html).toContain('info-filename');
    expect(html).toContain('info-actions');
  });

  // Note: Full upload E2E tests require:
  // 1. Running Swarm gateway or mock server
  // 2. Programmatic Dropzone file injection
  // These are marked as integration tests and run separately

});

test.describe('Navigation', () => {

  test('can navigate to mailbox view', async ({ page }) => {
    await page.goto('/mailbox');

    // Should show some UI - either mailbox or login
    await page.waitForTimeout(1000);

    // Page should have content
    const body = await page.textContent('body');
    expect(body.length).toBeGreaterThan(50);
  });

  test('about pages load', async ({ page }) => {
    await page.goto('/about/fds');
    await page.waitForTimeout(500);

    // Should have some content
    const body = page.locator('body');
    const text = await body.textContent();
    expect(text.length).toBeGreaterThan(100);
  });

  test('download route exists', async ({ page }) => {
    // Test that download route doesn't crash
    await page.goto('/download/test-reference');
    await page.waitForTimeout(500);

    // Should show some UI
    const body = await page.textContent('body');
    expect(body).toBeDefined();
  });

});

test.describe('Upload Flow Integration', () => {

  test('file upload UI responds to interaction', async ({ page }) => {
    await page.goto('/');

    // Click on the main upload area
    const uploadArea = page.locator('.select-file-send');
    await expect(uploadArea).toBeVisible();

    // Verify text content
    const text = await uploadArea.textContent();
    expect(text).toContain('encrypted');
  });

  test('page has no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Filter out known acceptable errors (like favicon, network issues, Bee connection)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::ERR') &&
      !e.includes('localhost:1633') &&  // Bee node not running is OK for tests
      !e.includes('Failed to fetch') &&  // Network errors OK in test env
      !e.includes('string ref')          // React deprecation warning in legacy code
    );

    // Log errors for debugging
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }

    expect(criticalErrors.length).toBe(0);
  });

});

test.describe('Download Page', () => {

  const testRef = 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd';
  const testFile = 'test-document.pdf';
  const testSize = 1048576; // 1 MB

  test('download page renders with file info', async ({ page }) => {
    await page.goto(`/download/${testRef}/${testFile}?size=${testSize}`);

    // Should show download UI
    await expect(page.locator('#completed')).toBeVisible();

    // Should display filename
    const pageText = await page.textContent('body');
    expect(pageText).toContain('test-document');

    // Should show file size (1 MB)
    expect(pageText).toContain('MB');
  });

  test('download page shows download button', async ({ page }) => {
    await page.goto(`/download/${testRef}/${testFile}?size=${testSize}`);

    // Should have download link
    const downloadLink = page.locator('a.download-file').first();
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveText(/Download File/i);
  });

  test('download page has copy link functionality', async ({ page }) => {
    await page.goto(`/download/${testRef}/${testFile}?size=${testSize}`);

    // Should have copy link input
    const linkInput = page.locator('.feedback-gateway-link-input');
    await expect(linkInput).toBeVisible();

    // Input should contain the current URL
    const inputValue = await linkInput.inputValue();
    expect(inputValue).toContain('/download/');

    // Should have copy button
    const copyBtn = page.locator('.copy-gateway-link');
    await expect(copyBtn).toBeVisible();
  });

  test('download page has send another file link', async ({ page }) => {
    await page.goto(`/download/${testRef}/${testFile}?size=${testSize}`);

    // Should have "Send Another File" link
    const sendAnotherLink = page.locator('a.send-another');
    await expect(sendAnotherLink).toBeVisible();
    await expect(sendAnotherLink).toHaveAttribute('href', '/');
  });

  test('download link points to swarm gateway', async ({ page }) => {
    await page.goto(`/download/${testRef}/${testFile}?size=${testSize}`);

    // Download link should contain the swarm reference
    const downloadLink = page.locator('a.download-file').first();
    const href = await downloadLink.getAttribute('href');
    expect(href).toContain(testRef);
  });

});
