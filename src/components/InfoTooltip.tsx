import { termDefinitions } from '../data/terms';

type InfoTooltipProps = {
  term: keyof typeof termDefinitions;
};

export function InfoTooltip({ term }: InfoTooltipProps) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`About ${term}`}
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 text-xs font-bold text-cyan transition hover:bg-cyan/20"
      >
        ?
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-72 -translate-x-1/2 rounded-xl border border-line bg-slate-950 p-3 text-left text-xs font-normal leading-relaxed text-slate-200 shadow-glow group-hover:block">
        <strong className="mb-1 block text-cyan">{term}</strong>
        {termDefinitions[term]}
      </span>
    </span>
  );
}
