import { useState } from 'react';
import { OverviewPage } from './pages/OverviewPage';
import { GoalsPage } from './pages/GoalsPage';
import { PlansPage } from './pages/PlansPage';
import './styles/theme.css';
import './styles/app.css';

type Page = 'overview' | 'goals' | 'plans';

const navItems: Array<{ key: Page; label: string }> = [
  { key: 'overview', label: '总览' },
  { key: 'goals', label: '目标链' },
  { key: 'plans', label: '计划' },
];

function App() {
  const [page, setPage] = useState<Page>('overview');

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-logo">growth</span>
        <div className="navbar-tabs">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`navbar-tab ${page === item.key ? 'active' : ''}`}
              onClick={() => setPage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        {page === 'overview' && <OverviewPage />}
        {page === 'goals' && <GoalsPage />}
        {page === 'plans' && <PlansPage />}
      </main>
    </div>
  );
}

export default App;
