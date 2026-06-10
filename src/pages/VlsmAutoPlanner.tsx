import { useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { Panel } from '../components/Panel';
import { StatGrid } from '../components/StatGrid';
import { calculateVlsmAutoPlan, parseVlsmTextRequirements } from '../lib/vlsm';
import type { VlsmPlan, VlsmRequirementInput } from '../types/subnet';

type InputMode = 'rows' | 'text';

const exampleBaseNetwork = '193.168.50.0/24';
const exampleRows: VlsmRequirementInput[] = [
  { id: 'example-1', name: '', hosts: 100, quantity: 1 },
  { id: 'example-2', name: '', hosts: 50, quantity: 1 },
  { id: 'example-3', name: '', hosts: 30, quantity: 1 },
  { id: 'example-4', name: '', hosts: 10, quantity: 2 },
];
const exampleText = '100, 50, 30, 10, 10';

function createExamplePlan(): VlsmPlan {
  return calculateVlsmAutoPlan(exampleBaseNetwork, exampleRows);
}

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatPlanText(plan: VlsmPlan): string {
  const lines = [
    'VLSM Auto Planner',
    `Base network: ${plan.baseNetwork}`,
    `Base subnet mask: ${plan.baseSubnetMask}`,
    `Total required hosts: ${plan.totalRequiredHosts}`,
    `Total allocated addresses: ${plan.totalAllocatedAddresses}`,
    `Efficiency: ${plan.efficiencyPercent.toFixed(2)}%`,
    '',
    'Subnet plan:',
    ...plan.allocations.map((allocation, index) => [
      `Subnet ${index + 1}: ${allocation.networkAddress}/${allocation.cidr}${allocation.name ? ` (${allocation.name})` : ''}`,
      `  Required hosts: ${allocation.requiredHosts}`,
      `  Subnet mask: ${allocation.subnetMask}`,
      `  First host: ${allocation.firstHost}`,
      `  Last host: ${allocation.lastHost}`,
      `  Broadcast: ${allocation.broadcast}`,
      `  Usable hosts: ${allocation.usableHosts}`,
    ].join('\n')),
    '',
    'Remaining unused ranges:',
    ...(plan.unusedRanges.length > 0
      ? plan.unusedRanges.map((range) => `${range.startAddress} - ${range.endAddress} (${range.totalAddresses} addresses)`)
      : ['None']),
  ];

  return lines.join('\n');
}

export function VlsmAutoPlanner() {
  const [baseNetwork, setBaseNetwork] = useState(exampleBaseNetwork);
  const [inputMode, setInputMode] = useState<InputMode>('rows');
  const [rows, setRows] = useState<VlsmRequirementInput[]>(exampleRows);
  const [textInput, setTextInput] = useState(exampleText);
  const [plan, setPlan] = useState<VlsmPlan>(() => createExamplePlan());
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const updateRow = (id: string, patch: Partial<VlsmRequirementInput>) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const addRow = () => {
    setRows((current) => [...current, { id: crypto.randomUUID(), name: '', hosts: 10, quantity: 1 }]);
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  const resetExample = () => {
    setBaseNetwork(exampleBaseNetwork);
    setRows(exampleRows);
    setTextInput(exampleText);
    setInputMode('rows');
    setPlan(createExamplePlan());
    setError(null);
    setCopyMessage(null);
  };

  const calculate = () => {
    try {
      const requirements = inputMode === 'text' ? parseVlsmTextRequirements(textInput) : rows;
      setPlan(calculateVlsmAutoPlan(baseNetwork, requirements));
      setError(null);
      setCopyMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create a VLSM plan.');
      setCopyMessage(null);
    }
  };

  const copyPlan = async () => {
    try {
      await navigator.clipboard.writeText(formatPlanText(plan));
      setCopyMessage('Plan copied to clipboard.');
    } catch {
      setCopyMessage('Clipboard access was blocked by the browser.');
    }
  };

  const exportText = () => {
    const blob = new Blob([formatPlanText(plan)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'vlsm-auto-plan.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Panel title="VLSM Auto Planner" eyebrow="Automatic subnet plan">
        <div className="mb-5 rounded-2xl border border-cyan/20 bg-cyan/10 p-4 text-sm leading-6 text-slate-300">
          Enter one base network and the host groups you need. The planner sorts the largest needs first, chooses the smallest valid CIDR for each group, and allocates non-overlapping subnets from the start of the network.
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.55fr_0.55fr] lg:items-end">
          <div>
            <FieldLabel term="CIDR">Base network with CIDR</FieldLabel>
            <input value={baseNetwork} onChange={(event) => setBaseNetwork(event.target.value)} placeholder="192.168.1.0/24" />
          </div>
          <div>
            <FieldLabel>Input type</FieldLabel>
            <select value={inputMode} onChange={(event) => setInputMode(event.target.value as InputMode)}>
              <option value="rows">Rows with quantity</option>
              <option value="text">Text paste</option>
            </select>
          </div>
          <button type="button" className="primary-button w-full" onClick={calculate}>Create VLSM plan</button>
        </div>

        {inputMode === 'rows' ? (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
            <table>
              <thead className="bg-slate-950/70">
                <tr>
                  <th>Name</th>
                  <th>Required hosts</th>
                  <th>Quantity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td><input value={row.name} onChange={(event) => updateRow(row.id, { name: event.target.value })} placeholder="LAN A, Servers, Guest" /></td>
                    <td><input type="number" min="1" value={row.hosts} onChange={(event) => updateRow(row.id, { hosts: Number(event.target.value) })} /></td>
                    <td><input type="number" min="1" value={row.quantity} onChange={(event) => updateRow(row.id, { quantity: Number(event.target.value) })} /></td>
                    <td className="w-28"><button type="button" className="danger-button" onClick={() => removeRow(row.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5">
            <FieldLabel>Required host groups</FieldLabel>
            <textarea
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              rows={7}
              placeholder={`100, 50, 30, 10, 10\nLAN A 100\nServers 30\nWAN 10`}
            />
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Use simple counts separated by commas, or one named group per line. Quantity is also accepted, for example `WAN 2 x4`.
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="secondary-button" onClick={addRow}>Add subnet row</button>
          <button type="button" className="secondary-button" onClick={copyPlan}>Copy plan</button>
          <button type="button" className="secondary-button" onClick={exportText}>Export as text</button>
          <button type="button" className="secondary-button" onClick={resetExample}>Reset example</button>
        </div>
        <div className="mt-4 space-y-3">
          <ErrorBox message={error} />
          {copyMessage ? <div className="rounded-2xl border border-cyan/30 bg-cyan/10 p-4 text-sm text-cyan">{copyMessage}</div> : null}
        </div>
      </Panel>

      <Panel title="Plan summary" eyebrow="Capacity check">
        <StatGrid stats={[
          { label: 'Base network', value: plan.baseNetwork, hint: `Broadcast ${plan.baseBroadcast}` },
          { label: 'Base subnet mask', value: plan.baseSubnetMask },
          { label: 'Total required hosts', value: formatNumber(plan.totalRequiredHosts) },
          { label: 'Allocated addresses', value: formatNumber(plan.totalAllocatedAddresses), hint: `${formatNumber(plan.baseTotalAddresses)} addresses in the base network` },
          { label: 'Efficiency', value: `${plan.efficiencyPercent.toFixed(2)}%`, hint: 'Required hosts divided by allocated addresses' },
          { label: 'Unused ranges', value: plan.unusedRanges.length, hint: plan.unusedRanges.length === 0 ? 'No unused address space remains' : 'See ranges below' },
        ]} />
      </Panel>

      <Panel title="Clean Plan View" eyebrow="Readable output">
        <div className="grid gap-4 lg:grid-cols-2">
          {plan.allocations.map((allocation, index) => (
            <article key={`${allocation.id}-${allocation.networkAddress}`} className="rounded-3xl border border-line/80 bg-slate-950/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Subnet {index + 1}</p>
                  <h3 className="mt-2 text-xl font-black text-white">{allocation.name || `Subnet ${index + 1}`}</h3>
                </div>
                <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-mono text-sm font-bold text-cyan">{allocation.networkAddress}/{allocation.cidr}</span>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Required hosts</dt><dd className="font-semibold text-white">{allocation.requiredHosts.toLocaleString()}</dd></div>
                <div><dt className="text-slate-500">Subnet mask</dt><dd className="font-mono text-white">{allocation.subnetMask}</dd></div>
                <div><dt className="text-slate-500">First host</dt><dd className="font-mono text-white">{allocation.firstHost}</dd></div>
                <div><dt className="text-slate-500">Last host</dt><dd className="font-mono text-white">{allocation.lastHost}</dd></div>
                <div><dt className="text-slate-500">Broadcast</dt><dd className="font-mono text-white">{allocation.broadcast}</dd></div>
                <div><dt className="text-slate-500">Usable hosts</dt><dd className="font-semibold text-white">{allocation.usableHosts.toLocaleString()}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Table View" eyebrow="Addressing table">
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table>
            <thead className="bg-slate-950/70">
              <tr>
                <th>Name</th>
                <th>Required hosts</th>
                <th>CIDR</th>
                <th>Subnet mask</th>
                <th>Network ID</th>
                <th>First host</th>
                <th>Last host</th>
                <th>Broadcast</th>
                <th>Usable hosts</th>
              </tr>
            </thead>
            <tbody>
              {plan.allocations.map((allocation, index) => (
                <tr key={`${allocation.id}-${allocation.broadcast}`}>
                  <td className="font-semibold text-white">{allocation.name || `Subnet ${index + 1}`}</td>
                  <td>{allocation.requiredHosts.toLocaleString()}</td>
                  <td className="font-mono">/{allocation.cidr}</td>
                  <td className="font-mono">{allocation.subnetMask}</td>
                  <td className="font-mono">{allocation.networkAddress}</td>
                  <td className="font-mono">{allocation.firstHost}</td>
                  <td className="font-mono">{allocation.lastHost}</td>
                  <td className="font-mono">{allocation.broadcast}</td>
                  <td>{allocation.usableHosts.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Remaining unused address ranges" eyebrow="Unallocated space">
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
              {plan.unusedRanges.map((range) => (
                <tr key={`${range.startAddress}-${range.endAddress}`}>
                  <td className="font-mono">{range.startAddress}</td>
                  <td className="font-mono">{range.endAddress}</td>
                  <td>{range.totalAddresses.toLocaleString()}</td>
                </tr>
              ))}
              {plan.unusedRanges.length === 0 ? <tr><td colSpan={3} className="text-slate-400">No unused address space remains in the base network.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
