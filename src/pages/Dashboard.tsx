import type { PageKey } from '../App';
import { Panel } from '../components/Panel';
import { InfoTooltip } from '../components/InfoTooltip';

const cards: Array<{ key: PageKey; title: string; description: string; accent: string }> = [
  { key: 'ip', title: 'IP Calculator', description: 'Network, broadcast, host range, masks and block size from any IPv4/CIDR.', accent: 'from-cyan/30 to-blue-700/20' },
  { key: 'binary', title: 'Binary Calculator', description: 'Convert IPv4 and CIDR masks into binary, then visualize the AND operation.', accent: 'from-cyan/25 to-emerald-500/15' },
  { key: 'vlsm', title: 'VLSM Calculator', description: 'Allocate non-overlapping subnet blocks from real host requirements.', accent: 'from-emerald-400/25 to-cyan/15' },
  { key: 'wizard', title: 'CIDR Wizard', description: 'Enter required hosts and learn the smallest matching CIDR block.', accent: 'from-violet-400/25 to-blue-700/15' },
  { key: 'practice', title: 'Practice Mode', description: 'Instant-feedback questions for network, broadcast, host range and masks.', accent: 'from-amber-300/25 to-cyan/10' },
  { key: 'exam', title: 'Exam Mode', description: 'Timed subnetting quiz with difficulty levels and final answer review.', accent: 'from-rose-400/25 to-blue-700/15' },
  { key: 'cheat', title: 'Cheat Sheet', description: 'CIDR /16 to /32 table with masks, wildcards, totals and usable hosts.', accent: 'from-sky-400/25 to-slate-700/20' },
  { key: 'visual', title: 'Visual Network View', description: 'See subnet blocks as cards and proportional horizontal ranges.', accent: 'from-cyan/30 to-emerald-500/15' },
];

type DashboardProps = {
  onNavigate: (page: PageKey) => void;
};

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan/20 bg-slate-950/65 p-6 shadow-glow md:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-cyan/70 via-blue-500/30 to-transparent" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan">IPv4 subnetting command center</p>
            <h2 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
              Leer subnetten met heldere berekeningen.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
              Free subnetting calculator, VLSM planner en oefenmodus voor studenten die niet alleen antwoorden willen, maar ook de formule erachter.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="primary-button" type="button" onClick={() => onNavigate('ip')}>Start calculating</button>
              <button className="secondary-button" type="button" onClick={() => onNavigate('practice')}>Practice questions</button>
            </div>
            <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
              {['Network', 'Broadcast', 'Host range'].map((item) => (
                <div key={item} className="rounded-2xl border border-line/70 bg-slate-900/55 px-4 py-3">
                  <p className="font-mono text-sm font-semibold text-cyan">{item}</p>
                  <p className="mt-1 text-xs text-slate-400">met stappenplan</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-cyan/30 bg-gradient-to-br from-cyan/15 via-slate-900/80 to-blue-950/80 p-5 shadow-2xl">
            <p className="text-sm font-semibold text-cyan">Quick lab snapshot</p>
            <dl className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <dt className="text-slate-400">Core focus</dt>
                <dd className="text-right font-semibold text-white">IPv4 subnetting</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <dt className="text-slate-400">Runs</dt>
                <dd className="text-right font-semibold text-white">100% in browser</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Includes</dt>
                <dd className="text-right font-semibold text-white">Calculator, VLSM, quiz</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <Panel title="Choose a tool" eyebrow="Dashboard">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => onNavigate(card.key)}
              className={`group relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br ${card.accent} p-5 text-left transition hover:-translate-y-1 hover:border-cyan/70 hover:shadow-glow`}
            >
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/30 bg-slate-950/70 font-mono text-cyan shadow-lg">
                /{cards.indexOf(card) + 1}
              </div>
              <h3 className="text-xl font-bold text-white">
                {card.title}
                {card.key === 'vlsm' ? <InfoTooltip term="VLSM" /> : null}
                {card.key === 'binary' ? <InfoTooltip term="Binary" /> : null}
                {card.key === 'practice' ? <InfoTooltip term="Practice mode" /> : null}
                {card.key === 'exam' ? <InfoTooltip term="Exam mode" /> : null}
              </h3>
              <p className="mt-3 leading-7 text-slate-300">{card.description}</p>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
