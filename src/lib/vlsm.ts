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
import type { AvailableSubnet, VlsmAllocation, VlsmInput, VlsmOrder, VlsmPlan, VlsmRequirementInput, VlsmUnusedRange } from '../types/subnet';

type ParsedNetwork = {
  networkInt: number;
  cidr: number;
  broadcastInt: number;
};

const MAX_AVAILABLE_SUBNETS = 4096;

function assertWholePositive(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new SubnetError(`${label} must be a whole number greater than 0.`);
  }

  return value;
}

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
    assertWholePositive(row.hosts, `Required hosts for ${row.name}`);
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

function calculateUnusedRanges(baseNetwork: string, allocations: VlsmAllocation[]): VlsmUnusedRange[] {
  const base = parseNetworkCidr(baseNetwork);
  const sorted = [...allocations].sort((a, b) => a.startInt - b.startInt);
  const unusedRanges: VlsmUnusedRange[] = [];
  let cursor = base.networkInt;

  for (const allocation of sorted) {
    if (cursor < allocation.startInt) {
      const endInt = allocation.startInt - 1;
      unusedRanges.push({
        startAddress: intToIPv4(cursor),
        endAddress: intToIPv4(endInt),
        totalAddresses: endInt - cursor + 1,
        startInt: cursor,
        endInt,
      });
    }

    cursor = allocation.endInt + 1;
  }

  if (cursor <= base.broadcastInt) {
    unusedRanges.push({
      startAddress: intToIPv4(cursor),
      endAddress: intToIPv4(base.broadcastInt),
      totalAddresses: base.broadcastInt - cursor + 1,
      startInt: cursor,
      endInt: base.broadcastInt,
    });
  }

  return unusedRanges;
}

export function calculateVlsmPlan(
  baseNetwork: string,
  rows: VlsmInput[],
  order: VlsmOrder,
  random: () => number = Math.random,
): VlsmPlan {
  const base = parseNetworkCidr(baseNetwork);
  const allocations = calculateVlsm(baseNetwork, rows, order, random);
  const totalRequiredHosts = allocations.reduce((sum, allocation) => sum + allocation.requiredHosts, 0);
  const totalAllocatedAddresses = allocations.reduce((sum, allocation) => sum + allocation.totalAddresses, 0);

  return {
    baseNetwork: `${intToIPv4(base.networkInt)}/${base.cidr}`,
    baseCidr: base.cidr,
    baseSubnetMask: cidrToSubnetMask(base.cidr),
    baseBroadcast: intToIPv4(base.broadcastInt),
    baseTotalAddresses: getTotalAddresses(base.cidr),
    allocations,
    unusedRanges: calculateUnusedRanges(baseNetwork, allocations),
    totalRequiredHosts,
    totalAllocatedAddresses,
    efficiencyPercent: totalAllocatedAddresses === 0 ? 0 : (totalRequiredHosts / totalAllocatedAddresses) * 100,
  };
}

function parseTextRequirementToken(token: string, index: number): VlsmRequirementInput {
  let value = token.trim().replace(/^[-*]\s*/, '');
  if (!value) {
    throw new SubnetError('Each host requirement must include a required host count.');
  }

  let quantity = 1;
  const quantityMatch = value.match(/\s+(?:x|qty|quantity)\s*(\d+)$/i);
  if (quantityMatch) {
    quantity = Number(quantityMatch[1]);
    value = value.slice(0, quantityMatch.index).trim();
  }

  const hostMatch = value.match(/^(.*?)(\d+)$/);
  if (!hostMatch) {
    throw new SubnetError(`Could not find a required host count in "${token.trim()}".`);
  }

  const hosts = Number(hostMatch[2]);
  const name = hostMatch[1].trim().replace(/[,:-]+$/, '').trim();

  assertWholePositive(hosts, 'Required hosts');
  assertWholePositive(quantity, 'Quantity');

  return {
    id: `text-${index + 1}`,
    name,
    hosts,
    quantity,
  };
}

export function parseVlsmTextRequirements(text: string): VlsmRequirementInput[] {
  const tokens = text
    .split(/[\n,]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    throw new SubnetError('Enter at least one host requirement, for example 100, 50, 30 or LAN A 100.');
  }

  return tokens.map(parseTextRequirementToken);
}

export function expandVlsmRequirementRows(rows: VlsmRequirementInput[]): VlsmInput[] {
  const expanded: VlsmInput[] = [];

  rows.forEach((row, rowIndex) => {
    const hosts = assertWholePositive(row.hosts, `Required hosts for ${row.name.trim() || `row ${rowIndex + 1}`}`);
    const quantity = assertWholePositive(row.quantity, `Quantity for ${row.name.trim() || `row ${rowIndex + 1}`}`);
    const baseName = row.name.trim();

    for (let offset = 0; offset < quantity; offset += 1) {
      expanded.push({
        id: quantity === 1 ? row.id : `${row.id}-${offset + 1}`,
        name: quantity === 1 || !baseName ? baseName : `${baseName} ${offset + 1}`,
        hosts,
      });
    }
  });

  if (expanded.length === 0) {
    throw new SubnetError('Add at least one subnet row before calculating VLSM.');
  }

  return expanded;
}

export function calculateVlsmAutoPlan(baseNetwork: string, rows: VlsmRequirementInput[]): VlsmPlan {
  return calculateVlsmPlan(baseNetwork, expandVlsmRequirementRows(rows), 'optimized');
}

export function calculateAvailableSubnets(baseNetwork: string, targetCidrInput: number): AvailableSubnet[] {
  const base = parseNetworkCidr(baseNetwork);
  const targetCidr = validateCidr(targetCidrInput, 1, 32);

  if (targetCidr < base.cidr) {
    throw new SubnetError('Target CIDR must be greater than or equal to the base CIDR. Example: /26 can fit inside /24, but /22 cannot.');
  }

  const blockSize = getTotalAddresses(targetCidr);
  const subnetCount = getTotalAddresses(base.cidr) / blockSize;

  if (subnetCount > MAX_AVAILABLE_SUBNETS) {
    throw new SubnetError(`This would create ${subnetCount.toLocaleString()} subnet rows. Use a smaller base network or a larger target CIDR.`);
  }

  const subnets: AvailableSubnet[] = [];

  for (let networkInt = base.networkInt; networkInt <= base.broadcastInt; networkInt += blockSize) {
    const broadcastInt = networkInt + blockSize - 1;
    subnets.push({
      subnet: `${intToIPv4(networkInt)}/${targetCidr}`,
      networkAddress: intToIPv4(networkInt),
      firstHost: intToIPv4(getFirstHostInt(networkInt, targetCidr)),
      lastHost: intToIPv4(getLastHostInt(broadcastInt, targetCidr)),
      broadcastAddress: intToIPv4(broadcastInt),
      usableHosts: getUsableHosts(targetCidr),
      totalAddresses: blockSize,
      startInt: networkInt,
      endInt: broadcastInt,
    });
  }

  return subnets;
}

export function allocationsOverlap(allocations: VlsmAllocation[]): boolean {
  const sorted = [...allocations].sort((a, b) => a.startInt - b.startInt);
  return sorted.some((allocation, index) => index > 0 && allocation.startInt <= sorted[index - 1].endInt);
}
