import { useState } from 'react';

interface PlanItem {
  id?: string;
  title: string;
  dotColor: string;
  meta?: string;
  progress?: number;
  status?: string;
  targetValue?: string;
}

interface Props {
  title: string;
  items: PlanItem[];
  emptyHint?: string;
  mode?: 'day' | 'week' | 'month' | 'year';
  editable?: boolean;
  onEdit?: (id: string, data: { title: string; targetValue: string }) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onAdd?: (data: { title: string; metricType: string; targetValue: string }) => Promise<void> | void;
}

const actionBtn: React.CSSProperties = {
  fontSize: 11, padding: '1px 8px', borderRadius: 5,
  border: '1px solid var(--border, #e5e7eb)', background: '#fff',
  cursor: 'pointer', marginRight: 6, whiteSpace: 'nowrap', color: 'var(--text-dim)',
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

function AddPlanForm({ onAdd }: { onAdd: (d: { title: string; metricType: string; targetValue: string }) => Promise<void> | void }) {
  const [title, setTitle] = useState('');
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
      await onAdd({ title: t, metricType, targetValue: v });
      setTitle('');
      setTargetValue('');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '创建失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={title} onChange={e => { setTitle(e.target.value); setErr(''); }} placeholder="计划标题"
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{ flex: 1, ...editInput, padding: '6px 10px' }} />
        <select value={metricType} onChange={e => setMetricType(e.target.value)} style={{ ...editInput, padding: '6px 6px' }}>
          <option value="NUMERIC">数值</option>
          <option value="DURATION">时长</option>
          <option value="FREQUENCY">次数</option>
          <option value="PERCENTAGE">百分比</option>
          <option value="STAGE">里程碑</option>
        </select>
        <input value={targetValue} onChange={e => { setTargetValue(e.target.value); setErr(''); }} placeholder="目标值"
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{ width: 90, ...editInput, padding: '6px 10px' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={submit} disabled={busy} style={{ ...primaryBtn, padding: '5px 14px', fontSize: 12 }}>{busy ? '…' : '保存'}</button>
        {err && <span style={{ fontSize: 12, color: '#ef4444' }}>{err}</span>}
      </div>
    </div>
  );
}

export function PlanPanel({ title, items, emptyHint, mode, editable = false, onEdit, onDelete, onAdd }: Props) {
  // 月/年粒度：显示进度条（对齐原型）
  const showProgress = mode === 'month' || mode === 'year';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function startEdit(item: PlanItem) {
    setEditingId(item.id || null);
    setEditTitle(item.title);
    setEditTarget(item.targetValue ?? item.meta?.replace('目标: ', '') ?? '');
    setErr('');
  }

  async function saveEdit(id: string) {
    const t = editTitle.trim();
    const v = editTarget.trim();
    if (!t || !v) { setErr('标题与目标值为必填'); return; }
    setBusy(true); setErr('');
    try {
      await onEdit?.(id, { title: t, targetValue: v });
      setEditingId(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '保存失败');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('确定删除该月度计划？其下日计划将一并删除。')) return;
    setBusy(true); setErr('');
    try {
      await onDelete?.(id);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '删除失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{title}</span>
        {editable && onAdd && (
          <button onClick={() => setShowAdd(v => !v)} style={actionBtn}>＋ 新增</button>
        )}
      </div>
      {items.length === 0 ? (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>暂无计划</div>
          {emptyHint && <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 0 8px 0' }}>{emptyHint}</div>}
        </div>
      ) : items.map((item, i) => (
        <div className="panel-plan-item" key={item.id || i}>
          {editingId === item.id ? (
            <span style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="标题"
                style={{ ...editInput, flex: 1, minWidth: 100 }} />
              <input value={editTarget} onChange={e => setEditTarget(e.target.value)} placeholder="目标值"
                style={{ ...editInput, width: 80 }} />
              <button onClick={() => saveEdit(item.id!)} disabled={busy} style={primaryBtn}>{busy ? '…' : '保存'}</button>
              <button onClick={() => setEditingId(null)} disabled={busy} style={actionBtn}>取消</button>
            </span>
          ) : (
            <>
              <span className={`goal-dot ${item.dotColor}`} />
              <span className="panel-plan-title">{item.title}</span>
              {showProgress && item.progress != null && (
                <div style={{ flex: 1, maxWidth: 80, height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                  <div style={{ width: `${item.progress}%`, height: '100%', borderRadius: 3, background: 'var(--accent)' }} />
                </div>
              )}
              {item.meta && <span className="panel-plan-meta">{item.meta}</span>}
              {editable && item.id && (
                <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => startEdit(item)} style={actionBtn}>编辑</button>
                  <button onClick={() => remove(item.id!)} disabled={busy} style={dangerBtn}>删除</button>
                </span>
              )}
            </>
          )}
        </div>
      ))}
      {err && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{err}</div>}
      {editable && onAdd && showAdd && (
        <AddPlanForm onAdd={async (d) => { await onAdd(d); setShowAdd(false); }} />
      )}
    </div>
  );
}
