import type { VlsmAllocation } from '../types/subnet';

type SubnetBlocksProps = {
  allocations: VlsmAllocation[];
};

export function SubnetBlocks({ allocations }: SubnetBlocksProps) {
  if (allocations.length === 0) {
    return <p className="text-sm text-slate-400">Calculate VLSM or use the standalone visualizer to see subnet blocks here.</p>;
  }

  const total = allocations.reduce((sum, allocation) => sum + allocation.totalAddresses, 0);

  return (
    <div className="space-y-4">
      <div className="flex min-h-24 overflow-hidden rounded-2xl border border-line bg-slate-950/60">
        {allocations.map((allocation) => (
          <div
            key={`${allocation.id}-${allocation.networkAddress}`}
            className="min-w-24 border-r border-slate-900 bg-gradient-to-br from-cyan/40 to-blue-700/40 p-3"
            style={{ flexGrow: allocation.totalAddresses / total }}
          >
            <p className="truncate text-sm font-semibold text-white">{allocation.name}</p>
            <p className="font-mono text-xs text-cyan-100">/{allocation.cidr}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {allocations.map((allocation) => (
          <article key={allocation.id} className="rounded-2xl border border-line/80 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{allocation.name}</h3>
                <p className="font-mono text-sm text-cyan">{allocation.networkAddress}/{allocation.cidr}</p>
              </div>
              <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">
                {allocation.requiredHosts} needed
              </span>
            </div>
            <dl className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Host range</dt>
                <dd className="font-mono">{allocation.firstHost} - {allocation.lastHost}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Broadcast</dt>
                <dd className="font-mono">{allocation.broadcast}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Usable hosts</dt>
                <dd className="font-mono">{allocation.usableHosts}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Mask</dt>
                <dd className="font-mono">{allocation.subnetMask}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
