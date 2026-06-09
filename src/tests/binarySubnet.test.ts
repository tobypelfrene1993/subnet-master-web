import { describe, expect, it } from 'vitest';
import {
  binaryOctetToDecimal,
  calculateBinaryAnd,
  cidrToBinaryMask,
  decimalOctetToBinary,
  getBinaryBoardExplanation,
  getBinaryVisualizer,
  ipv4ToBinary,
  ipv4ToBinaryOctets,
} from '../lib/binarySubnet';

describe('binary subnetting calculations', () => {
  it('converts IPv4 addresses to binary octets', () => {
    expect(ipv4ToBinaryOctets('192.168.1.10')).toEqual(['11000000', '10101000', '00000001', '00001010']);
    expect(ipv4ToBinary('192.168.1.10')).toBe('11000000.10101000.00000001.00001010');
  });

  it('converts binary octets back to decimal', () => {
    expect(binaryOctetToDecimal('11000000')).toBe(192);
    expect(binaryOctetToDecimal('00001010')).toBe(10);
    expect(decimalOctetToBinary(255)).toBe('11111111');
  });

  it('converts CIDR prefixes to binary subnet masks', () => {
    expect(cidrToBinaryMask(24)).toBe('11111111.11111111.11111111.00000000');
    expect(cidrToBinaryMask(26)).toBe('11111111.11111111.11111111.11000000');
    expect(cidrToBinaryMask(30)).toBe('11111111.11111111.11111111.11111100');
  });

  it('calculates binary AND network addresses', () => {
    const result = calculateBinaryAnd('192.168.1.130', 26);

    expect(result.ipBinary).toBe('11000000.10101000.00000001.10000010');
    expect(result.maskBinary).toBe('11111111.11111111.11111111.11000000');
    expect(result.andBinary).toBe('11000000.10101000.00000001.10000000');
    expect(result.resultIp).toBe('192.168.1.128');
  });

  it('calculates binary visualizer values', () => {
    const result = getBinaryVisualizer(26);

    expect(result.networkBits).toBe(26);
    expect(result.hostBits).toBe(6);
    expect(result.totalAddresses).toBe(64);
    expect(result.usableHosts).toBe(62);
    expect(result.visualLine).toBe('||||||||||||||||||||||||||------');
  });

  it('builds the binary board explanation for 138.25.47.69/13', () => {
    const result = getBinaryBoardExplanation('138.25.47.69', 13);

    expect(result.decimalOctets).toEqual([138, 25, 47, 69]);
    expect(result.ipBinaryOctets).toEqual(['10001010', '00011001', '00101111', '01000101']);
    expect(result.subnetMask).toBe('255.248.0.0');
    expect(result.maskBinaryOctets).toEqual(['11111111', '11111000', '00000000', '00000000']);
    expect(result.networkBits).toBe(13);
    expect(result.hostBits).toBe(19);
    expect(result.networkBinaryOctets).toEqual(['10001010', '00011000', '00000000', '00000000']);
    expect(result.networkAddress).toBe('138.24.0.0');
    expect(result.broadcastBinaryOctets).toEqual(['10001010', '00011111', '11111111', '11111111']);
    expect(result.broadcastAddress).toBe('138.31.255.255');
    expect(result.firstUsableHost).toBe('138.24.0.1');
    expect(result.lastUsableHost).toBe('138.31.255.254');
  });
});
