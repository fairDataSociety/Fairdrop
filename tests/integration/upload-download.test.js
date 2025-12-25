/**
 * Integration Tests for Upload/Download Flow
 *
 * These tests verify the complete upload and download cycle
 * using a mock Swarm server.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createMockSwarmServer } from '../mocks/swarm-server.js';

// Mock fetch for Node.js environment
import { vi } from 'vitest';

describe('Upload/Download Integration', () => {
  let mockServer;
  let MOCK_URL;

  beforeAll(async () => {
    mockServer = createMockSwarmServer(0); // Use random available port
    await mockServer.start();
    MOCK_URL = mockServer.getUrl();
    console.log(`Tests using mock server at: ${MOCK_URL}`);
  });

  afterAll(async () => {
    if (mockServer) {
      await mockServer.stop();
    }
  });

  beforeEach(() => {
    mockServer.clearFiles();
  });

  describe('Upload Flow', () => {

    it('should upload a file and receive a valid reference', async () => {
      const testContent = 'Hello, Swarm!';
      const testFilename = 'test.txt';

      const response = await fetch(`${MOCK_URL}/bzz?name=${encodeURIComponent(testFilename)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Swarm-Postage-Batch-Id': 'test-stamp-id'
        },
        body: testContent
      });

      expect(response.ok).toBe(true);

      const result = await response.json();

      // Reference should be 64 hex characters
      expect(result.reference).toBeDefined();
      expect(result.reference.length).toBe(64);
      expect(/^[a-fA-F0-9]+$/.test(result.reference)).toBe(true);

      // File should be stored in mock server
      const uploadedFiles = mockServer.getUploadedFiles();
      expect(uploadedFiles.has(result.reference)).toBe(true);
    });

    it('should store file metadata correctly', async () => {
      const testContent = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // PNG header
      const testFilename = 'image.png';

      const response = await fetch(`${MOCK_URL}/bzz?name=${encodeURIComponent(testFilename)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          'Swarm-Postage-Batch-Id': 'test-stamp-id'
        },
        body: testContent
      });

      const result = await response.json();
      const uploadedFiles = mockServer.getUploadedFiles();
      const storedFile = uploadedFiles.get(result.reference);

      expect(storedFile.filename).toBe(testFilename);
      expect(storedFile.size).toBe(4);
      expect(storedFile.contentType).toBe('image/png');
    });

    it('should handle large file uploads', async () => {
      // Create a 1MB test file
      const size = 1024 * 1024;
      const largeContent = Buffer.alloc(size, 'x');

      const response = await fetch(`${MOCK_URL}/bzz?name=large-file.bin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: largeContent
      });

      expect(response.ok).toBe(true);

      const result = await response.json();
      const uploadedFiles = mockServer.getUploadedFiles();
      const storedFile = uploadedFiles.get(result.reference);

      expect(storedFile.size).toBe(size);
    });

  });

  describe('Download Flow', () => {

    it('should download a previously uploaded file', async () => {
      // Upload first
      const originalContent = 'Download me!';
      const uploadResponse = await fetch(`${MOCK_URL}/bzz?name=download-test.txt`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: originalContent
      });
      const { reference } = await uploadResponse.json();

      // Download
      const downloadResponse = await fetch(`${MOCK_URL}/bzz/${reference}`);

      expect(downloadResponse.ok).toBe(true);

      const downloadedContent = await downloadResponse.text();
      expect(downloadedContent).toBe(originalContent);
    });

    it('should return mock content for unknown references', async () => {
      const unknownRef = 'a'.repeat(64);

      const response = await fetch(`${MOCK_URL}/bzz/${unknownRef}`);

      expect(response.ok).toBe(true);
      const content = await response.text();
      expect(content).toContain('Mock file content');
    });

    it('should preserve content type on download', async () => {
      // Upload JSON
      const jsonContent = JSON.stringify({ test: true });
      const uploadResponse = await fetch(`${MOCK_URL}/bzz?name=data.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonContent
      });
      const { reference } = await uploadResponse.json();

      // Download
      const downloadResponse = await fetch(`${MOCK_URL}/bzz/${reference}`);

      expect(downloadResponse.headers.get('content-type')).toBe('application/json');
    });

  });

  describe('Stamps API', () => {

    it('should return available stamps', async () => {
      const response = await fetch(`${MOCK_URL}/stamps`);

      expect(response.ok).toBe(true);

      const data = await response.json();

      expect(data.stamps).toBeDefined();
      expect(data.stamps.length).toBeGreaterThan(0);
      expect(data.stamps[0].usable).toBe(true);
      expect(data.stamps[0].batchID).toBeDefined();
    });

  });

  describe('Full Upload-Download Cycle', () => {

    it('should complete full cycle: upload -> construct URL -> download', async () => {
      // Step 1: Upload
      const fileContent = 'Full cycle test content';
      const fileName = 'cycle-test.txt';
      const fileSize = fileContent.length;

      const uploadResponse = await fetch(`${MOCK_URL}/bzz?name=${encodeURIComponent(fileName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: fileContent
      });

      expect(uploadResponse.ok).toBe(true);
      const { reference } = await uploadResponse.json();

      // Step 2: Construct download URL (as app would)
      const appDownloadUrl = `https://fairdrop.xyz/download/${reference}/${fileName}?size=${fileSize}`;

      // Verify URL format
      expect(appDownloadUrl).toContain('/download/');
      expect(appDownloadUrl).toContain(reference);
      expect(appDownloadUrl).toContain(fileName);
      expect(appDownloadUrl).toContain(`size=${fileSize}`);

      // Step 3: Parse URL to gateway format (as Download.js does)
      const pathname = `/download/${reference}/${fileName}`;
      const gatewayPath = pathname.replace('/download/', '/bzz/');

      expect(gatewayPath).toBe(`/bzz/${reference}/${fileName}`);

      // Step 4: Construct gateway URL
      const gatewayUrl = `${MOCK_URL}${gatewayPath.replace('//', '/')}`;

      // Step 5: Download from gateway
      const downloadResponse = await fetch(gatewayUrl);

      expect(downloadResponse.ok).toBe(true);
      const downloadedContent = await downloadResponse.text();
      expect(downloadedContent).toBe(fileContent);
    });

    it('should handle files with spaces in names', async () => {
      const fileName = 'my document.pdf';
      const content = 'PDF content here';

      // Upload with encoded filename
      const uploadResponse = await fetch(`${MOCK_URL}/bzz?name=${encodeURIComponent(fileName)}`, {
        method: 'POST',
        body: content
      });

      const { reference } = await uploadResponse.json();

      // Construct and verify URL
      const downloadUrl = `https://fairdrop.xyz/download/${reference}/${encodeURIComponent(fileName)}`;
      expect(downloadUrl).toContain('my%20document.pdf');

      // Download (mock accepts encoded filenames)
      const downloadResponse = await fetch(`${MOCK_URL}/bzz/${reference}/${encodeURIComponent(fileName)}`);
      expect(downloadResponse.ok).toBe(true);
    });

  });

});
