import { useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { Panel } from '../components/Panel';
import { calculateAvailableSubnets } from '../lib/vlsm';
import type { AvailableSubnet } from '../types/subnet';

function parseTargetCidr(value: string): number {
  const normalized = value.trim().replace(/^\//, '');
  return Number(normalized);
}

export function AvailableSubnets() {
  const [baseNetwork, setBaseNetwork] = useState('192.168.1.0/24');
  const [targetCidr, setTargetCidr] = useState('/26');
  const [results, setResults] = useState<AvailableSubnet[]>(() => calculateAvailableSubnets('192.168.1.0/24', 26));
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    try {
      setResults(calculateAvailableSubnets(baseNetwork, parseTargetCidr(targetCidr)));
      setError(null);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : 'Could not generate available subnets.');
    }
  };

  return (
    <div className="space-y-6">
      <Panel title="Available Subnets" eyebrow="Subnet blocks inside a base network">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.6fr_0.5fr] lg:items-end">
          <div>
            <FieldLabel term="CIDR">Base network</FieldLabel>
            <input value={baseNetwork} onChange={(event) => setBaseNetwork(event.target.value)} placeholder="192.168.1.0/24" />
          </div>
          <div>
            <FieldLabel term="CIDR">Target subnet CIDR</FieldLabel>
            <input value={targetCidr} onChange={(event) => setTargetCidr(event.target.value)} placeholder="/26" />
          </div>
          <button type="button" className="primary-button w-full" onClick={calculate}>Show subnets</button>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Example: `/26` inside `192.168.1.0/24` returns four usable subnet blocks: `.0`, `.64`, `.128`, and `.192`.
        </p>
        <div className="mt-4"><ErrorBox message={error} /></div>
      </Panel>

      <Panel title="Subnet blocks" eyebrow={`${results.length} result${results.length === 1 ? '' : 's'}`}>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table>
            <thead className="bg-slate-950/70">
              <tr>
                <th>Subnet</th>
                <th>Network ID</th>
                <th>First host</th>
                <th>Last host</th>
                <th>Broadcast</th>
                <th>Usable hosts</th>
              </tr>
            </thead>
            <tbody>
              {results.map((subnet) => (
                <tr key={subnet.subnet}>
                  <td className="font-mono font-semibold text-white">{subnet.subnet}</td>
                  <td className="font-mono">{subnet.networkAddress}</td>
                  <td className="font-mono">{subnet.firstHost}</td>
                  <td className="font-mono">{subnet.lastHost}</td>
                  <td className="font-mono">{subnet.broadcastAddress}</td>
                  <td>{subnet.usableHosts.toLocaleString()}</td>
                </tr>
              ))}
              {results.length === 0 ? <tr><td colSpan={6} className="text-slate-400">Enter a valid base network and target CIDR to see available subnet blocks.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
