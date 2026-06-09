import { useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { Panel } from '../components/Panel';
import { StatGrid } from '../components/StatGrid';
import { recommendCidrForHosts } from '../lib/subnet';

export function CidrWizard() {
  const [hosts, setHosts] = useState('50');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState(() => recommendCidrForHosts(50));

  const calculate = () => {
    try {
      setResult(recommendCidrForHosts(Number(hosts)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not recommend a CIDR block.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
      <Panel title="Subnet Finder" eyebrow="Smallest fitting CIDR">
        <div className="space-y-4">
          <div>
            <FieldLabel term="Usable hosts">Required number of hosts</FieldLabel>
            <input type="number" min="1" value={hosts} onChange={(event) => setHosts(event.target.value)} />
          </div>
          <button type="button" className="primary-button w-full" onClick={calculate}>Find smallest subnet</button>
          <ErrorBox message={error} />
        </div>
      </Panel>
      <Panel title="Recommendation" eyebrow="Smallest fitting block">
        <StatGrid
          stats={[
            { label: 'Recommended CIDR', value: `/${result.cidr}` },
            { label: 'Subnet mask', value: result.subnetMask },
            { label: 'Wildcard mask', value: result.wildcardMask },
            { label: 'Usable hosts', value: result.usableHosts.toLocaleString() },
            { label: 'Total addresses', value: result.totalAddresses.toLocaleString() },
            { label: 'Block size', value: result.blockSize },
          ]}
        />
        <p className="mt-5 rounded-2xl border border-cyan/30 bg-cyan/10 p-4 leading-7 text-cyan-50">{result.explanation}</p>
      </Panel>
    </div>
  );
}
