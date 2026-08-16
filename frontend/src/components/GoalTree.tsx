import { useState, useEffect } from 'react';
import { api } from '../api';
import type { LifeGoal, YearlyGoal, MonthlyPlan, DailyPlan } from '../api';
import { StatusBadge } from './StatusBadge';
import { LoadingState } from './EmptyState';
import '../styles/goal-tree.css';

type Filter = 'all' | 'active' | 'done';
type ViewMode = 'hierarchy' | 'time';

interface GoalNodeData {
  id: string;
  title: string;
  type: 'life' | 'yearly' | 'monthly' | 'daily';
  status: string;
  timeLabel?: string;
  parentId?: string | null;
  lifeGoalId?: string;
  year?: number;
  children?: GoalNodeData[];
}

function formatDailyDate(date: string): string {
  const parts = date.slice(0, 10).split('-');
  if (parts.length === 3) {
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!isNaN(m) && !isNaN(d)) return `${m}月${d}日`;
  }
  return date;
}

const GOAL_STATUS_TRANSITIONS: Record<string, string[]> = {
  ACTIVE: ['COMPLETED', 'ABANDONED', 'ARCHIVED'],
  COMPLETED: ['ACTIVE'],
  ABANDONED: ['ACTIVE'],
  ARCHIVED: [],
  SUSPENDED: ['ACTIVE'],
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '进行中', COMPLETED: '已完成', ABANDONED: '已放弃',
  ARCHIVED: '已归档', SUSPENDED: '已暂停',
};
function statusOptions(current: string): string[] {
  return Array.from(new Set([current, ...(GOAL_STATUS_TRANSITIONS[current] || [])]));
}

const actionBtn: React.CSSProperties = {
  fontSize: 11, padding: '1px 8px', borderRadius: 5,
  border: '1px solid var(--border, #e5e7eb)', background: '#fff',
  cursor: 'pointer', marginRight: 6, whiteSpace: 'nowrap',
  color: 'var(--text-dim)',
};
const primaryBtn: React.CSSProperties = {
  fontSize: 11, padding: '1px 10px', borderRadius: 5,
  border: 'none', background: 'var(--accent, #6366f1)', color: '#fff',
  cursor: 'pointer', marginRight: 6, whiteSpace: 'nowrap',
};
const dangerBtn: React.CSSProperties = {
  fontSize: 11, padding: '1px 8px', borderRadius: 5,
  border: '1px solid var(--error, #ef4444)', color: 'var(--error, #ef4444)',
  background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap',
};
const editInput: React.CSSProperties = {
  padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border, #e5e7eb)',
  fontSize: 12, minWidth: 0,
};

function NodeEditForm({ node, draftTitle, setDraftTitle, draftTimeHorizon, setDraftTimeHorizon, draftStatus, setDraftStatus, busy, onSave, onCancel }: {
  node: GoalNodeData;
  draftTitle: string;
  setDraftTitle: (v: string) => void;
  draftTimeHorizon: string;
  setDraftTimeHorizon: (v: string) => void;
  draftStatus: string;
  setDraftStatus: (v: string) => void;
  busy: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const statuses = statusOptions(node.status);
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
      <input value={draftTitle} onChange={e => setDraftTitle(e.target.value)}
        placeholder="标题" style={{ ...editInput, flex: 1, minWidth: 120 }} />
      {node.type === 'life' && (
        <input value={draftTimeHorizon} onChange={e => setDraftTimeHorizon(e.target.value)}
          placeholder="时间跨度" style={{ ...editInput, width: 90 }} />
      )}
      {node.type !== 'daily' && (
        <select value={draftStatus} onChange={e => setDraftStatus(e.target.value)}
          style={{ ...editInput, width: 84 }}>
          {statuses.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
        </select>
      )}
      <button onClick={onSave} disabled={busy} style={primaryBtn}>{busy ? '…' : '保存'}</button>
      <button onClick={onCancel} disabled={busy} style={actionBtn}>取消</button>
    </span>
  );
}

/** 「设为子目标 / 设为顶层」表单：选择父目标（排除自身与后代，避免成环） */
function ReparentForm({ node, allYearly, descendants, onDone }: {
  node: GoalNodeData;
  allYearly: YearlyGoal[];
  descendants: Record<string, string[]>;
  onDone: () => void;
}) {
  const [parentId, setParentId] = useState(node.parentId || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const excluded = new Set<string>([node.id, ...(descendants[node.id] || [])]);
  const candidates = allYearly
    .filter(y => !excluded.has(y.id))
    .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));

  async function submit() {
    setBusy(true); setErr('');
    try {
      await api.updateYearlyGoal(node.id, { parentId: parentId || null });
      onDone();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '设置失败');
      setBusy(false);
    }
  }

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
      <select value={parentId} onChange={e => { setParentId(e.target.value); setErr(''); }} style={{ ...editInput, width: 200 }}>
        <option value="">（顶层 / 无父级）</option>
        {candidates.map(c => (
          <option key={c.id} value={c.id}>{c.title}（{c.year}年）</option>
        ))}
      </select>
      <button onClick={submit} disabled={busy} style={primaryBtn}>{busy ? '…' : '保存'}</button>
      <button onClick={onDone} disabled={busy} style={actionBtn}>取消</button>
      {err && <span style={{ fontSize: 12, color: '#ef4444' }}>{err}</span>}
    </span>
  );
}

