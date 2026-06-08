import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { IpCalculator } from './pages/IpCalculator';
import { VlsmCalculator } from './pages/VlsmCalculator';
import { CidrWizard } from './pages/CidrWizard';
import { PracticeMode } from './pages/PracticeMode';
import { ExamMode } from './pages/ExamMode';
import { CheatSheet } from './pages/CheatSheet';
import { VisualNetworkView } from './pages/VisualNetworkView';
import type { VlsmAllocation } from './types/subnet';

export type PageKey = 'dashboard' | 'ip' | 'vlsm' | 'wizard' | 'practice' | 'exam' | 'cheat' | 'visual';

const pages: Array<{ key: PageKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'ip', label: 'IP Calculator' },
  { key: 'vlsm', label: 'VLSM' },
  { key: 'wizard', label: 'CIDR Wizard' },
  { key: 'practice', label: 'Practice' },
  { key: 'exam', label: 'Exam' },
  { key: 'cheat', label: 'Cheat Sheet' },
  { key: 'visual', label: 'Visual View' },
];

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard');
  const [vlsmResults, setVlsmResults] = useState<VlsmAllocation[]>([]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'ip':
        return <IpCalculator />;
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

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 lg:px-10">
      <header className="mx-auto mb-8 max-w-7xl">
        <div className="flex flex-col gap-5 rounded-3xl border border-line/70 bg-slate-950/45 p-5 shadow-glow backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <button type="button" onClick={() => setActivePage('dashboard')} className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-cyan">Network lab</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white md:text-4xl">Subnet Master</h1>
          </button>
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {pages.map((page) => (
              <button
                key={page.key}
                type="button"
                onClick={() => setActivePage(page.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activePage === page.key
                    ? 'bg-cyan text-slate-950 shadow-glow'
                    : 'border border-line bg-slate-900/70 text-slate-300 hover:border-cyan/70 hover:text-white'
                }`}
              >
                {page.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl">{renderPage()}</main>
    </div>
  );
}
