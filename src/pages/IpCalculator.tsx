import { useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { Panel } from '../components/Panel';
import { StatGrid } from '../components/StatGrid';
import { calculateSubnet } from '../lib/subnet';
import type { SubnetSummary } from '../types/subnet';

export function IpCalculator() {
  const [ip, setIp] = useState('192.168.1.10');
  const [cidr, setCidr] = useState('24');
  const [result, setResult] = useState<SubnetSummary | null>(() => calculateSubnet('192.168.1.10', 24));
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    try {
      setResult(calculateSubnet(ip, Number(cidr)));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Could not calculate this subnet.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Panel title="IP Calculator" eyebrow="Subnet math">
        <div className="space-y-4">
          <div>
            <FieldLabel term="IP address">IPv4 address</FieldLabel>
            <input value={ip} onChange={(event) => setIp(event.target.value)} placeholder="192.168.1.10" />
          </div>
          <div>
            <FieldLabel term="CIDR">CIDR prefix</FieldLabel>
            <input type="number" min="1" max="32" value={cidr} onChange={(event) => setCidr(event.target.value)} placeholder="24" />
          </div>
          <button type="button" className="primary-button w-full" onClick={calculate}>Calculate subnet</button>
          <ErrorBox message={error} />
        </div>
      </Panel>
      <Panel title="Results" eyebrow="Address plan">
        {result ? (
          <StatGrid
            stats={[
              { label: 'Network address', value: result.networkAddress },
              { label: 'Broadcast address', value: result.broadcastAddress },
              { label: 'First usable host', value: result.firstUsableHost },
              { label: 'Last usable host', value: result.lastUsableHost },
              { label: 'Subnet mask', value: result.subnetMask },
              { label: 'Wildcard mask', value: result.wildcardMask },
              { label: 'Total addresses', value: result.totalAddresses.toLocaleString() },
              { label: 'Usable hosts', value: result.usableHosts.toLocaleString() },
              { label: 'Block size', value: result.blockSize },
            ]}
          />
        ) : <p className="text-slate-400">Enter a valid IPv4 address and CIDR to see results.</p>}
      </Panel>
    </div>
  );
}