function GoalNode({ node, depth, onChanged, allYearly, descendants }: {
  node: GoalNodeData;
  depth: number;
  onChanged: () => void;
  allYearly: YearlyGoal[];
  descendants: Record<string, string[]>;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const [reparenting, setReparenting] = useState(false);
  const [draftTitle, setDraftTitle] = useState(node.title);
  const [draftTimeHorizon, setDraftTimeHorizon] = useState(node.timeLabel || '');
  const [draftStatus, setDraftStatus] = useState(node.status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const hasChildren = node.children && node.children.length > 0;
  const subCount = (node.children || []).filter(c => c.type === 'yearly').length;
  const isDone = node.status === 'COMPLETED' || node.status === 'ABANDONED'
    || node.status === 'FAILED' || node.status === 'CANCELLED';
  const editable = node.type === 'life' || node.type === 'yearly' || node.type === 'monthly' || node.type === 'daily';

  function startEdit() {
    setDraftTitle(node.title);
    setDraftTimeHorizon(node.timeLabel || '');
    setDraftStatus(node.status);
    setErr('');
    setEditing(true);
  }

  async function save() {
    const t = draftTitle.trim();
    if (!t) { setErr('标题不能为空'); return; }
    setBusy(true); setErr('');
    try {
      if (node.type === 'life') {
        await api.updateLifeGoal(node.id, { title: t, timeHorizon: draftTimeHorizon.trim() || undefined });
        if (draftStatus !== node.status) await api.updateLifeGoalStatus(node.id, draftStatus);
      } else if (node.type === 'yearly') {
        await api.updateYearlyGoal(node.id, { title: t });
        if (draftStatus !== node.status) await api.updateYearlyGoalStatus(node.id, draftStatus);
      } else if (node.type === 'monthly') {
        await api.updateMonthlyPlan(node.id, { title: t });
      } else if (node.type === 'daily') {
        await api.updateDailyPlan(node.id, { title: t });
      }
      setEditing(false);
      onChanged();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '保存失败');
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const kind = node.type === 'life' ? '人生目标'
      : node.type === 'yearly' ? '年度目标'
      : node.type === 'monthly' ? '月度计划'
      : '日计划';
    const hint = node.type === 'yearly'
      ? (subCount > 0 ? `其下 ${subCount} 个子目标及月度/日计划将一并删除。` : '其下月度计划与日计划将一并删除。')
      : node.type === 'monthly' ? '其下日计划将一并删除。'
      : node.type === 'daily' ? ''
      : '该目标下的年度目标不会删除。';
    if (!window.confirm(`确定删除该${kind}「${node.title}」？${hint}`)) return;
    setBusy(true); setErr('');
    try {
      if (node.type === 'life') await api.deleteLifeGoal(node.id);
      else if (node.type === 'yearly') await api.deleteYearlyGoal(node.id);
      else if (node.type === 'monthly') await api.deleteMonthlyPlan(node.id);
      else if (node.type === 'daily') await api.deleteDailyPlan(node.id);
      onChanged();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '删除失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className={`goal-node ${isDone ? 'done' : ''}`} onClick={() => setExpanded(!expanded)}>
        {editing ? (
          <NodeEditForm
            node={node}
            draftTitle={draftTitle}
            setDraftTitle={setDraftTitle}
            draftTimeHorizon={draftTimeHorizon}
            setDraftTimeHorizon={setDraftTimeHorizon}
            draftStatus={draftStatus}
            setDraftStatus={setDraftStatus}
            busy={busy}
            onSave={save}
            onCancel={() => { setEditing(false); setErr(''); }}
          />
        ) : (
          <>
            <span className="goal-expand-icon">{hasChildren ? (expanded ? '▼' : '▶') : ''}</span>
            <span className="goal-title-text">{node.title}</span>
            <StatusBadge status={node.status} />
            {node.timeLabel && <span className="goal-year-tag">{node.timeLabel}</span>}
            {node.type === 'yearly' && subCount > 0 && (
              <span className="goal-child-count">子目标 {subCount}</span>
            )}
            {editable && (
              <span onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                {node.type === 'yearly' && (
                  <>
                    <button onClick={() => { setAddingChild(v => !v); setReparenting(false); }} disabled={busy} style={actionBtn}>拆子目标</button>
                    <button onClick={() => { setReparenting(v => !v); setAddingChild(false); }} disabled={busy} style={actionBtn}>设父级</button>
                  </>
                )}
                <button onClick={startEdit} disabled={busy} style={actionBtn}>编辑</button>
                <button onClick={remove} disabled={busy} style={dangerBtn}>删除</button>
              </span>
            )}
          </>
        )}
      </div>
      {err && <div style={{ fontSize: 12, color: '#ef4444', padding: '2px 8px' }}>{err}</div>}
      {addingChild && node.type === 'yearly' && (
        <div className="goal-add-row">
          <YearlyAddForm
            lifeGoalId={node.lifeGoalId}
            parentId={node.id}
            defaultYear={node.year}
            onDone={() => { setAddingChild(false); onChanged(); }}
          />
        </div>
      )}
      {reparenting && node.type === 'yearly' && (
        <div className="goal-add-row">
          <ReparentForm
            node={node}
            allYearly={allYearly}
            descendants={descendants}
            onDone={() => { setReparenting(false); onChanged(); }}
          />
        </div>
      )}
      {expanded && hasChildren && (
        <div className="goal-children">
          {node.children!.map(child => (
            <GoalNode key={child.id} node={child} depth={depth + 1} onChanged={onChanged} allYearly={allYearly} descendants={descendants} />
          ))}
        </div>
      )}
    </div>
  );
}

function YearlyAddForm({ lifeGoalId, parentId, defaultYear, onDone }: {
  lifeGoalId?: string; parentId?: string; defaultYear?: number; onDone: () => void;
}) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(defaultYear ?? new Date().getFullYear());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    const t = title.trim();
    if (!t) { setErr('标题不能为空'); return; }
    setBusy(true); setErr('');
    try {
      await api.createYearlyGoal({
        lifeGoalId: lifeGoalId || undefined,
        parentId: parentId || undefined,
        title: t, year,
      });
      onDone();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '创建失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="goal-add-row" onClick={e => e.stopPropagation()}>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={title} onChange={e => { setTitle(e.target.value); setErr(''); }} placeholder="年度目标标题"
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{ ...editInput, flex: 1, minWidth: 160 }} />
        <input value={year} onChange={e => setYear(parseInt(e.target.value || '0', 10))} type="number"
          style={{ ...editInput, width: 70 }} />
        <button onClick={submit} disabled={busy} style={primaryBtn}>{busy ? '…' : '保存'}</button>
        <button onClick={onDone} disabled={busy} style={actionBtn}>取消</button>
        {err && <span style={{ fontSize: 12, color: '#ef4444' }}>{err}</span>}
      </span>
    </div>
  );
}

function YearlyAddToggle({ lifeGoalId, onDone }: { lifeGoalId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  if (open) return <YearlyAddForm lifeGoalId={lifeGoalId} onDone={() => { setOpen(false); onDone(); }} />;
  return (
    <div className="goal-add-row">
      <button className="goal-add-btn" onClick={e => { e.stopPropagation(); setOpen(true); }}>＋ 新增年度目标</button>
    </div>
  );
}

interface Props {
  filter: Filter;
  viewMode?: ViewMode;
}

function TimeEditForm({ node, draftTitle, setDraftTitle, draftStatus, setDraftStatus, busy, onSave, onCancel }: {
  node: { id: string; title: string; type: 'yearly' | 'monthly'; status: string; timeLabel: string };
  draftTitle: string;
  setDraftTitle: (v: string) => void;
  draftStatus: string;
  setDraftStatus: (v: string) => void;
  busy: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const statuses = statusOptions(node.status);
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
      <input value={draftTitle} onChange={e => setDraftTitle(e.target.value)}
        placeholder="标题" style={{ ...editInput, flex: 1, minWidth: 120 }} />
      <input value={node.timeLabel} disabled
        title={node.type === 'yearly' ? '年份不可修改' : '月份不可修改'}
        style={{ ...editInput, width: 72, color: 'var(--text-muted)', background: '#f3f4f6' }} />
      {node.type === 'yearly' && (
        <select value={draftStatus} onChange={e => setDraftStatus(e.target.value)}
          style={{ ...editInput, width: 84 }}>
          {statuses.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
        </select>
      )}
      <button onClick={onSave} disabled={busy} style={primaryBtn}>{busy ? '…' : '保存'}</button>
      <button onClick={onCancel} disabled={busy} style={actionBtn}>取消</button>
    </span>
  );
}

function TimeYearlyRow({ yg, onChanged }: { yg: YearlyGoal; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(yg.title);
  const [draftStatus, setDraftStatus] = useState(yg.status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const isDone = yg.status === 'COMPLETED' || yg.status === 'ABANDONED';

  function startEdit() {
    setDraftTitle(yg.title);
    setDraftStatus(yg.status);
    setErr('');
    setEditing(true);
  }

  async function save() {
    const t = draftTitle.trim();
    if (!t) { setErr('标题不能为空'); return; }
    setBusy(true); setErr('');
    try {
      await api.updateYearlyGoal(yg.id, { title: t });
      if (draftStatus !== yg.status) await api.updateYearlyGoalStatus(yg.id, draftStatus);
      setEditing(false);
      onChanged();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '保存失败');
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`确定删除该年度目标「${yg.title}」？其下月度计划与日计划将一并删除。`)) return;
    setBusy(true); setErr('');
    try {
      await api.deleteYearlyGoal(yg.id);
      onChanged();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '删除失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className={`goal-node ${isDone ? 'done' : ''}`}>
        {editing ? (
          <TimeEditForm
            node={{ id: yg.id, title: yg.title, type: 'yearly', status: yg.status, timeLabel: `${yg.year}年` }}
            draftTitle={draftTitle}
            setDraftTitle={setDraftTitle}
            draftStatus={draftStatus}
            setDraftStatus={setDraftStatus}
            busy={busy}
            onSave={save}
            onCancel={() => { setEditing(false); setErr(''); }}
          />
        ) : (
          <>
            <span className="goal-title-text">{yg.title}</span>
            <StatusBadge status={yg.status} />
            <span className="goal-year-tag">{yg.year}</span>
            <span onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              <button onClick={startEdit} disabled={busy} style={actionBtn}>编辑</button>
              <button onClick={remove} disabled={busy} style={dangerBtn}>删除</button>
            </span>
          </>
        )}
      </div>
      {err && <div style={{ fontSize: 12, color: '#ef4444', padding: '2px 8px' }}>{err}</div>}
    </div>
  );
}

function TimeMonthlyRow({ mp, onChanged }: { mp: MonthlyPlan; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(mp.title);
  const [draftStatus, setDraftStatus] = useState(mp.status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const isDone = mp.status === 'COMPLETED' || mp.status === 'ABANDONED';

  function startEdit() {
    setDraftTitle(mp.title);
    setDraftStatus(mp.status);
    setErr('');
    setEditing(true);
  }

  async function save() {
    const t = draftTitle.trim();
    if (!t) { setErr('标题不能为空'); return; }
    setBusy(true); setErr('');
    try {
      await api.updateMonthlyPlan(mp.id, { title: t });
      setEditing(false);
      onChanged();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '保存失败');
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`确定删除该月度计划「${mp.title}」？其下日计划将一并删除。`)) return;
    setBusy(true); setErr('');
    try {
      await api.deleteMonthlyPlan(mp.id);
      onChanged();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '删除失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className={`goal-node ${isDone ? 'done' : ''}`}>
        {editing ? (
          <TimeEditForm
            node={{ id: mp.id, title: mp.title, type: 'monthly', status: mp.status, timeLabel: `${mp.month}月` }}
            draftTitle={draftTitle}
            setDraftTitle={setDraftTitle}
            draftStatus={draftStatus}
            setDraftStatus={setDraftStatus}
            busy={busy}
            onSave={save}
            onCancel={() => { setEditing(false); setErr(''); }}
          />
        ) : (
          <>
            <span className="goal-title-text">{mp.title}</span>
            <StatusBadge status={mp.status} />
            <span className="goal-year-tag">{mp.month}月</span>
            <span onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              <button onClick={startEdit} disabled={busy} style={actionBtn}>编辑</button>
              <button onClick={remove} disabled={busy} style={dangerBtn}>删除</button>
            </span>
          </>
        )}
      </div>
      {err && <div style={{ fontSize: 12, color: '#ef4444', padding: '2px 8px' }}>{err}</div>}
    </div>
  );
}

function TimeYearlyAddForm({ year, lifeGoals, onDone }: { year: number; lifeGoals: LifeGoal[]; onDone: () => void }) {
  const [lifeGoalId, setLifeGoalId] = useState(lifeGoals[0]?.id || '');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    const t = title.trim();
    if (!t) { setErr('标题不能为空'); return; }
    if (!lifeGoalId) { setErr('请选择关联的人生目标'); return; }
    setBusy(true); setErr('');
    try {
      await api.createYearlyGoal({ lifeGoalId, title: t, year });
      onDone();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '创建失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="goal-add-row" onClick={e => e.stopPropagation()}>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {lifeGoals.length > 1 && (
          <select value={lifeGoalId} onChange={e => setLifeGoalId(e.target.value)} style={{ ...editInput, width: 120 }}>
            {lifeGoals.map(lg => <option key={lg.id} value={lg.id}>{lg.title}</option>)}
          </select>
        )}
        <input value={title} onChange={e => { setTitle(e.target.value); setErr(''); }} placeholder="年度目标标题"
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{ ...editInput, flex: 1, minWidth: 140 }} />
        <button onClick={submit} disabled={busy} style={primaryBtn}>{busy ? '…' : '保存'}</button>
        <button onClick={onDone} disabled={busy} style={actionBtn}>取消</button>
        {err && <span style={{ fontSize: 12, color: '#ef4444' }}>{err}</span>}
      </span>
    </div>
  );
}

function TimeYearlyAddToggle({ year, lifeGoals, onDone }: { year: number; lifeGoals: LifeGoal[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  if (open) return <TimeYearlyAddForm year={year} lifeGoals={lifeGoals} onDone={() => { setOpen(false); onDone(); }} />;
  return (
    <div className="goal-add-row">
      <button className="goal-add-btn" onClick={e => { e.stopPropagation(); setOpen(true); }}>＋ 新增年度目标</button>
    </div>
  );
}

function TimeMonthlyAddForm({ year, yearlyGoals, onDone }: { year: number; yearlyGoals: YearlyGoal[]; onDone: () => void }) {
  const [yearlyGoalId, setYearlyGoalId] = useState(yearlyGoals[0]?.id || '');
  const [title, setTitle] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    const t = title.trim();
    if (!t) { setErr('标题不能为空'); return; }
    if (!yearlyGoalId) { setErr('请选择关联的年度目标'); return; }
    setBusy(true); setErr('');
    try {
      await api.createMonthlyPlan({ yearlyGoalId, title: t, month, year });
      onDone();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '创建失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="goal-add-row" onClick={e => e.stopPropagation()}>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {yearlyGoals.length > 1 && (
          <select value={yearlyGoalId} onChange={e => setYearlyGoalId(e.target.value)} style={{ ...editInput, width: 120 }}>
            {yearlyGoals.map(yg => <option key={yg.id} value={yg.id}>{yg.title}</option>)}
          </select>
        )}
        <input value={title} onChange={e => { setTitle(e.target.value); setErr(''); }} placeholder="月度计划标题"
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{ ...editInput, flex: 1, minWidth: 140 }} />
        <input value={month} onChange={e => setMonth(parseInt(e.target.value || '0', 10))} type="number" min={1} max={12}
          style={{ ...editInput, width: 60 }} />
        <button onClick={submit} disabled={busy} style={primaryBtn}>{busy ? '…' : '保存'}</button>
        <button onClick={onDone} disabled={busy} style={actionBtn}>取消</button>
        {err && <span style={{ fontSize: 12, color: '#ef4444' }}>{err}</span>}
      </span>
    </div>
  );
}

function TimeMonthlyAddToggle({ year, yearlyGoals, onDone }: { year: number; yearlyGoals: YearlyGoal[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  if (open) return <TimeMonthlyAddForm year={year} yearlyGoals={yearlyGoals} onDone={() => { setOpen(false); onDone(); }} />;
  return (
    <div className="goal-add-row">
      <button className="goal-add-btn" onClick={e => { e.stopPropagation(); setOpen(true); }}>＋ 新增月度计划</button>
    </div>
  );
}

function TimeView({ yearlyList, monthlyMap, filter, lifeGoals, onChanged }: {
  yearlyList: YearlyGoal[];
  monthlyMap: Record<string, MonthlyPlan[]>;
  filter: Filter;
  lifeGoals: LifeGoal[];
  onChanged: () => void;
}) {
  // Group yearly goals by year
  const byYear: Record<number, YearlyGoal[]> = {};
  for (const yg of yearlyList) {
    if (!byYear[yg.year]) byYear[yg.year] = [];
    byYear[yg.year].push(yg);
  }
  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);

  const isActive = (s: string) => s === 'ACTIVE' || s === 'IN_PROGRESS';
  const isDone = (s: string) => s === 'COMPLETED' || s === 'ABANDONED';

  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    years.forEach(y => { init[y] = true; });
    return init;
  });

  const toggleYear = (year: number) => setExpandedYears(p => ({ ...p, [year]: !p[year] }));

  return (
    <div>
      {years.map(year => {
        const goals = byYear[year].filter(yg => {
          if (filter === 'all') return true;
          if (filter === 'active') return isActive(yg.status);
          return isDone(yg.status);
        });
        if (goals.length === 0) return null;

        const isExpanded = expandedYears[year] !== false;
        return (
          <div key={year} className="time-year-section">
            <div className="time-year-header" onClick={() => toggleYear(year)}>
              <span className="goal-expand-icon">{isExpanded ? '▼' : '▶'}</span>
              <span className="time-year-title">{year}年</span>
              <span className="time-year-count">{goals.length}个目标</span>
            </div>
            {isExpanded && (
              <div className="time-year-body">
                <TimeYearlyAddToggle year={year} lifeGoals={lifeGoals} onDone={onChanged} />
                {goals.map(yg => (
                  <TimeYearlyRow key={yg.id} yg={yg} onChanged={onChanged} />
                ))}
                {(() => {
                  // Group monthly plans by month
                  const allMps = goals.flatMap(yg => (monthlyMap[yg.id] || []));
                  const byMonth: Record<number, MonthlyPlan[]> = {};
                  allMps.forEach(mp => {
                    if (!byMonth[mp.month]) byMonth[mp.month] = [];
                    byMonth[mp.month].push(mp);
                  });
                  return Object.keys(byMonth).map(Number).sort((a, b) => a - b).map(month => (
                    <div key={month} className="time-month-section">
                      <div className="time-month-header">
                        <span>{month}月计划</span>
                      </div>
                      {byMonth[month].map(mp => (
                        <TimeMonthlyRow key={mp.id} mp={mp} onChanged={onChanged} />
                      ))}
                    </div>
                  ));
                })()}
                <TimeMonthlyAddToggle year={year} yearlyGoals={goals} onDone={onChanged} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** 按 parentId 组织子目标（任意深度） */
function computeChildrenOf(yearly: YearlyGoal[]): Record<string, YearlyGoal[]> {
  const childrenOf: Record<string, YearlyGoal[]> = {};
  yearly.forEach(y => {
    if (y.parentId) {
      (childrenOf[y.parentId] = childrenOf[y.parentId] || []).push(y);
    }
  });
  return childrenOf;
}

/** 计算每个目标的所有后代 id（用于级联删除提示与防成环） */
function computeDescendantMap(childrenOf: Record<string, YearlyGoal[]>): Record<string, string[]> {
  const desc: Record<string, string[]> = {};
  Object.keys(childrenOf).forEach(root => {
    const seen: string[] = [];
    const queue = [...(childrenOf[root] || []).map(c => c.id)];
    while (queue.length) {
      const cur = queue.shift()!;
      if (seen.includes(cur)) continue;
      seen.push(cur);
      (childrenOf[cur] || []).forEach(c => queue.push(c.id));
    }
    desc[root] = seen;
  });
  return desc;
}

function buildYearlyNode(yg: YearlyGoal, childrenOf: Record<string, YearlyGoal[]>, monthlyMap: Record<string, MonthlyPlan[]>, dailyMap: Record<string, DailyPlan[]>, match: (s: string) => boolean): GoalNodeData {
  const subChildren = (childrenOf[yg.id] || [])
    .map(child => buildYearlyNode(child, childrenOf, monthlyMap, dailyMap, match));
  const monthlyNodes = (monthlyMap[yg.id] || [])
    .filter(mp => match(mp.status))
    .map(mp => ({
      id: mp.id,
      title: mp.title,
      type: 'monthly' as const,
      status: mp.status,
      timeLabel: `${mp.month}月`,
      children: (dailyMap[mp.id] || [])
        .filter(dp => match(dp.status))
        .map(dp => ({
          id: dp.id,
          title: dp.title,
          type: 'daily' as const,
          status: dp.status,
          timeLabel: formatDailyDate(dp.date),
        })),
    }));
  return {
    id: yg.id,
    title: yg.title,
    type: 'yearly',
    status: yg.status,
    timeLabel: String(yg.year),
    parentId: yg.parentId,
    lifeGoalId: yg.lifeGoalId,
    year: yg.year,
    children: [...subChildren, ...monthlyNodes],
  };
}

/** 过滤层级树：自身匹配或存在匹配的子目标则保留（避免父被过滤导致子树孤立） */
function pruneYearlyTree(node: GoalNodeData, match: (s: string) => boolean): GoalNodeData | null {
  const yearlyKids = (node.children || []).filter(c => c.type === 'yearly');
  const otherKids = (node.children || []).filter(c => c.type !== 'yearly');
  const prunedYearly = yearlyKids.map(k => pruneYearlyTree(k, match)).filter(Boolean) as GoalNodeData[];
  if (match(node.status) || prunedYearly.length > 0) {
    return { ...node, children: [...prunedYearly, ...otherKids] };
  }
  return null;
}

export function GoalTree({ filter, viewMode = 'hierarchy' }: Props) {
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[] | null | undefined>(undefined);
  const [allYearly, setAllYearly] = useState<YearlyGoal[]>([]);
  const [monthlyMap, setMonthlyMap] = useState<Record<string, MonthlyPlan[]>>({});
  const [dailyMap, setDailyMap] = useState<Record<string, DailyPlan[]>>({});

  const load = () => {
    api.getLifeGoals()
      .then(async (lifeGoals) => {
        setLifeGoals(lifeGoals);
        if (!lifeGoals || lifeGoals.length === 0) return;

        // 一次性加载全部年度目标（含子目标），前端按 parentId 组父子树
        const yearly = await api.getYearlyGoals();
        setAllYearly(yearly);

        // Load monthly plans for each yearly goal (filtered by yearlyGoalId)
        const monthlyPromises = yearly.map(yg =>
          api.getMonthlyPlans(yg.year, undefined, yg.id).then(monthly => ({ ygId: yg.id, monthly }))
        );
        const monthlyResults = await Promise.all(monthlyPromises);
        const mMap: Record<string, MonthlyPlan[]> = {};
        monthlyResults.forEach(r => {
          mMap[r.ygId] = r.monthly;
        });
        setMonthlyMap(mMap);

        // Load daily plans for each monthly plan (filtered by monthlyPlanId).
        // 后端 GET /plans/daily 支持 monthlyPlanId 过滤，按月度逐次查询，避免按天 N+1 或全量加载。
        const allMonthly = monthlyResults.flatMap(r => r.monthly);
        const dailyResults = await Promise.all(
          allMonthly.map(mp =>
            api.getDailyPlans(undefined, mp.id)
              .then(daily => ({ mpId: mp.id, daily }))
              .catch(() => ({ mpId: mp.id, daily: [] as DailyPlan[] }))
          )
        );
        const dMap: Record<string, DailyPlan[]> = {};
        dailyResults.forEach(r => { dMap[r.mpId] = r.daily; });
        setDailyMap(dMap);
      })
      .catch(() => setLifeGoals(null));
  };

  useEffect(load, []);

  if (lifeGoals === undefined) return <LoadingState />;
  if (!lifeGoals || lifeGoals.length === 0) return null;

  const isActive = (s: string) => s === 'ACTIVE' || s === 'IN_PROGRESS';
  const isDone = (s: string) => s === 'COMPLETED' || s === 'ABANDONED';
  // DailyPlan 使用 PlanStatus：PENDING/IN_PROGRESS 视为进行中，其余完成类视为 done
  const isActiveDaily = (s: string) => s === 'PENDING' || s === 'IN_PROGRESS';
  const isDoneDaily = (s: string) => s === 'COMPLETED' || s === 'PARTIAL' || s === 'FAILED' || s === 'CANCELLED';
  const match = (s: string) => {
    if (filter === 'all') return true;
    if (filter === 'active') return isActive(s) || isActiveDaily(s);
    return isDone(s) || isDoneDaily(s);
  };

  if (viewMode === 'time') {
    return <TimeView yearlyList={allYearly} monthlyMap={monthlyMap} filter={filter} lifeGoals={lifeGoals} onChanged={load} />;
  }

  const childrenOf = computeChildrenOf(allYearly);
  const descendants = computeDescendantMap(childrenOf);

  const lifeBlocks = lifeGoals.map(lg => {
    const yearNodes = allYearly
      .filter(y => y.lifeGoalId === lg.id && !y.parentId)
      .map(yg => pruneYearlyTree(buildYearlyNode(yg, childrenOf, monthlyMap, dailyMap, match), match))
      .filter(Boolean) as GoalNodeData[];
    if (filter !== 'all' && !match(lg.status) && yearNodes.length === 0) return null;

    const lifeNode: GoalNodeData = {
      id: lg.id,
      title: lg.title,
      type: 'life',
      status: lg.status,
      timeLabel: lg.timeHorizon || '10-20年',
      children: yearNodes,
    };

    return (
      <div key={lg.id}>
        <GoalNode node={lifeNode} depth={0} onChanged={load} allYearly={allYearly} descendants={descendants} />
        <YearlyAddToggle lifeGoalId={lg.id} onDone={load} />
      </div>
    );
  }).filter(Boolean);

  const unlinkedNodes = allYearly
    .filter(y => !y.parentId && !y.lifeGoalId)
    .map(yg => pruneYearlyTree(buildYearlyNode(yg, childrenOf, monthlyMap, dailyMap, match), match))
    .filter(Boolean) as GoalNodeData[];

  return (
    <div>
      {lifeBlocks}
      {unlinkedNodes.length > 0 && (
        <div className="goal-tree-root">
          <div className="goal-tree-section-title">未关联人生目标</div>
          {unlinkedNodes.map(node => (
            <GoalNode key={node.id} node={node} depth={0} onChanged={load} allYearly={allYearly} descendants={descendants} />
          ))}
        </div>
      )}
    </div>
  );
}
