import { describe, expect, it } from 'vitest';
import { allocationsOverlap, calculateVlsm } from '../lib/vlsm';

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
});
