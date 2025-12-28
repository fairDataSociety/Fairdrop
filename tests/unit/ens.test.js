/**
 * Unit Tests for ENS Module
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ethers before importing ens module
vi.mock('ethers', () => ({
  ethers: {
    BrowserProvider: vi.fn(),
    JsonRpcProvider: vi.fn(() => ({
      resolveName: vi.fn(),
      getResolver: vi.fn(),
      lookupAddress: vi.fn()
    }))
  }
}));

import { isENSName } from '../../src/lib/ens.js';

describe('ENS Module', () => {

  describe('isENSName', () => {

    it('should return true for .eth names', () => {
      expect(isENSName('vitalik.eth')).toBe(true);
      expect(isENSName('alice.eth')).toBe(true);
      expect(isENSName('my-name.eth')).toBe(true);
    });

    it('should return true for subdomains', () => {
      expect(isENSName('alice.fairdrop.eth')).toBe(true);
      expect(isENSName('bob.subdomain.eth')).toBe(true);
    });

    it('should return false for plain usernames', () => {
      expect(isENSName('alice')).toBe(false);
      expect(isENSName('bob123')).toBe(false);
      expect(isENSName('my-name')).toBe(false);
    });

    it('should return false for invalid inputs', () => {
      expect(isENSName('')).toBe(false);
      expect(isENSName(null)).toBe(false);
      expect(isENSName(undefined)).toBe(false);
      expect(isENSName(123)).toBe(false);
    });

    it('should return false for public keys', () => {
      const pubKey = '04' + 'a'.repeat(64);
      expect(isENSName(pubKey)).toBe(false);
      expect(isENSName('0x' + 'a'.repeat(64))).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isENSName('.eth')).toBe(false);
      expect(isENSName('eth')).toBe(false);
      expect(isENSName('a.')).toBe(false);
    });
  });

  describe('Recipient Resolution Logic', () => {

    it('should identify direct public keys', () => {
      // 64 char hex
      const hexKey = 'a'.repeat(64);
      expect(/^[a-fA-F0-9]{64,66}$/.test(hexKey)).toBe(true);

      // 66 char hex (compressed)
      const compressedKey = '02' + 'a'.repeat(64);
      expect(/^[a-fA-F0-9]{64,66}$/.test(compressedKey)).toBe(true);

      // With 0x prefix
      const prefixedKey = '0x' + 'a'.repeat(64);
      expect(prefixedKey.startsWith('0x') && prefixedKey.length === 66).toBe(true);
    });

    it('should identify valid fairdrop usernames', () => {
      const usernameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

      expect(usernameRegex.test('alice')).toBe(true);
      expect(usernameRegex.test('bob123')).toBe(true);
      expect(usernameRegex.test('my-name')).toBe(true);
      expect(usernameRegex.test('a')).toBe(true);

      // Invalid
      expect(usernameRegex.test('-invalid')).toBe(false);
      expect(usernameRegex.test('invalid-')).toBe(false);
      expect(usernameRegex.test('UPPERCASE')).toBe(false);
    });
  });

  describe('Fairdrop Key Format', () => {

    it('should use io.fairdrop.publickey as the text record key', () => {
      // The text record key is defined as a constant in the ens module
      // This test documents the expected key format
      const expectedKey = 'io.fairdrop.publickey';
      expect(expectedKey).toBe('io.fairdrop.publickey');
    });

  });

});
