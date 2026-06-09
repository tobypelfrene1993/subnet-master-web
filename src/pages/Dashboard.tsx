import type { PageKey } from '../App';
import { Panel } from '../components/Panel';

type DashboardProps = {
  onNavigate: (page: PageKey) => void;
};

type HubCategory = {
  title: string;
  icon: string;
  description: string;
  action: string;
  actionPage: PageKey;
  accent: string;
  tools: Array<{ title: string; page: PageKey }>;
};

const beginnerPath: Array<{ step: string; title: string; page: PageKey; description: string }> = [
  { step: '01', title: 'Subnetting Wizard', page: 'subnetWizard', description: 'Learn the full process one guided question at a time.' },
  { step: '02', title: 'Magic Number Trainer', page: 'magic', description: 'Understand subnet boundaries before memorizing answers.' },
  { step: '03', title: 'Binary Calculator', page: 'binary', description: 'Connect decimal IPs to the binary math behind masks.' },
  { step: '04', title: 'Practice Mode', page: 'practice', description: 'Build speed with instant feedback and explanations.' },
  { step: '05', title: 'Teacher Exam', page: 'teacherExam', description: 'Check readiness with full addressing-table questions.' },
];

const hubCategories: HubCategory[] = [
  {
    title: 'Learning',
    icon: 'LRN',
    description: 'Start here if subnetting is new. These tools teach the why behind every answer.',
    action: 'Start learning path',
    actionPage: 'subnetWizard',
    accent: 'from-cyan/25 via-slate-900/80 to-emerald-500/10',
    tools: [
      { title: 'Subnetting Wizard', page: 'subnetWizard' },
      { title: 'Magic Number Trainer', page: 'magic' },
      { title: 'Binary Calculator', page: 'binary' },
      { title: 'VLSM Whiteboard', page: 'vlsmWhiteboard' },
    ],
  },
  {
    title: 'Calculators',
    icon: 'CAL',
    description: 'Fast, accurate subnet calculations once you understand the method.',
    action: 'Open IP Calculator',
    actionPage: 'ip',
    accent: 'from-blue-500/20 via-slate-900/80 to-cyan/10',
    tools: [
      { title: 'IP Calculator', page: 'ip' },
      { title: 'CIDR Wizard', page: 'wizard' },
      { title: 'VLSM Calculator', page: 'vlsm' },
    ],
  },
  {
    title: 'Practice',
    icon: 'PRC',
    description: 'Train for classroom tests and networking exams with scoring and review.',
    action: 'Start practice',
    actionPage: 'practice',
    accent: 'from-amber-300/20 via-slate-900/80 to-rose-500/10',
    tools: [
      { title: 'Practice Mode', page: 'practice' },
      { title: 'Teacher Exam', page: 'teacherExam' },
      { title: 'Exam Mode', page: 'exam' },
    ],
  },
  {
    title: 'Reference',
    icon: 'REF',
    description: 'Use these views when you need a quick CIDR lookup or visual network map.',
    action: 'Open cheat sheet',
    actionPage: 'cheat',
    accent: 'from-sky-400/20 via-slate-900/80 to-violet-500/10',
    tools: [
      { title: 'CIDR Cheat Sheet', page: 'cheat' },
      { title: 'Visual Network View', page: 'visual' },
    ],
  },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan/20 bg-slate-950/65 p-6 shadow-glow md:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan/15 blur-3xl" />
        <div className="absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-cyan/70 via-blue-500/30 to-transparent" />
        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan">Structured subnetting academy</p>
            <h1 className="max-w-5xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
              Learn, calculate, practice, and reference from one clean hub.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
              Subnet Master is organized like a professional training platform: beginners get a clear learning path, advanced students get fast calculators, and teachers get exam-style practice tools.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="primary-button" type="button" onClick={() => onNavigate('subnetWizard')}>Start with the wizard</button>
              <button className="secondary-button" type="button" onClick={() => onNavigate('teacherExam')}>Generate exam question</button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan/25 bg-slate-950/55 p-5 shadow-2xl">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan">Recommended beginner flow</p>
            <div className="mt-5 space-y-3">
              {beginnerPath.map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  className="group grid w-full gap-3 rounded-2xl border border-line/80 bg-slate-950/55 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan/60 hover:bg-cyan/10 md:grid-cols-[3.5rem_1fr]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 font-mono text-sm font-black text-cyan group-hover:bg-cyan group-hover:text-slate-950">{item.step}</span>
                  <span>
                    <span className="block text-lg font-black text-white">{item.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-400">{item.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {hubCategories.map((category) => (
          <article key={category.title} className={`flex min-h-[23rem] flex-col rounded-[2rem] border border-line/80 bg-gradient-to-br ${category.accent} p-6 shadow-glow`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/30 bg-slate-950/70 font-mono text-sm font-black text-cyan">{category.icon}</div>
                <h2 className="mt-5 text-3xl font-black text-white">{category.title}</h2>
              </div>
              <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan">Hub</span>
            </div>
            <p className="mt-4 min-h-16 max-w-2xl leading-7 text-slate-300">{category.description}</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {category.tools.map((tool) => (
                <button
                  key={tool.title}
                  type="button"
                  onClick={() => onNavigate(tool.page)}
                  className="rounded-2xl border border-line/80 bg-slate-950/45 px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:border-cyan/60 hover:text-white"
                >
                  {tool.title}
                </button>
              ))}
            </div>
            <div className="mt-auto pt-6">
              <button type="button" className="primary-button" onClick={() => onNavigate(category.actionPage)}>{category.action}</button>
            </div>
          </article>
        ))}
      </div>

      <Panel title="Platform structure" eyebrow="Information architecture">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {hubCategories.map((category) => (
            <div key={category.title} className="rounded-3xl border border-line/70 bg-slate-950/50 p-5">
              <p className="font-mono text-sm font-black text-cyan">{category.icon}</p>
              <h3 className="mt-3 text-xl font-black text-white">{category.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{category.tools.map((tool) => tool.title).join(' / ')}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
