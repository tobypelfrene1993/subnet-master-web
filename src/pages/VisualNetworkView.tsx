import { useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { Panel } from '../components/Panel';
import { StatGrid } from '../components/StatGrid';
import { SubnetBlocks } from '../components/SubnetBlocks';
import { calculateSubnet } from '../lib/subnet';
import type { SubnetSummary, VlsmAllocation } from '../types/subnet';

type VisualNetworkViewProps = {
  vlsmResults: VlsmAllocation[];
};

export function VisualNetworkView({ vlsmResults }: VisualNetworkViewProps) {
  const [ip, setIp] = useState('192.168.1.0');
  const [cidr, setCidr] = useState('24');
  const [standalone, setStandalone] = useState<SubnetSummary | null>(() => calculateSubnet('192.168.1.0', 24));
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    try {
      setStandalone(calculateSubnet(ip, Number(cidr)));
      setError(null);
    } catch (err) {
      setStandalone(null);
      setError(err instanceof Error ? err.message : 'Could not visualize this network.');
    }
  };

  return (
    <div className="space-y-6">
      <Panel title="Visual Network View" eyebrow="Subnet blocks">
        <SubnetBlocks allocations={vlsmResults} />
      </Panel>
      <Panel title="Standalone visualizer" eyebrow="Single subnet block">
        <div className="grid gap-4 md:grid-cols-[1fr_0.6fr_auto]">
          <div>
            <FieldLabel term="IP address">Network or host IP</FieldLabel>
            <input value={ip} onChange={(event) => setIp(event.target.value)} />
          </div>
          <div>
            <FieldLabel term="CIDR">CIDR</FieldLabel>
            <input type="number" min="1" max="32" value={cidr} onChange={(event) => setCidr(event.target.value)} />
          </div>
          <div className="flex items-end"><button type="button" className="primary-button" onClick={calculate}>Visualize</button></div>
        </div>
        <div className="mt-4"><ErrorBox message={error} /></div>
        {standalone ? (
          <div className="mt-5 space-y-5">
            <div className="overflow-hidden rounded-2xl border border-cyan/30 bg-slate-950/70">
              <div className="bg-gradient-to-r from-cyan/70 via-blue-600/60 to-cyan/20 p-5">
                <p className="font-mono text-lg font-bold text-white">{standalone.networkAddress}/{standalone.cidr}</p>
                <p className="mt-1 text-sm text-cyan-50">{standalone.firstUsableHost} - {standalone.lastUsableHost} | Broadcast {standalone.broadcastAddress}</p>
              </div>
            </div>
            <StatGrid
              stats={[
                { label: 'Network', value: standalone.networkAddress },
                { label: 'CIDR', value: `/${standalone.cidr}` },
                { label: 'Broadcast', value: standalone.broadcastAddress },
                { label: 'First host', value: standalone.firstUsableHost },
                { label: 'Last host', value: standalone.lastUsableHost },
                { label: 'Usable hosts', value: standalone.usableHosts.toLocaleString() },
              ]}
            />
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
