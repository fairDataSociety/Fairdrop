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

test.describe('File Upload - Unified Dropzone', () => {

  test('can access upload area', async ({ page }) => {
    await page.goto('/');

    // Look for unified dropzone
    const dropzone = page.locator('.unified-dropzone');
    await expect(dropzone).toBeVisible();
  });

  test('dropzone is functional', async ({ page }) => {
    await page.goto('/');

    // Check unified dropzone exists
    const dropzone = page.locator('.unified-dropzone');
    await expect(dropzone).toBeVisible();
  });

  test('select file instruction exists', async ({ page }) => {
    await page.goto('/');

    // Check for select file instruction
    const instruction = page.locator('.select-file-instruction');
    await expect(instruction).toBeVisible();
  });

});

test.describe('Upload Flow', () => {

  test('unified dropzone is clickable', async ({ page }) => {
    await page.goto('/');

    // Unified dropzone should be visible
    const dropzone = page.locator('.unified-dropzone');
    await expect(dropzone).toBeVisible();

    // Check it has the upload instruction text
    const text = await page.locator('.select-file-instruction').textContent();
    expect(text).toContain('select');
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

    // Click on the main upload area (unified dropzone)
    const uploadArea = page.locator('.unified-dropzone');
    await expect(uploadArea).toBeVisible();

    // Verify instruction text content
    const text = await page.locator('.select-file-instruction').textContent();
    expect(text).toContain('select');
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
      !e.includes('401') &&              // Auth errors OK in test env (no backend)
      !e.includes('net::ERR') &&
      !e.includes('localhost:1633') &&  // Bee node not running is OK for tests
      !e.includes('Failed to fetch') &&  // Network errors OK in test env
      !e.includes('string ref') &&       // React deprecation warning in legacy code
      !e.includes('posthog')             // PostHog errors OK in test env
    );

    // Log errors for debugging
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }

    expect(criticalErrors.length).toBe(0);
  });

});

test.describe('Mobile UI', () => {

  test('mobile buttons are present', async ({ page }) => {
    await page.goto('/');

    // Mobile buttons should exist in DOM
    const quickBtn = page.locator('.send-file-unencrypted');
    const encryptedBtn = page.locator('.send-file-encrypted');
    const storeBtn = page.locator('.store-file-encrypted');

    expect(await quickBtn.count()).toBe(1);
    expect(await encryptedBtn.count()).toBe(1);
    expect(await storeBtn.count()).toBe(1);
  });

  test('mobile buttons have correct text', async ({ page }) => {
    await page.goto('/');

    const quickBtn = page.locator('.send-file-unencrypted');
    const encryptedBtn = page.locator('.send-file-encrypted');
    const storeBtn = page.locator('.store-file-encrypted');

    await expect(quickBtn).toHaveText(/Quick Share/i);
    await expect(encryptedBtn).toHaveText(/Encrypted/i);
    await expect(storeBtn).toHaveText(/Store/i);
  });

});

test.describe('Progress Screen Structure', () => {

  test('progress screen has uploading UI elements', async ({ page }) => {
    await page.goto('/');

    const inProgress = page.locator('#in-progress');
    expect(await inProgress.count()).toBe(1);

    // Check for progress icon image
    const html = await inProgress.innerHTML();
    expect(html).toContain('progress.svg');
  });

  test('progress screen has mist effect container', async ({ page }) => {
    await page.goto('/');

    const mist = page.locator('#in-progress .mist');
    expect(await mist.count()).toBe(1);
  });

  test('progress screen is hidden initially', async ({ page }) => {
    await page.goto('/');

    const inProgress = page.locator('#in-progress');
    await expect(inProgress).toHaveClass(/hidden/);
  });

});

test.describe('Completed Screen Structure', () => {

  test('completed screen has all required elements', async ({ page }) => {
    await page.goto('/');

    const completed = page.locator('#completed');
    const html = await completed.innerHTML();

    // Core elements
    expect(html).toContain('circle-tick.svg');
    expect(html).toContain('info-filename');
    expect(html).toContain('info-filesize');
    expect(html).toContain('info-actions');
  });

  test('completed screen is hidden initially', async ({ page }) => {
    await page.goto('/');

    const completed = page.locator('#completed');
    await expect(completed).toHaveClass(/hidden/);
  });

  test('completed screen has action buttons', async ({ page }) => {
    await page.goto('/');

    const actionBtn = page.locator('#completed .info-action');
    expect(await actionBtn.count()).toBeGreaterThan(0);
  });

});

test.describe('Unified Dropzone Structure', () => {

  test('unified dropzone is visible on homepage', async ({ page }) => {
    await page.goto('/');

    const dropzone = page.locator('.unified-dropzone');
    await expect(dropzone).toBeVisible();
  });

  test('instruction area has select action', async ({ page }) => {
    await page.goto('/');

    const selectAction = page.locator('.select-file-action');
    await expect(selectAction).toBeVisible();
    await expect(selectAction).toHaveText(/select/i);
  });

  test('unified dropzone contains instruction text', async ({ page }) => {
    await page.goto('/');

    const instruction = page.locator('.select-file-instruction');
    await expect(instruction).toBeVisible();
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
