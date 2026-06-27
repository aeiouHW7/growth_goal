import { useState } from 'react';
import { Card } from '../components/Card';
import { GoalTree } from '../components/GoalTree';
import { EmptyState } from '../components/EmptyState';

type Filter = 'all' | 'active' | 'done';
type ViewMode = 'hierarchy' | 'time';

const filters: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'done', label: '已完成' },
];

const viewModes: Array<{ key: ViewMode; label: string }> = [
  { key: 'hierarchy', label: '层级' },
  { key: 'time', label: '时间' },
];

export function GoalsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('hierarchy');

  return (
    <div>
      <Card
        title="目标层级树"
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="filter-bar" style={{ margin: 0 }}>
              {viewModes.map(vm => (
                <button
                  key={vm.key}
                  className={`filter-btn ${viewMode === vm.key ? 'active' : ''}`}
                  onClick={() => setViewMode(vm.key)}
                >
                  {vm.label}
                </button>
              ))}
            </div>
            <span style={{ color: 'var(--border)', userSelect: 'none' }}>|</span>
            <div className="filter-bar" style={{ margin: 0 }}>
              {filters.map(f => (
                <button
                  key={f.key}
                  className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <GoalTree filter={filter} viewMode={viewMode} />
      </Card>
    </div>
  );
}
