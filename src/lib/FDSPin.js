/**
 * FDSPin Adapter - Maps legacy pinning API to Swarm postage stamps
 *
 * In the modern Swarm model, "pinning" is handled by postage stamps.
 * Files remain available as long as the stamp has capacity.
 */

import { getAllStamps, getStamp, requestSponsoredStamp, isStampUsable } from './swarm/stamps';

class FDSPin {
  constructor(FDSAccount, OracleURL, PinningManagerAddress) {
    this.acc = FDSAccount;
    this.orac = OracleURL;
    this.pma = PinningManagerAddress;
  }

  /**
   * Create warrant (now requests a sponsored stamp)
   */
  async createWarrant(value) {
    try {
      const stamp = await requestSponsoredStamp();
      return stamp.batchId || '0x' + '0'.repeat(64);
    } catch (error) {
      console.warn('createWarrant: Could not get sponsored stamp:', error.message);
      // Return a placeholder - uploads will use local Bee stamp
      return '0x' + '0'.repeat(64);
    }
  }

  /**
   * Get balance (returns stamp capacity as balance proxy)
   */
  async getMyBalance() {
    try {
      const stamps = await getAllStamps();
      if (stamps.length === 0) {
        return 0;
      }

      // Sum up capacity of usable stamps
      const usableStamps = stamps.filter(s => s.usable);
      // Return arbitrary "balance" units based on stamps
      return usableStamps.length * 100000;
    } catch (error) {
      console.warn('getMyBalance error:', error.message);
      return 0;
    }
  }

  /**
   * Pin content (no-op in stamp model - stamps handle persistence)
   */
  async pin(hash) {
    // In the stamp model, content is automatically "pinned" when uploaded
    // with a valid stamp. This is a no-op for compatibility.
    console.log('FDSPin.pin: Content persisted via postage stamp:', hash);
    return { status: 'ok', hash };
  }

  /**
   * Unpin content (no-op in stamp model)
   */
  async unpin(hash) {
    // Cannot "unpin" in stamp model - content expires when stamp depletes
    console.log('FDSPin.unpin: No-op in stamp model:', hash);
    return { status: 'ok', hash };
  }
}

export default FDSPin;
