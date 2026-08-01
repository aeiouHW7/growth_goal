import { useState, useEffect } from 'react';
import { api } from '../api';
import type { DailyPlan, Review } from '../api';
import { LoadingState, ErrorState } from './EmptyState';
import '../styles/calendar.css';

interface Props {
  year: number;
  month: number;
  day?: number; // 指定日期，默认今天或1号
}

const weekdayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
function pad2(n: number): string { return String(n).padStart(2, '0'); }

function weekdayLabel(y: number, m: number, d: number): string {
  const idx = new Date(y, m - 1, d).getDay() === 0 ? 6 : new Date(y, m - 1, d).getDay() - 1;
  return weekdayNames[idx];
}

const METRIC_META: Record<string, { label: string; unit: string }> = {
  NUMERIC: { label: '数值', unit: '' },
  DURATION: { label: '时长', unit: '小时' },
  FREQUENCY: { label: '次数', unit: '次' },
  PERCENTAGE: { label: '百分比', unit: '%' },
  STAGE: { label: '里程碑', unit: '阶段' },
};

export function DayTimeline({ year, month, day: propDay }: Props) {
  const [local, setLocal] = useState(() => {
    const t = new Date();
    const fallback = (t.getFullYear() === year && t.getMonth() + 1 === month) ? t.getDate() : 1;
    return { y: year, m: month, d: propDay ?? fallback };
  });
  const [plans, setPlans] = useState<DailyPlan[] | null | undefined>(undefined);
  const [review, setReview] = useState<Review | null | undefined>(undefined);
  const [error, setError] = useState(false);
  // 输入区
  const [title, setTitle] = useState('');
  const [metricType, setMetricType] = useState('DURATION');
  const [targetValue, setTargetValue] = useState('');
  const [errTitle, setErrTitle] = useState(false);
  const [errTarget, setErrTarget] = useState(false);
  const [busy, setBusy] = useState(false);

  // propDay / year / month 变化时重置当前日期（setState 在微任务后）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (propDay != null) setLocal(prev => ({ ...prev, y: year, m: month, d: propDay }));
    })();
    return () => { cancelled = true; };
  }, [year, month, propDay]);

  const dateStr = `${local.y}-${pad2(local.m)}-${pad2(local.d)}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, r] = await Promise.all([
        api.getDailyPlans(dateStr).catch(() => null),
        api.getDailyReview(dateStr).catch(() => null),
      ]);
      if (cancelled) return;
      setPlans(p);
      setReview(r);
      setError(false);
    })();
    return () => { cancelled = true; };
  }, [dateStr]);

  function shiftDay(delta: number) {
    const dt = new Date(local.y, local.m - 1, local.d + delta);
    setLocal({ y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() });
  }

  async function addTask() {
    const t = title.trim();
    const v = targetValue.trim();
    const tOk = !!t;
    const vOk = !!v && parseFloat(v) > 0;
    setErrTitle(!tOk);
    setErrTarget(!vOk);
    if (!tOk || !vOk) return;
    setBusy(true);
    try {
      await api.createDailyPlan({ title: t, date: dateStr, metricType, targetValue: v });
      setTitle('');
      setTargetValue('');
      const p = await api.getDailyPlans(dateStr).catch(() => null);
      if (p) setPlans(p);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask(plan: DailyPlan) {
    setBusy(true);
    try {
      if (plan.status === 'PENDING') {
        await api.updateDailyPlanStatus(plan.id, 'IN_PROGRESS');
      }
      await api.updateDailyPlanStatus(plan.id, 'COMPLETED');
      const p = await api.getDailyPlans(dateStr).catch(() => null);
      if (p) setPlans(p);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function deleteTask(plan: DailyPlan) {
    setBusy(true);
    try {
      await api.updateDailyPlanStatus(plan.id, 'CANCELLED');
      const p = await api.getDailyPlans(dateStr).catch(() => null);
      if (p) setPlans(p);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (plans === undefined) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => setPlans(null)} />;

  const activePlans = (plans ?? []).filter(p => p.status !== 'CANCELLED');
  const doneCount = activePlans.filter(p => p.status === 'COMPLETED').length;
  const pct = activePlans.length ? Math.round(doneCount / activePlans.length * 100) : 0;
  const meta = METRIC_META[metricType] || METRIC_META.NUMERIC;

  const da = review?.aiAnalyses?.[0]?.structuredReport;
  const score = da ? avgScore(da) : null;
  const reviewSummary = da
    ? `复盘：${score != null ? score + '分' : '已生成'} · 完成 ${da.completionSummary?.completionRate || '0%'}`
    : '暂无复盘数据';

  function slotTask(task?: DailyPlan) {
    if (!task) return null;
    const isCompleted = task.status === 'COMPLETED';
    const isCancelled = task.status === 'CANCELLED';
    return (
      <div className="tl-block" style={{ opacity: isCancelled ? 0.5 : 1, textDecoration: isCompleted ? 'line-through' : 'none' }}>
        <span style={{ fontWeight: 500 }}>{task.title}</span>
        {isCompleted ? ' ✅' : task.status === 'IN_PROGRESS' ? ' ⏳' : ''}
        <span style={{ marginLeft: 8 }}>
          {!isCompleted && !isCancelled && (
            <button onClick={() => toggleTask(task)} disabled={busy}
              style={{ fontSize: 11, padding: '1px 8px', borderRadius: 5, border: '1px solid var(--success, #22c55e)', color: 'var(--success, #22c55e)', background: '#fff', cursor: busy ? 'wait' : 'pointer', marginRight: 6 }}>✓</button>
          )}
          {task.status === 'PENDING' && (
            <button onClick={() => deleteTask(task)} disabled={busy}
              style={{ fontSize: 11, padding: '1px 8px', borderRadius: 5, border: '1px solid var(--error, #ef4444)', color: 'var(--error, #ef4444)', background: '#fff', cursor: busy ? 'wait' : 'pointer' }}>✕</button>
          )}
        </span>
      </div>
    );
  }

  const slots: Array<{ time: string; content: React.ReactNode }> = [
    { time: '08:00', content: slotTask(activePlans[0]) },
    { time: '10:00', content: slotTask(activePlans[1]) },
    { time: '12:00', content: <div className="tl-block empty">午间休息 / 散步</div> },
    { time: '14:00', content: slotTask(activePlans[2]) },
    { time: '18:00', content: slotTask(activePlans[3]) },
    { time: '20:00', content: <div className="tl-block" style={{ background: 'var(--accent-bg)' }}>{reviewSummary}</div> },
  ];

  return (
    <div>
      {/* 翻日导航 */}
      <div className="day-nav">
        <button className="btn btn-outline btn-sm" onClick={() => shiftDay(-1)}>◀ 前一天</button>
        <div className="day-nav-title">{local.m}月{local.d}日 · {weekdayLabel(local.y, local.m, local.d)}</div>
        <button className="btn btn-outline btn-sm" onClick={() => shiftDay(1)}>后一天 ▶</button>
      </div>

      {/* 输入区 */}
      <div style={{ padding: '10px 0', borderBottom: '1px solid var(--sep, #e5e7eb)', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={title} onChange={e => { setTitle(e.target.value); setErrTitle(false); }}
            placeholder="今天要完成什么？"
            onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
            style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: `1px solid ${errTitle ? '#ef4444' : 'var(--border, #e5e7eb)'}`, fontSize: 13, minWidth: 0 }}
          />
          <select value={metricType} onChange={e => setMetricType(e.target.value)}
            style={{ padding: '7px 6px', borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', fontSize: 12 }}>
            <option value="NUMERIC">数值</option>
            <option value="DURATION">时长</option>
            <option value="FREQUENCY">次数</option>
            <option value="PERCENTAGE">百分比</option>
            <option value="STAGE">里程碑</option>
          </select>
          <input value={targetValue} onChange={e => { setTargetValue(e.target.value); setErrTarget(false); }}
            placeholder={`目标值${meta.unit ? `（${meta.unit}）` : ''}`} type="number" min={0}
            onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
            style={{ width: 90, padding: '7px 10px', borderRadius: 8, border: `1px solid ${errTarget ? '#ef4444' : 'var(--border, #e5e7eb)'}`, fontSize: 13 }} />
          <button onClick={addTask} disabled={busy}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--accent, #6366f1)', color: '#fff', cursor: busy ? 'wait' : 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {busy ? '…' : '添加'}
          </button>
        </div>
        <div style={{ minHeight: 16, fontSize: 12 }}>
          {errTitle && <span style={{ color: '#ef4444' }}>请输入任务标题</span>}
          {errTarget && <span style={{ color: '#ef4444', marginLeft: 8 }}>目标值需大于 0</span>}
        </div>
      </div>

      {/* 当日完成进度 */}
      {activePlans.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>当日完成</span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg, #f5f5f7)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: 'var(--accent)', transition: 'width 0.2s' }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>{doneCount} / {activePlans.length}</span>
        </div>
      )}

      {/* 时间槽时间线 */}
      <div className="timeline">
        {slots.map(s => (
          <div className="tl-row" key={s.time}>
            <span className="tl-time">{s.time}</span>
            {s.content || <div className="tl-block empty" />}
          </div>
        ))}
      </div>

      {review && review.rawInput && (
        <div style={{ marginTop: 12, padding: 12, background: 'var(--bg)', borderRadius: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>复盘摘要</div>
          {review.completed && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
              <span style={{ color: 'var(--success)' }}>完成:</span> {review.completed}
            </div>
          )}
          {review.obstacles && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
              <span style={{ color: 'var(--error)' }}>障碍:</span> {review.obstacles}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function avgScore(report?: { capabilityDeltas?: Array<{ score?: number }> }): number | null {
  const deltas = report?.capabilityDeltas;
  if (!deltas || deltas.length === 0) return null;
  const sum = deltas.reduce((acc: number, d) => acc + (d.score ?? 0), 0);
  return Math.round((sum / deltas.length) * 10) / 10;
}
