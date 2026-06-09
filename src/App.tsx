import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { IpCalculator } from './pages/IpCalculator';
import { VlsmCalculator } from './pages/VlsmCalculator';
import { CidrWizard } from './pages/CidrWizard';
import { PracticeMode } from './pages/PracticeMode';
import { ExamMode } from './pages/ExamMode';
import { CheatSheet } from './pages/CheatSheet';
import { VisualNetworkView } from './pages/VisualNetworkView';
import { BinaryCalculator } from './pages/BinaryCalculator';
import { SubnettingWizard } from './pages/SubnettingWizard';
import { MagicNumberTrainer } from './pages/MagicNumberTrainer';
import { VlsmWhiteboard } from './pages/VlsmWhiteboard';
import { TeacherExamGenerator } from './pages/TeacherExamGenerator';
import type { VlsmAllocation } from './types/subnet';
import type { LearningMode } from './lib/learning';

export type PageKey = 'dashboard' | 'subnetWizard' | 'magic' | 'vlsmWhiteboard' | 'teacherExam' | 'ip' | 'binary' | 'vlsm' | 'wizard' | 'practice' | 'exam' | 'cheat' | 'visual';

type NavItem = { key: PageKey; label: string; short: string };
type NavSection = { title: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    title: 'Dashboard',
    items: [{ key: 'dashboard', label: 'Dashboard', short: 'DB' }],
  },
  {
    title: 'Learning',
    items: [
      { key: 'subnetWizard', label: 'Subnetting Wizard', short: 'SW' },
      { key: 'magic', label: 'Magic Number Trainer', short: 'MN' },
      { key: 'binary', label: 'Binary Calculator', short: 'BI' },
      { key: 'vlsmWhiteboard', label: 'VLSM Whiteboard', short: 'VW' },
    ],
  },
  {
    title: 'Calculators',
    items: [
      { key: 'ip', label: 'IP Calculator', short: 'IP' },
      { key: 'wizard', label: 'CIDR Wizard', short: 'CW' },
      { key: 'vlsm', label: 'VLSM Calculator', short: 'VC' },
    ],
  },
  {
    title: 'Practice',
    items: [
      { key: 'practice', label: 'Practice Mode', short: 'PM' },
      { key: 'teacherExam', label: 'Teacher Exam', short: 'TE' },
      { key: 'exam', label: 'Exam Mode', short: 'EM' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { key: 'cheat', label: 'CIDR Cheat Sheet', short: 'CS' },
      { key: 'visual', label: 'Visual Network View', short: 'VN' },
    ],
  },
];

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard');
  const [vlsmResults, setVlsmResults] = useState<VlsmAllocation[]>([]);
  const [learningMode, setLearningMode] = useState<LearningMode>('beginner');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'subnetWizard':
        return <SubnettingWizard mode={learningMode} />;
      case 'magic':
        return <MagicNumberTrainer mode={learningMode} />;
      case 'vlsmWhiteboard':
        return <VlsmWhiteboard mode={learningMode} />;
      case 'teacherExam':
        return <TeacherExamGenerator mode={learningMode} />;
      case 'ip':
        return <IpCalculator />;
      case 'binary':
        return <BinaryCalculator mode={learningMode} />;
      case 'vlsm':
        return <VlsmCalculator onResults={setVlsmResults} onOpenVisual={() => setActivePage('visual')} />;
      case 'wizard':
        return <CidrWizard />;
      case 'practice':
        return <PracticeMode />;
      case 'exam':
        return <ExamMode />;
      case 'cheat':
        return <CheatSheet />;
      case 'visual':
        return <VisualNetworkView vlsmResults={vlsmResults} />;
    }
  };

  const activeLabel = navSections.flatMap((section) => section.items).find((item) => item.key === activePage)?.label ?? 'Dashboard';

  const navigate = (page: PageKey) => {
    setActivePage(page);
    setMobileNavOpen(false);
  };

  const renderNav = (collapsed = false) => (
    <div className="flex h-full flex-col gap-5">
      <div className="rounded-3xl border border-cyan/20 bg-slate-950/70 p-4 shadow-glow">
        <button type="button" onClick={() => navigate('dashboard')} className="block w-full text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan">Network lab</p>
          {!collapsed ? <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Subnet Master</h1> : <h1 className="mt-2 font-mono text-xl font-black text-white">SM</h1>}
        </button>
      </div>

      <div className="rounded-3xl border border-line/80 bg-panel/85 p-3 shadow-glow backdrop-blur-xl">
        {!collapsed ? <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Learning mode</p> : null}
        <div className={`grid gap-2 ${collapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {(['beginner', 'expert'] as LearningMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setLearningMode(mode)}
              className={`rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${learningMode === mode ? 'bg-cyan text-slate-950' : 'border border-line bg-slate-950/60 text-slate-400 hover:border-cyan/50 hover:text-white'}`}
            >
              {collapsed ? (mode === 'beginner' ? 'BE' : 'EX') : mode}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-line/80 bg-panel/85 p-3 shadow-glow backdrop-blur-xl">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed ? <p className="mb-2 px-2 text-xs font-black uppercase tracking-[0.26em] text-cyan/80">{section.title}</p> : null}
            <div className="space-y-1.5">
              {section.items.map((item) => {
                const active = activePage === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.key)}
                    title={collapsed ? item.label : undefined}
                    className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${active ? 'border-cyan/70 bg-cyan text-slate-950 shadow-glow' : 'border-transparent bg-slate-950/35 text-slate-300 hover:border-cyan/40 hover:bg-cyan/10 hover:text-white'}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-black ${active ? 'border-slate-950/20 bg-slate-950/10' : 'border-cyan/20 bg-slate-950/70 text-cyan'}`}>{item.short}</span>
                    {!collapsed ? <span className="text-sm font-semibold">{item.label}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr]">
      <aside className={`sticky top-0 hidden h-screen shrink-0 p-4 transition-all lg:block ${sidebarCollapsed ? 'w-24' : 'w-80'}`}>
        {renderNav(sidebarCollapsed)}
      </aside>

      <div className="min-w-0 px-4 py-5 md:px-8 lg:px-8 lg:py-6">
        <header className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-cyan/20 bg-slate-950/60 p-4 shadow-glow backdrop-blur-xl lg:mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">{activeLabel}</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">Professional subnetting training platform</h2>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="secondary-button hidden lg:inline-flex" onClick={() => setSidebarCollapsed((current) => !current)}>
              {sidebarCollapsed ? 'Expand nav' : 'Collapse nav'}
            </button>
            <button type="button" className="secondary-button lg:hidden" onClick={() => setMobileNavOpen(true)}>Menu</button>
          </div>
        </header>

        {mobileNavOpen ? (
          <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 backdrop-blur-md lg:hidden">
            <div className="mb-3 flex justify-end">
              <button type="button" className="secondary-button" onClick={() => setMobileNavOpen(false)}>Close</button>
            </div>
            <div className="h-[calc(100vh-5rem)]">{renderNav(false)}</div>
          </div>
        ) : null}

        <main className="mx-auto max-w-7xl pb-10">{renderPage()}</main>
      </div>
    </div>
  );
}
