import { useMemo, useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { Panel } from '../components/Panel';
import type { LearningMode } from '../lib/learning';
import { explainCidrChoice } from '../lib/learning';
import { getTotalAddresses, recommendCidrForHosts } from '../lib/subnet';
import { calculateVlsm, parseNetworkCidr } from '../lib/vlsm';
import type { VlsmInput } from '../types/subnet';

type VlsmWhiteboardProps = {
  mode: LearningMode;
};

const initialRows: VlsmInput[] = [
  { id: 'lan-a', name: 'LAN A', hosts: 50 },
  { id: 'lan-b', name: 'LAN B', hosts: 25 },
  { id: 'lan-c', name: 'LAN C', hosts: 10 },
  { id: 'wan', name: 'WAN', hosts: 2 },
];

export function VlsmWhiteboard({ mode }: VlsmWhiteboardProps) {
  const [baseNetwork, setBaseNetwork] = useState('192.168.1.0/24');
  const [rows, setRows] = useState<VlsmInput[]>(initialRows);

  const lesson = useMemo(() => {
    try {
      const sortedRows = [...rows]
        .filter((row) => row.name.trim() && row.hosts > 0)
        .sort((a, b) => b.hosts - a.hosts || a.name.localeCompare(b.name));
      const allocations = calculateVlsm(baseNetwork, rows, 'optimized');
      const base = parseNetworkCidr(baseNetwork);
      const baseTotal = getTotalAddresses(base.cidr);

      return { sortedRows, allocations, baseTotal, error: null };
    } catch (error) {
      return {
        sortedRows: [],
        allocations: [],
        baseTotal: 0,
        error: error instanceof Error ? error.message : 'Could not build the VLSM whiteboard.',
      };
    }
  }, [baseNetwork, rows]);

  const updateRow = (id: string, patch: Partial<VlsmInput>) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const addRow = () => {
    setRows((current) => [...current, { id: crypto.randomUUID(), name: `Subnet ${current.length + 1}`, hosts: 10 }]);
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  let runningTotal = 0;

  return (
    <div className="space-y-6">
      <section className="classroom-board rounded-[2rem] border border-cyan/20 p-6 shadow-glow md:p-8">
        <p className="mb-3 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan">VLSM Whiteboard</p>
        <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">Plan VLSM like a teacher at the board.</h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">
          Start with host requirements, sort largest to smallest, choose the smallest fitting CIDR, and allocate one subnet at a time.
        </p>
      </section>

      <Panel title="Whiteboard inputs" eyebrow={mode === 'beginner' ? 'Explain every allocation' : 'Compact allocation plan'}>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.35fr]">
          <div>
            <FieldLabel term="VLSM">Base network</FieldLabel>
            <input value={baseNetwork} onChange={(event) => setBaseNetwork(event.target.value)} placeholder="192.168.1.0/24" />
          </div>
          <div className="flex items-end">
            <button type="button" className="secondary-button w-full" onClick={addRow}>Add subnet row</button>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
          <table>
            <thead>
              <tr>
                <th>Subnet name</th>
                <th>Hosts</th>
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
        <div className="mt-4"><ErrorBox message={lesson.error} /></div>
      </Panel>

      <div className="space-y-5">
        <Panel title="Step 1: Sort largest to smallest" eyebrow="Whiteboard step">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lesson.sortedRows.map((row, index) => (
              <div key={row.id} className="whiteboard-card p-4">
                <p className="font-mono text-sm font-black text-cyan">#{index + 1}</p>
                <p className="mt-2 text-xl font-black text-white">{row.name}</p>
                <p className="mt-1 font-mono text-2xl text-cyan-50">{row.hosts} hosts</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Step 2: Determine required subnet sizes" eyebrow="Why each CIDR is chosen">
          <div className="space-y-3">
            {lesson.sortedRows.map((row) => {
              const recommendation = recommendCidrForHosts(row.hosts);
              return (
                <article key={row.id} className="whiteboard-card p-4">
                  <div className="grid gap-3 md:grid-cols-[0.25fr_0.2fr_1fr] md:items-center">
                    <p className="text-xl font-black text-white">{row.name}</p>
                    <p className="font-mono text-3xl font-black text-cyan">/{recommendation.cidr}</p>
                    <p className="leading-7 text-slate-300">{explainCidrChoice(row.hosts)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>

        <Panel title="Step 3: Allocate subnets one by one" eyebrow="Address space">
          <div className="space-y-4">
            {lesson.allocations.map((allocation, index) => {
              runningTotal += allocation.totalAddresses;
              const remaining = Math.max(lesson.baseTotal - runningTotal, 0);
              return (
                <article key={`${allocation.id}-${allocation.networkAddress}`} className="whiteboard-card p-5">
                  <div className="grid gap-4 lg:grid-cols-[0.18fr_0.82fr]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan/35 bg-cyan/10 font-mono text-2xl font-black text-cyan">{index + 1}</div>
                    <div>
                      <h3 className="text-2xl font-black text-white">Allocate {allocation.name}</h3>
                      <p className="mt-2 leading-7 text-slate-300">
                        {allocation.requiredHosts} hosts use /{allocation.cidr}, which reserves {allocation.totalAddresses} total addresses. This subnet receives {allocation.networkAddress} through {allocation.broadcast}.
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <span className="rounded-2xl border border-line bg-slate-950/60 p-3 font-mono text-cyan">Network {allocation.networkAddress}</span>
                        <span className="rounded-2xl border border-line bg-slate-950/60 p-3 font-mono text-cyan">Mask {allocation.subnetMask}</span>
                        <span className="rounded-2xl border border-line bg-slate-950/60 p-3 font-mono text-cyan">Broadcast {allocation.broadcast}</span>
                        <span className="rounded-2xl border border-line bg-slate-950/60 p-3 font-mono text-cyan">Remaining {remaining}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>

        <Panel title="Step 4: Final addressing table" eyebrow="VLSM result">
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Hosts</th>
                  <th>CIDR</th>
                  <th>Mask</th>
                  <th>Network</th>
                  <th>First host</th>
                  <th>Last host</th>
                  <th>Broadcast</th>
                </tr>
              </thead>
              <tbody>
                {lesson.allocations.map((allocation) => (
                  <tr key={`${allocation.id}-${allocation.broadcast}`}>
                    <td className="font-semibold text-white">{allocation.name}</td>
                    <td>{allocation.requiredHosts}</td>
                    <td className="font-mono">/{allocation.cidr}</td>
                    <td className="font-mono">{allocation.subnetMask}</td>
                    <td className="font-mono">{allocation.networkAddress}</td>
                    <td className="font-mono">{allocation.firstHost}</td>
                    <td className="font-mono">{allocation.lastHost}</td>
                    <td className="font-mono">{allocation.broadcast}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
