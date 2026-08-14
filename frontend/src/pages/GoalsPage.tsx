import { useState } from 'react';
import { Card } from '../components/Card';
import { GoalTree } from '../components/GoalTree';
import { AISuggestModal } from '../components/AISuggestModal';
import { api } from '../api';

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

function LifeGoalAddForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    const t = title.trim();
    if (!t) { setErr('标题不能为空'); return; }
    setBusy(true); setErr('');
    try {
      await api.createLifeGoal({ title: t, timeHorizon: timeHorizon.trim() || undefined });
      setTitle('');
      setTimeHorizon('');
      onDone();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '创建失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
      <input
        value={title} onChange={e => { setTitle(e.target.value); setErr(''); }}
        placeholder="人生目标标题（如：成为行业顶尖专家）"
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        style={{ flex: 1, minWidth: 180, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', fontSize: 13 }}
      />
      <input
        value={timeHorizon} onChange={e => setTimeHorizon(e.target.value)}
        placeholder="时间跨度（如：10-20年）"
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        style={{ width: 140, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', fontSize: 13 }}
      />
      <button onClick={submit} disabled={busy}
        style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--accent, #6366f1)', color: '#fff', cursor: busy ? 'wait' : 'pointer', fontSize: 13, fontWeight: 600 }}>
        {busy ? '…' : '保存'}
      </button>
      {err && <span style={{ fontSize: 12, color: '#ef4444' }}>{err}</span>}
    </div>
  );
}

export function GoalsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('hierarchy');
  const [showSuggest, setShowSuggest] = useState(false);
  const [showAddLife, setShowAddLife] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
            <button
              onClick={() => setShowAddLife(v => !v)}
              style={{
                padding: '5px 12px', borderRadius: 8, border: '1px solid var(--accent, #6366f1)',
                background: '#fff', color: 'var(--accent, #6366f1)', cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
              }}
            >
              ＋ 新增人生目标
            </button>
            <button
              onClick={() => setShowSuggest(true)}
              style={{
                padding: '5px 12px', borderRadius: 8, border: 'none',
                background: 'var(--accent, #6366f1)', color: '#fff', cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
              }}
            >
              🤖 AI 建议目标
            </button>
          </div>
        }
      >
        {showAddLife && (
          <LifeGoalAddForm onDone={() => setReloadKey(k => k + 1)} />
        )}
        <GoalTree key={reloadKey} filter={filter} viewMode={viewMode} />
      </Card>

      {showSuggest && (
        <AISuggestModal mode="yearly" onClose={() => setShowSuggest(false)} />
      )}
    </div>
  );
}
