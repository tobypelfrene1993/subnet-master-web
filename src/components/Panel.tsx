import type { ReactNode } from 'react';

type PanelProps = {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, eyebrow, children, className = '' }: PanelProps) {
  return (
    <section className={`rounded-3xl border border-line/80 bg-panel/80 p-5 shadow-glow backdrop-blur md:p-6 ${className}`}>
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">{eyebrow}</p> : null}
      {title ? <h2 className="mb-5 text-2xl font-semibold text-white">{title}</h2> : null}
      {children}
    </section>
  );
}
