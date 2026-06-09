import { useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { Panel } from '../components/Panel';
import { StatGrid } from '../components/StatGrid';
import { calculateSubnet } from '../lib/subnet';
import type { SubnetSummary } from '../types/subnet';

function parseIpCidr(value: string): { ip: string; cidr: number } {
  const [ipPart, cidrPart, extra] = value.trim().split('/');

  if (!ipPart || !cidrPart || extra !== undefined) {
    throw new Error('Enter an IP/CIDR value, for example 192.168.1.10/24.');
  }

  return { ip: ipPart, cidr: Number(cidrPart) };
}

type FormulaStep = {
  label: string;
  formula: string;
  outcome: string;
  detail: string;
};

function getFormulaSteps(result: SubnetSummary): FormulaStep[] {
  const hostBits = 32 - result.cidr;
  const totalFormula = `2^(32 - ${result.cidr}) = 2^${hostBits}`;
  const usableFormula = result.cidr >= 31 ? 'uitzondering voor /31 en /32' : `${result.totalAddresses} - 2`;
  const firstHostFormula = result.cidr >= 31 ? 'netwerkadres is bruikbaar' : `${result.networkAddress} + 1`;
  const lastHostFormula = result.cidr >= 31 ? 'broadcastadres is bruikbaar' : `${result.broadcastAddress} - 1`;
  const blockFormula = result.cidr % 8 === 0 ? 'CIDR eindigt op een octetgrens' : `2^(8 - ${result.cidr % 8})`;

  return [
    {
      label: 'Totaal adressen',
      formula: totalFormula,
      outcome: result.totalAddresses.toLocaleString(),
      detail: 'IPv4 heeft 32 bits. De CIDR-prefix reserveert netwerkbits; de rest zijn hostbits.',
    },
    {
      label: 'Bruikbare hosts',
      formula: usableFormula,
      outcome: result.usableHosts.toLocaleString(),
      detail: result.cidr >= 31
        ? '/31 wordt gebruikt voor point-to-point links en /32 is exact een hostadres.'
        : 'Een adres is gereserveerd voor het netwerk en een voor broadcast.',
    },
    {
      label: 'Subnetmasker',
      formula: `${result.cidr} netwerkbits = 1, ${hostBits} hostbits = 0`,
      outcome: result.subnetMask,
      detail: 'Zet de 32 maskerbits daarna terug om naar vier decimale octetten.',
    },
    {
      label: 'Wildcardmasker',
      formula: `255.255.255.255 - ${result.subnetMask}`,
      outcome: result.wildcardMask,
      detail: 'Het wildcardmasker is het omgekeerde van het subnetmasker.',
    },
    {
      label: 'Netwerkadres',
      formula: `${result.inputIp} AND ${result.subnetMask}`,
      outcome: result.networkAddress,
      detail: 'Een bitwise AND behoudt de netwerkbits en zet de hostbits op nul.',
    },
    {
      label: 'Broadcastadres',
      formula: `${result.networkAddress} + ${result.totalAddresses} - 1`,
      outcome: result.broadcastAddress,
      detail: 'Het broadcastadres is het laatste adres binnen het subnetblok.',
    },
    {
      label: 'Hostbereik',
      formula: `${firstHostFormula} t/m ${lastHostFormula}`,
      outcome: `${result.firstUsableHost} - ${result.lastUsableHost}`,
      detail: 'Normale subnetten slaan netwerk en broadcast over; /31 en /32 houden hun speciale bruikbare bereik.',
    },
    {
      label: 'Blokgrootte',
      formula: blockFormula,
      outcome: String(result.blockSize),
      detail: 'De blokgrootte toont de sprong tussen subnet-netwerkadressen in het actieve octet.',
    },
  ];
}

export function IpCalculator() {
  const [ipCidr, setIpCidr] = useState('192.168.1.10/24');
  const [result, setResult] = useState<SubnetSummary | null>(() => calculateSubnet('192.168.1.10', 24));
  const [error, setError] = useState<string | null>(null);

  const calculate = (value: string) => {
    try {
      const parsed = parseIpCidr(value);
      setResult(calculateSubnet(parsed.ip, parsed.cidr));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Could not calculate this subnet.');
    }
  };

  const updateIpCidr = (value: string) => {
    setIpCidr(value);
    calculate(value);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
      <Panel title="Quick Subnet Calculator" eyebrow="IP/CIDR lookup" className="self-start">
        <div className="space-y-4">
          <div className="rounded-2xl border border-cyan/20 bg-cyan/10 p-4 text-sm leading-6 text-slate-300">
            Enter one IPv4/CIDR value and get the network ID, broadcast, host range, masks, usable hosts, and magic number immediately.
          </div>
          <div>
            <FieldLabel term="CIDR">IP/CIDR</FieldLabel>
            <input value={ipCidr} onChange={(event) => updateIpCidr(event.target.value)} placeholder="192.168.1.10/24" />
          </div>
          <button type="button" className="secondary-button w-full" onClick={() => updateIpCidr('192.168.1.10/24')}>Reset example</button>
          <ErrorBox message={error} />
        </div>
      </Panel>
      <Panel title="Results" eyebrow="Calculated immediately">
        {result ? (
          <div className="space-y-6">
            <StatGrid
              stats={[
                { label: 'Network address', value: result.networkAddress },
                { label: 'Broadcast address', value: result.broadcastAddress },
                { label: 'First usable host', value: result.firstUsableHost },
                { label: 'Last usable host', value: result.lastUsableHost },
                { label: 'Subnet mask', value: result.subnetMask },
                { label: 'Wildcard mask', value: result.wildcardMask },
                { label: 'Usable hosts', value: result.usableHosts.toLocaleString() },
                { label: 'Magic number', value: result.blockSize },
                { label: 'Total addresses', value: result.totalAddresses.toLocaleString() },
              ]}
            />
            <div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan">Formule-uitleg</p>
                  <h3 className="mt-1 text-xl font-bold text-white">Hoe komt hij aan deze IP-resultaten?</h3>
                </div>
                <p className="text-sm text-slate-400">Voorbeeld: {result.inputIp}/{result.cidr}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {getFormulaSteps(result).map((step) => (
                  <article key={step.label} className="rounded-2xl border border-line/70 bg-slate-950/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-white">{step.label}</h4>
                      <span className="rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1 font-mono text-xs text-cyan">{step.outcome}</span>
                    </div>
                    <p className="mt-3 rounded-xl bg-slate-900/80 px-3 py-2 font-mono text-sm text-cyan">{step.formula}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{step.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : <p className="text-slate-400">Enter a valid IPv4 address and CIDR to see results.</p>}
      </Panel>
    </div>
  );
}
