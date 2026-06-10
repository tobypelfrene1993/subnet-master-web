import { describe, expect, it } from 'vitest';
import { allocationsOverlap, calculateVlsm, calculateVlsmAutoPlan, calculateVlsmPlan, expandVlsmRequirementRows, parseVlsmTextRequirements } from '../lib/vlsm';

describe('VLSM allocation', () => {
  it('allocates optimized subnets largest first without overlap', () => {
    const results = calculateVlsm('192.168.1.0/24', [
      { id: 'a', name: 'A', hosts: 10 },
      { id: 'b', name: 'B', hosts: 50 },
      { id: 'c', name: 'C', hosts: 25 },
    ], 'optimized');

    expect(results.map((result) => result.name)).toEqual(['B', 'C', 'A']);
    expect(results[0].networkAddress).toBe('192.168.1.0');
    expect(results[0].cidr).toBe(26);
    expect(allocationsOverlap(results)).toBe(false);
  });

  it('keeps original input order while producing valid non-overlapping ranges', () => {
    const results = calculateVlsm('192.168.1.0/24', [
      { id: 'a', name: 'A', hosts: 10 },
      { id: 'b', name: 'B', hosts: 50 },
      { id: 'c', name: 'C', hosts: 25 },
    ], 'original');

    expect(results.map((result) => result.name)).toEqual(['A', 'B', 'C']);
    expect(allocationsOverlap(results)).toBe(false);
  });

  it('randomizes display only after valid allocation', () => {
    const results = calculateVlsm('192.168.1.0/24', [
      { id: 'a', name: 'A', hosts: 10 },
      { id: 'b', name: 'B', hosts: 20 },
    ], 'random', () => 0);

    expect(results.map((result) => result.name)).toEqual(['B', 'A']);
    expect(allocationsOverlap(results)).toBe(false);
  });

  it('throws a clear error when the base network is too small', () => {
    expect(() => calculateVlsm('192.168.1.0/30', [
      { id: 'a', name: 'Too large', hosts: 10 },
    ], 'optimized')).toThrow(/base network is too small/i);
  });

  it('reports remaining unused address space after VLSM allocation', () => {
    const plan = calculateVlsmPlan('192.168.1.0/24', [
      { id: 'a', name: 'A', hosts: 50 },
      { id: 'b', name: 'B', hosts: 25 },
    ], 'optimized');

    expect(plan.allocations.map((result) => `${result.networkAddress}/${result.cidr}`)).toEqual([
      '192.168.1.0/26',
      '192.168.1.64/27',
    ]);
    expect(plan.unusedRanges).toEqual([
      expect.objectContaining({
        startAddress: '192.168.1.96',
        endAddress: '192.168.1.255',
        totalAddresses: 160,
      }),
    ]);
  });

  it('auto-plans 193.168.50.0/24 for 100, 50, 30, 10, 10', () => {
    const plan = calculateVlsmAutoPlan('193.168.50.0/24', parseVlsmTextRequirements('100, 50, 30, 10, 10'));

    expect(plan.allocations.map((result) => `${result.networkAddress}/${result.cidr}`)).toEqual([
      '193.168.50.0/25',
      '193.168.50.128/26',
      '193.168.50.192/27',
      '193.168.50.224/28',
      '193.168.50.240/28',
    ]);
    expect(plan.baseSubnetMask).toBe('255.255.255.0');
    expect(plan.totalRequiredHosts).toBe(200);
    expect(plan.totalAllocatedAddresses).toBe(256);
    expect(plan.unusedRanges).toEqual([]);
  });

  it('auto-plans 172.10.0.0/18 for 5000, 2000, 2000', () => {
    const plan = calculateVlsmAutoPlan('172.10.0.0/18', parseVlsmTextRequirements('5000, 2000, 2000'));

    expect(plan.allocations.map((result) => `${result.networkAddress}/${result.cidr}`)).toEqual([
      '172.10.0.0/19',
      '172.10.32.0/21',
      '172.10.40.0/21',
    ]);
    expect(plan.unusedRanges).toEqual([
      expect.objectContaining({
        startAddress: '172.10.48.0',
        endAddress: '172.10.63.255',
        totalAddresses: 4096,
      }),
    ]);
  });

  it('parses named text input', () => {
    const rows = parseVlsmTextRequirements(`LAN A 100
LAN B 50
Servers 30
WAN 10
Guest 10`);

    expect(rows.map((row) => ({ name: row.name, hosts: row.hosts, quantity: row.quantity }))).toEqual([
      { name: 'LAN A', hosts: 100, quantity: 1 },
      { name: 'LAN B', hosts: 50, quantity: 1 },
      { name: 'Servers', hosts: 30, quantity: 1 },
      { name: 'WAN', hosts: 10, quantity: 1 },
      { name: 'Guest', hosts: 10, quantity: 1 },
    ]);
  });

  it('expands quantity rows before allocation', () => {
    const rows = expandVlsmRequirementRows([
      { id: 'lan', name: 'LAN', hosts: 25, quantity: 2 },
      { id: 'wan', name: '', hosts: 2, quantity: 3 },
    ]);

    expect(rows).toEqual([
      { id: 'lan-1', name: 'LAN 1', hosts: 25 },
      { id: 'lan-2', name: 'LAN 2', hosts: 25 },
      { id: 'wan-1', name: '', hosts: 2 },
      { id: 'wan-2', name: '', hosts: 2 },
      { id: 'wan-3', name: '', hosts: 2 },
    ]);
  });

  it('keeps auto-planned subnets non-overlapping', () => {
    const plan = calculateVlsmAutoPlan('10.20.0.0/20', parseVlsmTextRequirements('Ops 400, Voice 200, Guest 100, WAN 2 x4'));

    expect(allocationsOverlap(plan.allocations)).toBe(false);
  });
});
