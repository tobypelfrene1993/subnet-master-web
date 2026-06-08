import type { ReactNode } from 'react';

type StatGridProps = {
  stats: Array<{ label: string; value: ReactNode; hint?: string }>;
};

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-line/70 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
          <p className="mt-2 break-words font-mono text-lg font-semibold text-white">{stat.value}</p>
          {stat.hint ? <p className="mt-2 text-xs text-slate-400">{stat.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
