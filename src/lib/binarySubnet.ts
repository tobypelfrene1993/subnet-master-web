import {
  calculateSubnet,
  cidrToSubnetMask,
  cidrToMaskInt,
  getTotalAddresses,
  getUsableHosts,
  getBroadcastAddressInt,
  getNetworkAddressInt,
  intToIPv4,
  parseIPv4,
  validateCidr,
} from './subnet';

export type BinaryMaskBit = {
  bit: '0' | '1';
  type: 'network' | 'host';
  index: number;
};

export type BinaryVisualizer = {
  cidr: number;
  binaryMask: string;
  networkBits: number;
  hostBits: number;
  totalAddresses: number;
  usableHosts: number;
  visualLine: string;
};

export type BinaryBoardBit = {
  bit: '0' | '1';
  index: number;
  type: 'network' | 'host';
};

export type BinaryBoardExplanation = {
  inputIp: string;
  cidr: number;
  decimalOctets: number[];
  ipBinaryOctets: string[];
  subnetMask: string;
  subnetMaskOctets: number[];
  maskBinaryOctets: string[];
  networkBits: number;
  hostBits: number;
  ipBits: BinaryBoardBit[];
  maskBits: BinaryBoardBit[];
  networkBinaryOctets: string[];
  broadcastBinaryOctets: string[];
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
};

export function decimalOctetToBinary(octet: number): string {
  if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
    throw new Error('Decimal octet must be a whole number between 0 and 255.');
  }

  return octet.toString(2).padStart(8, '0');
}

export function binaryOctetToDecimal(binary: string): number {
  if (!/^[01]{8}$/.test(binary)) {
    throw new Error('Binary octet must contain exactly eight 1s or 0s.');
  }

  return Number.parseInt(binary, 2);
}

export function ipv4ToDecimalOctets(ip: string): number[] {
  const normalized = intToIPv4(parseIPv4(ip));
  return normalized.split('.').map(Number);
}

export function ipv4ToBinaryOctets(ip: string): string[] {
  return ipv4ToDecimalOctets(ip).map(decimalOctetToBinary);
}

export function ipv4ToBinary(ip: string): string {
  return ipv4ToBinaryOctets(ip).join('.');
}

export function cidrToBinaryMaskBits(cidrInput: number): BinaryMaskBit[] {
  const cidr = validateCidr(cidrInput, 0, 32);

  return Array.from({ length: 32 }, (_, index) => ({
    bit: index < cidr ? '1' : '0',
    type: index < cidr ? 'network' : 'host',
    index,
  }));
}

export function formatBinaryBits(bits: Pick<BinaryMaskBit, 'bit'>[]): string {
  return bits
    .map((item) => item.bit)
    .join('')
    .match(/.{1,8}/g)
    ?.join('.') ?? '';
}

export function cidrToBinaryMask(cidrInput: number): string {
  return formatBinaryBits(cidrToBinaryMaskBits(cidrInput));
}

export function calculateBinaryAnd(ip: string, cidrInput: number) {
  const cidr = validateCidr(cidrInput, 0, 32);
  const ipInt = parseIPv4(ip);
  const maskInt = cidrToMaskInt(cidr);
  const networkInt = (ipInt & maskInt) >>> 0;

  return {
    inputIp: intToIPv4(ipInt),
    cidr,
    subnetMask: cidrToSubnetMask(cidr),
    ipBinary: ipv4ToBinary(intToIPv4(ipInt)),
    maskBinary: cidrToBinaryMask(cidr),
    andBinary: ipv4ToBinary(intToIPv4(networkInt)),
    resultIp: intToIPv4(networkInt),
  };
}

function toTypedBits(binary: string, cidr: number): BinaryBoardBit[] {
  return binary.replace(/\./g, '').split('').map((bit, index) => ({
    bit: bit as '0' | '1',
    index,
    type: index < cidr ? 'network' : 'host',
  }));
}

function binaryOctetsFromInt(value: number): string[] {
  return intToIPv4(value).split('.').map((octet) => decimalOctetToBinary(Number(octet)));
}

export function getBinaryBoardExplanation(ip: string, cidrInput: number): BinaryBoardExplanation {
  const cidr = validateCidr(cidrInput, 1, 32);
  const summary = calculateSubnet(ip, cidr);
  const ipInt = parseIPv4(ip);
  const networkInt = getNetworkAddressInt(ipInt, cidr);
  const broadcastInt = getBroadcastAddressInt(ipInt, cidr);
  const ipBinaryOctets = ipv4ToBinaryOctets(summary.inputIp);
  const maskBinary = cidrToBinaryMask(cidr);

  return {
    inputIp: summary.inputIp,
    cidr,
    decimalOctets: summary.inputIp.split('.').map(Number),
    ipBinaryOctets,
    subnetMask: summary.subnetMask,
    subnetMaskOctets: summary.subnetMask.split('.').map(Number),
    maskBinaryOctets: maskBinary.split('.'),
    networkBits: cidr,
    hostBits: 32 - cidr,
    ipBits: toTypedBits(ipBinaryOctets.join('.'), cidr),
    maskBits: toTypedBits(maskBinary, cidr),
    networkBinaryOctets: binaryOctetsFromInt(networkInt),
    broadcastBinaryOctets: binaryOctetsFromInt(broadcastInt),
    networkAddress: summary.networkAddress,
    broadcastAddress: summary.broadcastAddress,
    firstUsableHost: summary.firstUsableHost,
    lastUsableHost: summary.lastUsableHost,
  };
}

export function getBinaryVisualizer(cidrInput: number): BinaryVisualizer {
  const cidr = validateCidr(cidrInput, 0, 32);
  const hostBits = 32 - cidr;

  return {
    cidr,
    binaryMask: cidrToBinaryMask(cidr),
    networkBits: cidr,
    hostBits,
    totalAddresses: getTotalAddresses(cidr),
    usableHosts: getUsableHosts(cidr),
    visualLine: `${'|'.repeat(cidr)}${'-'.repeat(hostBits)}`,
  };
}
