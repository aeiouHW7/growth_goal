import { useState, useEffect } from 'react';
import { api } from '../api';
import type { LifeGoal, YearlyGoal, MonthlyPlan } from '../api';
import { StatusBadge } from './StatusBadge';
import { LoadingState } from './EmptyState';
import '../styles/goal-tree.css';

type Filter = 'all' | 'active' | 'done';
type ViewMode = 'hierarchy' | 'time';

interface GoalNodeData {
  id: string;
  title: string;
  type: 'life' | 'yearly' | 'monthly';
  status: string;
  timeLabel?: string;
  progress?: { current?: string; target?: string; start?: string };
  children?: GoalNodeData[];
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
const METRIC_LABELS: Record<string, string> = {
  NUMERIC: '数值', DURATION: '时长', FREQUENCY: '次数', PERCENTAGE: '百分比', STAGE: '里程碑',
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

function getPct(current?: string, target?: string, start?: string): number {
  const cur = parseFloat(current || '0');
  const tgt = parseFloat(target || '1');
  const st = start ? parseFloat(start) : undefined;
  if (!tgt || isNaN(cur)) return 0;
  let pct: number;
  if (st != null && !isNaN(st) && tgt !== st) {
    pct = Math.min((cur - st) / (tgt - st) * 100, 100);
  } else {
    pct = (cur / tgt) * 100;
  }
  return Math.max(0, Math.round(pct));
}

function pctClass(pct: number): 'green' | 'yellow' | 'red' {
  if (pct >= 100) return 'green';
  if (pct >= 50) return 'yellow';
  return 'red';
}

function NodeEditForm({ node, draftTitle, setDraftTitle, draftTarget, setDraftTarget, draftTimeHorizon, setDraftTimeHorizon, draftStatus, setDraftStatus, busy, onSave, onCancel }: {
  node: GoalNodeData;
  draftTitle: string;
  setDraftTitle: (v: string) => void;
  draftTarget: string;
  setDraftTarget: (v: string) => void;
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
      {node.type === 'yearly' && (
        <input value={draftTarget} onChange={e => setDraftTarget(e.target.value)}
          placeholder="目标值" style={{ ...editInput, width: 90 }} />
      )}
      <select value={draftStatus} onChange={e => setDraftStatus(e.target.value)}
        style={{ ...editInput, width: 84 }}>
        {statuses.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
      </select>
      <button onClick={onSave} disabled={busy} style={primaryBtn}>{busy ? '…' : '保存'}</button>
      <button onClick={onCancel} disabled={busy} style={actionBtn}>取消</button>
    </span>
  );
}

function GoalNode({ node, depth, onChanged }: { node: GoalNodeData; depth: number; onChanged: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(node.title);
  const [draftTarget, setDraftTarget] = useState(node.progress?.target || '');
  const [draftTimeHorizon, setDraftTimeHorizon] = useState(node.timeLabel || '');
  const [draftStatus, setDraftStatus] = useState(node.status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const hasChildren = node.children && node.children.length > 0;
  const isDone = node.status === 'COMPLETED' || node.status === 'ABANDONED';
  const editable = node.type === 'life' || node.type === 'yearly' || node.type === 'monthly';

  const pct = node.progress ? getPct(node.progress.current, node.progress.target, node.progress.start) : 0;

  function startEdit() {
    setDraftTitle(node.title);
    setDraftTarget(node.progress?.target || '');
    setDraftTimeHorizon(node.timeLabel || '');
    setDraftStatus(node.status);
    setErr('');
    setEditing(true);
  }

  async function save() {
    const t = draftTitle.trim();
    if (!t) { setErr('标题不能为空'); return; }
    if (node.type === 'yearly' && !draftTarget.trim()) { setErr('目标值不能为空'); return; }
    setBusy(true); setErr('');
    try {
      if (node.type === 'life') {
        await api.updateLifeGoal(node.id, { title: t, timeHorizon: draftTimeHorizon.trim() || undefined });
        if (draftStatus !== node.status) await api.updateLifeGoalStatus(node.id, draftStatus);
      } else if (node.type === 'yearly') {
        await api.updateYearlyGoal(node.id, { title: t, targetValue: draftTarget.trim() });
        if (draftStatus !== node.status) await api.updateYearlyGoalStatus(node.id, draftStatus);
      } else if (node.type === 'monthly') {
        await api.updateMonthlyPlan(node.id, { title: t, targetValue: draftTarget.trim() });
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
    const kind = node.type === 'life' ? '人生目标' : node.type === 'monthly' ? '月度计划' : '年度目标';
    const hint = node.type === 'yearly' ? '其下月度计划与日计划将一并删除。'
      : node.type === 'monthly' ? '其下日计划将一并删除。'
      : '该目标下的年度目标不会删除。';
    if (!window.confirm(`确定删除该${kind}「${node.title}」？${hint}`)) return;
    setBusy(true); setErr('');
    try {
      if (node.type === 'life') await api.deleteLifeGoal(node.id);
      else if (node.type === 'yearly') await api.deleteYearlyGoal(node.id);
      else if (node.type === 'monthly') await api.deleteMonthlyPlan(node.id);
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
            draftTarget={draftTarget}
            setDraftTarget={setDraftTarget}
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
            {node.progress && (
              <>
                <span className="goal-start-value">{node.progress.start}</span>
                <div className="goal-tree-bar">
                  <div className="progress-bar">
                    <div className={`progress-fill ${isDone ? 'gray' : pctClass(pct)}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="goal-target-value">{node.progress.target}</span>
                <span className="goal-value-text">{pct}%</span>
              </>
            )}
            {editable && (
              <span onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                <button onClick={startEdit} disabled={busy} style={actionBtn}>编辑</button>
                <button onClick={remove} disabled={busy} style={dangerBtn}>删除</button>
              </span>
            )}
          </>
        )}
      </div>
      {err && <div style={{ fontSize: 12, color: '#ef4444', padding: '2px 8px' }}>{err}</div>}
      {expanded && hasChildren && (
        <div className="goal-children">
          {node.children!.map(child => (
            <GoalNode key={child.id} node={child} depth={depth + 1} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}

function YearlyAddForm({ lifeGoalId, onDone }: { lifeGoalId: string; onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [metricType, setMetricType] = useState('DURATION');
  const [targetValue, setTargetValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    const t = title.trim();
    const v = targetValue.trim();
    if (!t || !v) { setErr('标题与目标值为必填'); return; }
    setBusy(true); setErr('');
    try {
      await api.createYearlyGoal({ lifeGoalId, title: t, year, metricType, targetValue: v });
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
        <select value={metricType} onChange={e => setMetricType(e.target.value)} style={{ ...editInput, width: 84 }}>
          {Object.entries(METRIC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={targetValue} onChange={e => { setTargetValue(e.target.value); setErr(''); }} placeholder="目标值"
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{ ...editInput, width: 90 }} />
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

function TimeEditForm({ node, draftTitle, setDraftTitle, draftTarget, setDraftTarget, draftStatus, setDraftStatus, busy, onSave, onCancel }: {
  node: { id: string; title: string; type: 'yearly' | 'monthly'; status: string; timeLabel: string };
  draftTitle: string;
  setDraftTitle: (v: string) => void;
  draftTarget: string;
  setDraftTarget: (v: string) => void;
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
      <input value={draftTarget} onChange={e => setDraftTarget(e.target.value)}
        placeholder="目标值" style={{ ...editInput, width: 90 }} />
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
  const [draftTarget, setDraftTarget] = useState(yg.targetValue);
  const [draftStatus, setDraftStatus] = useState(yg.status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const isDone = yg.status === 'COMPLETED' || yg.status === 'ABANDONED';
  const pct = getPct(yg.currentValue, yg.targetValue, yg.startValue);

  function startEdit() {
    setDraftTitle(yg.title);
    setDraftTarget(yg.targetValue);
    setDraftStatus(yg.status);
    setErr('');
    setEditing(true);
  }

  async function save() {
    const t = draftTitle.trim();
    if (!t) { setErr('标题不能为空'); return; }
    if (!draftTarget.trim()) { setErr('目标值不能为空'); return; }
    setBusy(true); setErr('');
    try {
      await api.updateYearlyGoal(yg.id, { title: t, targetValue: draftTarget.trim() });
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
            draftTarget={draftTarget}
            setDraftTarget={setDraftTarget}
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
            <span className="goal-start-value">{yg.startValue}</span>
            <div className="goal-tree-bar">
              <div className="progress-bar">
                <div className={`progress-fill ${pctClass(pct)}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="goal-target-value">{yg.targetValue}</span>
            <span className="goal-value-text">{pct}%</span>
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
  const [draftTarget, setDraftTarget] = useState(mp.targetValue);
  const [draftStatus, setDraftStatus] = useState(mp.status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const isDone = mp.status === 'COMPLETED' || mp.status === 'ABANDONED';
  const pct = getPct(mp.currentValue, mp.targetValue);

  function startEdit() {
    setDraftTitle(mp.title);
    setDraftTarget(mp.targetValue);
    setDraftStatus(mp.status);
    setErr('');
    setEditing(true);
  }

  async function save() {
    const t = draftTitle.trim();
    if (!t) { setErr('标题不能为空'); return; }
    setBusy(true); setErr('');
    try {
      await api.updateMonthlyPlan(mp.id, { title: t, targetValue: draftTarget.trim() });
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
            draftTarget={draftTarget}
            setDraftTarget={setDraftTarget}
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
            <div className="goal-tree-bar">
              <div className="progress-bar">
                <div className={`progress-fill ${pctClass(pct)}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="goal-target-value">{mp.targetValue}</span>
            <span className="goal-value-text">{pct}%</span>
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
  const [metricType, setMetricType] = useState('DURATION');
  const [targetValue, setTargetValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    const t = title.trim();
    const v = targetValue.trim();
    if (!t || !v) { setErr('标题与目标值为必填'); return; }
    if (!lifeGoalId) { setErr('请选择关联的人生目标'); return; }
    setBusy(true); setErr('');
    try {
      await api.createYearlyGoal({ lifeGoalId, title: t, year, metricType, targetValue: v });
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
        <select value={metricType} onChange={e => setMetricType(e.target.value)} style={{ ...editInput, width: 84 }}>
          {Object.entries(METRIC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={targetValue} onChange={e => { setTargetValue(e.target.value); setErr(''); }} placeholder="目标值"
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{ ...editInput, width: 80 }} />
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
  const [metricType, setMetricType] = useState('DURATION');
  const [targetValue, setTargetValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    const t = title.trim();
    const v = targetValue.trim();
    if (!t || !v) { setErr('标题与目标值为必填'); return; }
    if (!yearlyGoalId) { setErr('请选择关联的年度目标'); return; }
    setBusy(true); setErr('');
    try {
      await api.createMonthlyPlan({ yearlyGoalId, title: t, month, year, metricType, targetValue: v });
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
        <select value={metricType} onChange={e => setMetricType(e.target.value)} style={{ ...editInput, width: 84 }}>
          {Object.entries(METRIC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={targetValue} onChange={e => { setTargetValue(e.target.value); setErr(''); }} placeholder="目标值"
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{ ...editInput, width: 80 }} />
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

export function GoalTree({ filter, viewMode = 'hierarchy' }: Props) {
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[] | null | undefined>(undefined);
  const [yearlyMap, setYearlyMap] = useState<Record<string, YearlyGoal[]>>({});
  const [monthlyMap, setMonthlyMap] = useState<Record<string, MonthlyPlan[]>>({});

  const load = () => {
    api.getLifeGoals()
      .then(async (lifeGoals) => {
        setLifeGoals(lifeGoals);
        if (!lifeGoals || lifeGoals.length === 0) return;

        // Load yearly goals for each life goal
        const yearlyPromises = lifeGoals.map(lg =>
          api.getYearlyGoals().then(yearly => ({ lgId: lg.id, yearly }))
        );
        const yearlyResults = await Promise.all(yearlyPromises);
        const yMap: Record<string, YearlyGoal[]> = {};
        const allYearly: YearlyGoal[] = [];
        yearlyResults.forEach(r => {
          yMap[r.lgId] = r.yearly;
          allYearly.push(...r.yearly);
        });
        setYearlyMap(yMap);

        // Load monthly plans for each yearly goal (filtered by yearlyGoalId)
        const monthlyPromises = allYearly.map(yg =>
          api.getMonthlyPlans(yg.year, undefined, yg.id).then(monthly => ({ ygId: yg.id, monthly }))
        );
        const monthlyResults = await Promise.all(monthlyPromises);
        const mMap: Record<string, MonthlyPlan[]> = {};
        monthlyResults.forEach(r => {
          mMap[r.ygId] = r.monthly;
        });
        setMonthlyMap(mMap);
      })
      .catch(() => setLifeGoals(null));
  };

  useEffect(load, []);

  if (lifeGoals === undefined) return <LoadingState />;
  if (!lifeGoals || lifeGoals.length === 0) return null;

  const isActive = (s: string) => s === 'ACTIVE' || s === 'IN_PROGRESS';
  const isDone = (s: string) => s === 'COMPLETED' || s === 'ABANDONED';

  const filteredLGs = lifeGoals.filter(lg => {
    if (filter === 'all') return true;
    if (filter === 'active') return isActive(lg.status);
    return isDone(lg.status);
  });

  if (viewMode === 'time') {
    const allYearly = Object.values(yearlyMap).flat();
    return <TimeView yearlyList={allYearly} monthlyMap={monthlyMap} filter={filter} lifeGoals={lifeGoals} onChanged={load} />;
  }

  return (
    <div>
      {filteredLGs.map(lg => {
        const yearly = yearlyMap[lg.id] || [];
        const isLifeDone = isDone(lg.status);

        const filteredYearly = yearly.filter(yg => {
          if (filter === 'all') return true;
          if (filter === 'active') return isActive(yg.status);
          return isDone(yg.status);
        });

        if (filter !== 'all' && filteredYearly.length === 0 && !isLifeDone) return null;

        const treeNode: GoalNodeData = {
          id: lg.id,
          title: lg.title,
          type: 'life',
          status: lg.status,
          timeLabel: lg.timeHorizon || '10-20年',
          children: filteredYearly.map(yg => ({
            id: yg.id,
            title: yg.title,
            type: 'yearly' as const,
            status: yg.status,
            timeLabel: String(yg.year),
            progress: { current: yg.currentValue, target: yg.targetValue, start: yg.startValue },
            children: (monthlyMap[yg.id] || [])
              .filter(mp => {
                if (filter === 'all') return true;
                if (filter === 'active') return isActive(mp.status);
                return isDone(mp.status);
              })
              .map(mp => ({
                id: mp.id,
                title: mp.title,
                type: 'monthly' as const,
                status: mp.status,
                timeLabel: `${mp.month}月`,
                progress: { current: mp.currentValue, target: mp.targetValue },
              })),
          })),
        };

        return (
          <div key={lg.id}>
            <GoalNode node={treeNode} depth={0} onChanged={load} />
            <YearlyAddToggle lifeGoalId={lg.id} onDone={load} />
          </div>
        );
      })}
    </div>
  );
}
