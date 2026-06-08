import type { SubnetSummary } from '../types/subnet';

export class SubnetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubnetError';
  }
}

export function parseIPv4(ip: string): number {
  const value = ip.trim();
  const parts = value.split('.');

  if (parts.length !== 4 || parts.some((part) => part === '')) {
    throw new SubnetError('Enter a valid IPv4 address with four octets, for example 192.168.1.10.');
  }

  const octets = parts.map((part) => {
    if (!/^\d+$/.test(part)) {
      throw new SubnetError('IPv4 octets must contain numbers only.');
    }

    const number = Number(part);
    if (number < 0 || number > 255) {
      throw new SubnetError('Each IPv4 octet must be between 0 and 255.');
    }

    return number;
  });

  return (
    ((octets[0] << 24) >>> 0) +
    ((octets[1] << 16) >>> 0) +
    ((octets[2] << 8) >>> 0) +
    octets[3]
  ) >>> 0;
}

export function intToIPv4(value: number): string {
  const unsigned = value >>> 0;
  return [
    (unsigned >>> 24) & 255,
    (unsigned >>> 16) & 255,
    (unsigned >>> 8) & 255,
    unsigned & 255,
  ].join('.');
}

export function validateCidr(cidr: number, min = 1, max = 32): number {
  if (!Number.isInteger(cidr) || cidr < min || cidr > max) {
    throw new SubnetError(`CIDR prefix must be between /${min} and /${max}.`);
  }

  return cidr;
}

export function cidrToMaskInt(cidr: number): number {
  validateCidr(cidr, 0, 32);
  if (cidr === 0) {
    return 0;
  }

  return (0xffffffff << (32 - cidr)) >>> 0;
}

export function cidrToSubnetMask(cidr: number): string {
  return intToIPv4(cidrToMaskInt(cidr));
}

export function cidrToWildcardMask(cidr: number): string {
  return intToIPv4((~cidrToMaskInt(cidr)) >>> 0);
}

export function getTotalAddresses(cidr: number): number {
  validateCidr(cidr, 0, 32);
  return 2 ** (32 - cidr);
}

export function getUsableHosts(cidr: number): number {
  const total = getTotalAddresses(cidr);
  if (cidr === 32) {
    return 1;
  }
  if (cidr === 31) {
    return 2;
  }

  return Math.max(total - 2, 0);
}

export function getBlockSize(cidr: number): number {
  validateCidr(cidr, 0, 32);
  const hostBitsInOctet = 8 - (cidr % 8);
  return cidr % 8 === 0 ? 1 : 2 ** hostBitsInOctet;
}

export function getNetworkAddressInt(ip: string | number, cidr: number): number {
  const ipInt = typeof ip === 'string' ? parseIPv4(ip) : ip >>> 0;
  return (ipInt & cidrToMaskInt(cidr)) >>> 0;
}

export function getBroadcastAddressInt(ip: string | number, cidr: number): number {
  const network = getNetworkAddressInt(ip, cidr);
  return (network + getTotalAddresses(cidr) - 1) >>> 0;
}

export function getFirstHostInt(network: number, cidr: number): number {
  if (cidr >= 31) {
    return network >>> 0;
  }

  return (network + 1) >>> 0;
}

export function getLastHostInt(broadcast: number, cidr: number): number {
  if (cidr >= 31) {
    return broadcast >>> 0;
  }

  return (broadcast - 1) >>> 0;
}

export function calculateSubnet(ip: string, cidrInput: number): SubnetSummary {
  const cidr = validateCidr(cidrInput, 1, 32);
  const ipInt = parseIPv4(ip);
  const network = getNetworkAddressInt(ipInt, cidr);
  const broadcast = getBroadcastAddressInt(ipInt, cidr);

  return {
    inputIp: intToIPv4(ipInt),
    cidr,
    networkAddress: intToIPv4(network),
    broadcastAddress: intToIPv4(broadcast),
    firstUsableHost: intToIPv4(getFirstHostInt(network, cidr)),
    lastUsableHost: intToIPv4(getLastHostInt(broadcast, cidr)),
    subnetMask: cidrToSubnetMask(cidr),
    wildcardMask: cidrToWildcardMask(cidr),
    totalAddresses: getTotalAddresses(cidr),
    usableHosts: getUsableHosts(cidr),
    blockSize: getBlockSize(cidr),
  };
}

export function recommendCidrForHosts(requiredHosts: number): SubnetSummary & { explanation: string } {
  if (!Number.isInteger(requiredHosts) || requiredHosts < 1) {
    throw new SubnetError('Required hosts must be a whole number greater than 0.');
  }

  const neededAddresses = requiredHosts === 1 ? 1 : requiredHosts + 2;
  const hostBits = Math.ceil(Math.log2(neededAddresses));
  const cidr = 32 - hostBits;
  const summary = calculateSubnet('0.0.0.0', cidr);

  return {
    ...summary,
    explanation: `${requiredHosts} hosts need ${neededAddresses} total addresses, so the next power-of-two block is ${summary.totalAddresses}. That makes /${cidr} the smallest fitting subnet.`,
  };
}
