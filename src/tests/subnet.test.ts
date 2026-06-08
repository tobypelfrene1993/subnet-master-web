import { describe, expect, it } from 'vitest';
import {
  calculateSubnet,
  cidrToSubnetMask,
  cidrToWildcardMask,
  intToIPv4,
  parseIPv4,
  recommendCidrForHosts,
} from '../lib/subnet';

describe('subnet core calculations', () => {
  it('parses IPv4 addresses to unsigned integers', () => {
    expect(intToIPv4(parseIPv4('192.168.1.10'))).toBe('192.168.1.10');
    expect(() => parseIPv4('192.168.1.300')).toThrow(/between 0 and 255/);
  });

  it('converts CIDR to subnet masks', () => {
    expect(cidrToSubnetMask(24)).toBe('255.255.255.0');
    expect(cidrToSubnetMask(26)).toBe('255.255.255.192');
  });

  it('converts CIDR to wildcard masks', () => {
    expect(cidrToWildcardMask(24)).toBe('0.0.0.255');
    expect(cidrToWildcardMask(26)).toBe('0.0.0.63');
  });

  it('calculates network and broadcast addresses', () => {
    const result = calculateSubnet('192.168.1.130', 26);
    expect(result.networkAddress).toBe('192.168.1.128');
    expect(result.broadcastAddress).toBe('192.168.1.191');
  });

  it('calculates first and last usable hosts', () => {
    const result = calculateSubnet('10.10.8.77', 22);
    expect(result.firstUsableHost).toBe('10.10.8.1');
    expect(result.lastUsableHost).toBe('10.10.11.254');
  });

  it('calculates usable host count and block size', () => {
    const result = calculateSubnet('172.16.5.9', 28);
    expect(result.usableHosts).toBe(14);
    expect(result.blockSize).toBe(16);
  });

  it('recommends /26 for 50 hosts', () => {
    const result = recommendCidrForHosts(50);
    expect(result.cidr).toBe(26);
    expect(result.usableHosts).toBe(62);
    expect(result.totalAddresses).toBe(64);
  });
});
