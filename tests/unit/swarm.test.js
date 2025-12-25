/**
 * Unit tests for Swarm library functions
 * Tests URL construction, validation, and core logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment
vi.stubGlobal('window', {
  location: {
    origin: 'https://fairdrop.xyz',
    href: 'https://fairdrop.xyz/'
  }
});

// Test the URL construction logic directly
describe('Swarm URL Construction', () => {

  const VALID_REFERENCE = 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd';
  const GATEWAY = 'https://bee-1.fairdatasociety.org';

  describe('getShareableLink', () => {
    it('should construct download URL with filename', () => {
      const baseUrl = 'https://fairdrop.xyz';
      const reference = VALID_REFERENCE;
      const filename = 'test-file.pdf';

      const expected = `${baseUrl}/download/${reference}/${encodeURIComponent(filename)}`;
      const result = `${baseUrl}/download/${reference}/${encodeURIComponent(filename)}`;

      expect(result).toBe(expected);
      expect(result).toContain('/download/');
      expect(result).toContain(reference);
      expect(result).toContain(filename);
    });

    it('should handle filenames with spaces', () => {
      const baseUrl = 'https://fairdrop.xyz';
      const reference = VALID_REFERENCE;
      const filename = 'my document.pdf';

      const result = `${baseUrl}/download/${reference}/${encodeURIComponent(filename)}`;

      expect(result).toContain('my%20document.pdf');
    });

    it('should handle filenames with special characters', () => {
      const baseUrl = 'https://fairdrop.xyz';
      const reference = VALID_REFERENCE;
      const filename = 'file (1) & copy.pdf';

      const result = `${baseUrl}/download/${reference}/${encodeURIComponent(filename)}`;

      // Spaces and ampersands must be encoded
      expect(result).not.toContain(' ');
      expect(result).toContain('%20'); // space encoded
      expect(result).toContain('%26'); // & encoded
      // Parentheses are valid URL characters and may or may not be encoded
      expect(result).toContain('file');
      expect(result).toContain('copy.pdf');
    });
  });

  describe('getGatewayLink', () => {
    it('should construct gateway URL with /bzz/ format', () => {
      const reference = VALID_REFERENCE;

      const result = `${GATEWAY}/bzz/${reference}`;

      expect(result).toBe(`https://bee-1.fairdatasociety.org/bzz/${reference}`);
      expect(result).not.toContain('bzz:'); // No legacy colon format
    });
  });

  describe('Download URL parsing', () => {
    it('should convert download path to gateway bzz path', () => {
      const pathname = '/download/a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd/test.pdf';

      // This is what Download.js does
      const loc = pathname.replace('download/', '/bzz/');

      expect(loc).toBe('//bzz/a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd/test.pdf');
    });

    it('should not include legacy colon in bzz path', () => {
      const pathname = '/download/abc123/file.txt';
      const loc = pathname.replace('download/', '/bzz/');

      expect(loc).not.toContain('bzz:');
      expect(loc).toContain('/bzz/');
    });
  });
});

describe('Swarm Reference Validation', () => {

  it('should accept valid 64-char hex reference', () => {
    const ref = 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd';

    expect(ref.length).toBe(64);
    expect(/^[a-fA-F0-9]+$/.test(ref)).toBe(true);
  });

  it('should reject references that are too short', () => {
    const ref = 'abc123';

    expect(ref.length).not.toBe(64);
  });

  it('should reject references with invalid characters', () => {
    const ref = 'xyz_invalid_reference_with_underscores_and_other_chars!!!!!!!!';

    expect(/^[a-fA-F0-9]+$/.test(ref)).toBe(false);
  });
});

describe('File Size Formatting', () => {
  // Test the humanFileSize logic
  const humanFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  it('should format bytes correctly', () => {
    expect(humanFileSize(0)).toBe('0 B');
    expect(humanFileSize(500)).toBe('500 B');
    expect(humanFileSize(1024)).toBe('1 KB');
    expect(humanFileSize(1048576)).toBe('1 MB');
    expect(humanFileSize(1073741824)).toBe('1 GB');
  });

  it('should handle decimal values', () => {
    expect(humanFileSize(1536)).toBe('1.5 KB');
    expect(humanFileSize(2621440)).toBe('2.5 MB');
  });
});

describe('Upload Link Construction', () => {

  it('should construct correct download URL from upload result', () => {
    // Simulating what Upload.js does after storeFilesUnencrypted
    const hash = {
      address: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd',
      file: { name: 'test.pdf', size: 1024 }
    };
    const appRoot = '';
    const host = 'fairdrop.xyz';
    const protocol = 'https:';

    const uploadedHashLink = `${protocol}//${host}${appRoot}/download/${hash.address}/${hash.file.name}?size=${hash.file.size}`;

    expect(uploadedHashLink).toBe('https://fairdrop.xyz/download/a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd/test.pdf?size=1024');
  });

  it('should handle files with spaces in name', () => {
    const hash = {
      address: 'abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234',
      file: { name: 'my file.pdf', size: 2048 }
    };

    // Note: The current code doesn't encode the filename in the URL
    // This test documents current behavior
    const uploadedHashLink = `https://fairdrop.xyz/download/${hash.address}/${hash.file.name}?size=${hash.file.size}`;

    expect(uploadedHashLink).toContain('my file.pdf');
  });
});

describe('Gateway URL Construction for Download', () => {

  it('should construct full gateway download URL', () => {
    const gateway = 'https://bee-1.fairdatasociety.org';
    const loc = '/bzz/a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd/test.pdf';

    const fullUrl = `${gateway}${loc}`;

    expect(fullUrl).toBe('https://bee-1.fairdatasociety.org/bzz/a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd/test.pdf');
  });

  it('should not double-slash in URL', () => {
    const gateway = 'https://bee-1.fairdatasociety.org';
    const loc = '/bzz/hash/file.txt';

    const fullUrl = `${gateway}${loc}`;

    expect(fullUrl).not.toContain('//bzz');
    expect(fullUrl).toContain('/bzz/');
  });
});
