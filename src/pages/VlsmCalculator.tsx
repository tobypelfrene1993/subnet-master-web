import { useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { InfoTooltip } from '../components/InfoTooltip';
import { Panel } from '../components/Panel';
import { calculateVlsmPlan } from '../lib/vlsm';
import type { VlsmAllocation, VlsmInput, VlsmOrder, VlsmUnusedRange } from '../types/subnet';

const initialRows: VlsmInput[] = [
  { id: 'lan-a', name: 'LAN A', hosts: 50 },
  { id: 'lan-b', name: 'LAN B', hosts: 25 },
  { id: 'wan', name: 'WAN Link', hosts: 2 },
];

function getVlsmFormula(result: VlsmAllocation): string {
  const neededAddresses = result.requiredHosts === 1 ? 1 : result.requiredHosts + 2;
  const hostBits = 32 - result.cidr;
  return `${result.requiredHosts} hosts -> ${neededAddresses} benodigde adressen -> volgende macht van 2 is ${result.totalAddresses} -> 32 - ${hostBits} hostbits = /${result.cidr}`;
}

type VlsmCalculatorProps = {
  onResults: (results: VlsmAllocation[]) => void;
  onOpenVisual: () => void;
};

export function VlsmCalculator({ onResults, onOpenVisual }: VlsmCalculatorProps) {
  const [baseNetwork, setBaseNetwork] = useState('192.168.1.0/24');
  const [rows, setRows] = useState<VlsmInput[]>(initialRows);
  const [order, setOrder] = useState<VlsmOrder>('optimized');
  const [results, setResults] = useState<VlsmAllocation[]>([]);
  const [unusedRanges, setUnusedRanges] = useState<VlsmUnusedRange[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateRow = (id: string, patch: Partial<VlsmInput>) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const addRow = () => {
    setRows((current) => [...current, { id: crypto.randomUUID(), name: `Subnet ${current.length + 1}`, hosts: 10 }]);
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  const calculate = () => {
    try {
      const plan = calculateVlsmPlan(baseNetwork, rows, order);
      setResults(plan.allocations);
      setUnusedRanges(plan.unusedRanges);
      onResults(plan.allocations);
      setError(null);
    } catch (err) {
      setResults([]);
      setUnusedRanges([]);
      onResults([]);
      setError(err instanceof Error ? err.message : 'Could not calculate VLSM.');
    }
  };

  return (
    <div className="space-y-6">
      <Panel title="VLSM Designer" eyebrow="Address planner">
        <div className="mb-5 rounded-2xl border border-cyan/20 bg-cyan/10 p-4 text-sm leading-6 text-slate-300">
          Enter a base network and the host groups you need. Optimized mode places the largest networks first and returns a practical non-overlapping address plan.
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.6fr_0.6fr]">
          <div>
            <FieldLabel term="VLSM">Base network</FieldLabel>
            <input value={baseNetwork} onChange={(event) => setBaseNetwork(event.target.value)} placeholder="192.168.1.0/24" />
          </div>
          <div>
            <FieldLabel>Order option</FieldLabel>
            <select value={order} onChange={(event) => setOrder(event.target.value as VlsmOrder)}>
              <option value="optimized">Optimized largest first</option>
              <option value="original">Original input order</option>
              <option value="random">Random display order</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" className="primary-button w-full" onClick={calculate}>Design subnet plan</button>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
          <table>
            <thead className="bg-slate-950/70">
              <tr>
                <th>Subnet name</th>
                <th>Required hosts</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><input value={row.name} onChange={(event) => updateRow(row.id, { name: event.target.value })} /></td>
                  <td><input type="number" min="1" value={row.hosts} onChange={(event) => updateRow(row.id, { hosts: Number(event.target.value) })} /></td>
                  <td className="w-28"><button type="button" className="danger-button" onClick={() => removeRow(row.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="secondary-button" onClick={addRow}>Add subnet row</button>
          {results.length > 0 ? <button type="button" className="secondary-button" onClick={onOpenVisual}>Open visual network view</button> : null}
        </div>
        <div className="mt-4"><ErrorBox message={error} /></div>
      </Panel>

      <Panel title="Recommended subnet plan" eyebrow="Non-overlapping allocations">
        <p className="mb-4 text-sm text-slate-400">
          Results are allocated as real subnet ranges. Random order only changes display order, not the allocation math.
          <InfoTooltip term="Block size" />
        </p>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table>
            <thead className="bg-slate-950/70">
              <tr>
                <th>Subnet name</th>
                <th>Required hosts</th>
                <th>CIDR</th>
                <th>Subnet mask</th>
                <th>Network address</th>
                <th>First host</th>
                <th>Last host</th>
                <th>Broadcast</th>
                <th>Usable hosts</th>
                <th>Formula</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={`${result.id}-${result.networkAddress}`}>
                  <td className="font-semibold text-white">{result.name}</td>
                  <td>{result.requiredHosts}</td>
                  <td className="font-mono">/{result.cidr}</td>
                  <td className="font-mono">{result.subnetMask}</td>
                  <td className="font-mono">{result.networkAddress}</td>
                  <td className="font-mono">{result.firstHost}</td>
                  <td className="font-mono">{result.lastHost}</td>
                  <td className="font-mono">{result.broadcast}</td>
                  <td>{result.usableHosts}</td>
                  <td className="min-w-72 text-sm leading-6 text-slate-300">{getVlsmFormula(result)}</td>
                </tr>
              ))}
              {results.length === 0 ? <tr><td colSpan={10} className="text-slate-400">Run a calculation to populate the table.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Remaining unused address space" eyebrow="Unallocated range">
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table>
            <thead className="bg-slate-950/70">
              <tr>
                <th>Start address</th>
                <th>End address</th>
                <th>Total addresses</th>
              </tr>
            </thead>
            <tbody>
              {unusedRanges.map((range) => (
                <tr key={`${range.startAddress}-${range.endAddress}`}>
                  <td className="font-mono">{range.startAddress}</td>
                  <td className="font-mono">{range.endAddress}</td>
                  <td>{range.totalAddresses.toLocaleString()}</td>
                </tr>
              ))}
              {results.length === 0 ? <tr><td colSpan={3} className="text-slate-400">Run a design to see unused space.</td></tr> : null}
              {results.length > 0 && unusedRanges.length === 0 ? <tr><td colSpan={3} className="text-slate-400">No unused address space remains in the base network.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
