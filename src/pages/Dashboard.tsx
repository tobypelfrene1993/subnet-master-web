import type { PageKey } from '../App';
import { Panel } from '../components/Panel';

type DashboardProps = {
  onNavigate: (page: PageKey) => void;
};

type ToolCard = {
  title: string;
  page: PageKey;
  description: string;
  button: string;
  code: string;
};

const primaryTools: ToolCard[] = [
  {
    title: 'Quick Calculator',
    page: 'ip',
    description: 'Enter IP/CIDR and get network ID, broadcast, host range, masks, usable hosts, and magic number.',
    button: 'Calculate now',
    code: 'QC',
  },
  {
    title: 'VLSM Designer',
    page: 'vlsm',
    description: 'Build a subnet plan from a base network and required host groups, including unused space.',
    button: 'Design plan',
    code: 'VD',
  },
  {
    title: 'VLSM Auto Planner',
    page: 'vlsmAuto',
    description: 'Automatically divide a network into multiple non-overlapping subnets.',
    button: 'Auto plan',
    code: 'VA',
  },
  {
    title: 'Available Subnets',
    page: 'available',
    description: 'List every target subnet block that fits inside a larger base network.',
    button: 'Show blocks',
    code: 'AS',
  },
  {
    title: 'Subnet Finder',
    page: 'wizard',
    description: 'Enter required hosts and find the smallest matching CIDR, mask, total addresses, and block size.',
    button: 'Find CIDR',
    code: 'SF',
  },
];

const learningTools: ToolCard[] = [
  { title: 'Practice', page: 'practice', description: 'Random subnetting questions with instant feedback.', button: 'Start practice', code: 'PR' },
  { title: 'Binary Calculator', page: 'binary', description: 'Inspect the binary mask and AND math behind subnet results.', button: 'Open binary tool', code: 'BI' },
  { title: 'Subnetting Wizard', page: 'subnetWizard', description: 'Step through subnetting logic when you want guided learning.', button: 'Open wizard', code: 'SW' },
  { title: 'Magic Number Trainer', page: 'magic', description: 'Train subnet boundaries and block jumps.', button: 'Train magic', code: 'MN' },
];

const referenceTools: ToolCard[] = [
  { title: 'Reference', page: 'cheat', description: 'CIDR masks, wildcard masks, usable hosts, and block sizes.', button: 'Open reference', code: 'RF' },
  { title: 'Visual Network View', page: 'visual', description: 'Review VLSM allocations or visualize subnet blocks.', button: 'Open visual view', code: 'VN' },
  { title: 'Teacher Exam', page: 'teacherExam', description: 'Generate addressing-table questions for classroom practice.', button: 'Generate exam', code: 'TE' },
  { title: 'Exam Mode', page: 'exam', description: 'Run timed subnetting quizzes when you need scoring.', button: 'Start exam', code: 'EM' },
];

function ToolCardButton({ tool, onNavigate }: { tool: ToolCard; onNavigate: (page: PageKey) => void }) {
  return (
    <article className="flex min-h-56 flex-col rounded-3xl border border-line/80 bg-slate-950/55 p-5 shadow-glow transition hover:-translate-y-0.5 hover:border-cyan/45">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 font-mono text-sm font-black text-cyan">{tool.code}</span>
        <span className="rounded-full border border-line bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Tool</span>
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-tight text-white">{tool.title}</h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{tool.description}</p>
      <button type="button" className="primary-button mt-5 w-full" onClick={() => onNavigate(tool.page)}>{tool.button}</button>
    </article>
  );
}

function CompactToolList({ tools, onNavigate }: { tools: ToolCard[]; onNavigate: (page: PageKey) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {tools.map((tool) => (
        <button
          key={tool.title}
          type="button"
          onClick={() => onNavigate(tool.page)}
          className="rounded-2xl border border-line/80 bg-slate-950/45 p-4 text-left transition hover:border-cyan/50 hover:bg-cyan/10"
        >
          <span className="font-mono text-xs font-black text-cyan">{tool.code}</span>
          <span className="mt-2 block font-bold text-white">{tool.title}</span>
          <span className="mt-1 block text-sm leading-6 text-slate-400">{tool.description}</span>
        </button>
      ))}
    </div>
  );
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-cyan/20 bg-slate-950/65 p-6 shadow-glow md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan">Subnet Master</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">Fast subnet calculation, VLSM planning and subnet design.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Practical tools for network engineers and students who need usable subnet answers quickly.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {primaryTools.map((tool) => <ToolCardButton key={tool.title} tool={tool} onNavigate={onNavigate} />)}
      </section>

      <Panel title="Practice & Learning" eyebrow="Secondary tools">
        <CompactToolList tools={learningTools} onNavigate={onNavigate} />
      </Panel>

      <Panel title="Reference" eyebrow="Lookup and review">
        <CompactToolList tools={referenceTools} onNavigate={onNavigate} />
      </Panel>
    </div>
  );
}
