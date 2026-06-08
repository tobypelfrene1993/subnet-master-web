import {
  SubnetError,
  cidrToSubnetMask,
  getBroadcastAddressInt,
  getFirstHostInt,
  getLastHostInt,
  getNetworkAddressInt,
  getTotalAddresses,
  getUsableHosts,
  intToIPv4,
  parseIPv4,
  recommendCidrForHosts,
  validateCidr,
} from './subnet';
import type { VlsmAllocation, VlsmInput, VlsmOrder } from '../types/subnet';

type ParsedNetwork = {
  networkInt: number;
  cidr: number;
  broadcastInt: number;
};

export function parseNetworkCidr(value: string): ParsedNetwork {
  const [ipPart, cidrPart, extra] = value.trim().split('/');
  if (!ipPart || !cidrPart || extra !== undefined) {
    throw new SubnetError('Enter the base network in CIDR format, for example 192.168.1.0/24.');
  }

  const cidr = validateCidr(Number(cidrPart), 1, 32);
  const ipInt = parseIPv4(ipPart);
  const networkInt = getNetworkAddressInt(ipInt, cidr);

  return {
    networkInt,
    cidr,
    broadcastInt: getBroadcastAddressInt(networkInt, cidr),
  };
}

function alignToBlock(value: number, blockSize: number): number {
  return Math.ceil(value / blockSize) * blockSize;
}

function stableShuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function calculateVlsm(
  baseNetwork: string,
  rows: VlsmInput[],
  order: VlsmOrder,
  random: () => number = Math.random,
): VlsmAllocation[] {
  const base = parseNetworkCidr(baseNetwork);
  const usableRows = rows
    .map((row, index) => ({ ...row, name: row.name.trim() || `Subnet ${index + 1}`, index }))
    .filter((row) => row.name || row.hosts > 0);

  if (usableRows.length === 0) {
    throw new SubnetError('Add at least one subnet row before calculating VLSM.');
  }

  for (const row of usableRows) {
    if (!Number.isInteger(row.hosts) || row.hosts < 1) {
      throw new SubnetError(`Required hosts for ${row.name} must be a whole number greater than 0.`);
    }
  }

  const allocationOrder = order === 'optimized'
    ? [...usableRows].sort((a, b) => b.hosts - a.hosts || a.index - b.index)
    : [...usableRows].sort((a, b) => a.index - b.index);

  let cursor = base.networkInt;
  const allocations: VlsmAllocation[] = [];

  for (const row of allocationOrder) {
    const recommendation = recommendCidrForHosts(row.hosts);
    const totalAddresses = getTotalAddresses(recommendation.cidr);
    const networkInt = alignToBlock(cursor, totalAddresses) >>> 0;
    const broadcastInt = (networkInt + totalAddresses - 1) >>> 0;

    if (broadcastInt > base.broadcastInt || networkInt < base.networkInt) {
      throw new SubnetError('The base network is too small for the requested VLSM subnets. Try a larger base network or fewer hosts.');
    }

    allocations.push({
      id: row.id,
      name: row.name,
      requiredHosts: row.hosts,
      cidr: recommendation.cidr,
      subnetMask: cidrToSubnetMask(recommendation.cidr),
      networkAddress: intToIPv4(networkInt),
      firstHost: intToIPv4(getFirstHostInt(networkInt, recommendation.cidr)),
      lastHost: intToIPv4(getLastHostInt(broadcastInt, recommendation.cidr)),
      broadcast: intToIPv4(broadcastInt),
      usableHosts: getUsableHosts(recommendation.cidr),
      totalAddresses,
      startInt: networkInt,
      endInt: broadcastInt,
    });

    cursor = (broadcastInt + 1) >>> 0;
  }

  if (order === 'random') {
    return stableShuffle(allocations, random);
  }

  return allocations;
}

export function allocationsOverlap(allocations: VlsmAllocation[]): boolean {
  const sorted = [...allocations].sort((a, b) => a.startInt - b.startInt);
  return sorted.some((allocation, index) => index > 0 && allocation.startInt <= sorted[index - 1].endInt);
}
