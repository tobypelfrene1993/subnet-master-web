import { describe, expect, it } from 'vitest';
import { calculateAvailableSubnets } from '../lib/vlsm';

describe('Available subnets generation', () => {
  it('generates /26 blocks inside 192.168.1.0/24', () => {
    const subnets = calculateAvailableSubnets('192.168.1.0/24', 26);

    expect(subnets.map((subnet) => subnet.subnet)).toEqual([
      '192.168.1.0/26',
      '192.168.1.64/26',
      '192.168.1.128/26',
      '192.168.1.192/26',
    ]);
    expect(subnets[0]).toEqual(expect.objectContaining({
      networkAddress: '192.168.1.0',
      firstHost: '192.168.1.1',
      lastHost: '192.168.1.62',
      broadcastAddress: '192.168.1.63',
      usableHosts: 62,
    }));
  });

  it('rejects target CIDR values that are smaller than the base CIDR', () => {
    expect(() => calculateAvailableSubnets('192.168.1.0/24', 22)).toThrow(/greater than or equal to the base CIDR/i);
  });
});
