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

function getWeekday(year: number, month: number, day: number): string {
  const d = new Date(year, month - 1, day);
  const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
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

  const today = new Date();
  const fallbackDay = (today.getFullYear() === year && today.getMonth() + 1 === month)
    ? today.getDate() : 1;
  const day = propDay ?? fallbackDay;
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const load = () => {
    setError(false);
    Promise.all([
      api.getDailyPlans(dateStr).then(setPlans).catch(() => setPlans(null)),
      api.getDailyReview(dateStr).then(setReview).catch(() => setReview(null)),
    ]);
  };

  // 初始加载：所有 setState 在 await 之后，避免 effect 内同步 setState
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
    })();
    return () => { cancelled = true; };
  }, [dateStr]);

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
      load();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  // 勾选完成：PENDING→IN_PROGRESS→COMPLETED（后端单向状态机），IN_PROGRESS→COMPLETED
  async function toggleTask(plan: DailyPlan) {
    setBusy(true);
    try {
      if (plan.status === 'PENDING') {
        await api.updateDailyPlanStatus(plan.id, 'IN_PROGRESS');
      }
      await api.updateDailyPlanStatus(plan.id, 'COMPLETED');
      load();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  // 软删：仅 PENDING 允许 → CANCELLED
  async function deleteTask(plan: DailyPlan) {
    setBusy(true);
    try {
      await api.updateDailyPlanStatus(plan.id, 'CANCELLED');
      load();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (plans === undefined) return <LoadingState />;
  if (error) return <ErrorState onRetry={load} />;

  const activePlans = (plans ?? []).filter(p => p.status !== 'CANCELLED');
  const doneCount = activePlans.filter(p => p.status === 'COMPLETED').length;
  const pct = activePlans.length ? Math.round(doneCount / activePlans.length * 100) : 0;
  const meta = METRIC_META[metricType] || METRIC_META.NUMERIC;

  return (
    <div>
      <div className="cal-month-title">
        {year}年{String(month).padStart(2, '0')}月{String(day).padStart(2, '0')}日 {getWeekday(year, month, day)}
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
          <select
            value={metricType}
            onChange={e => setMetricType(e.target.value)}
            style={{ padding: '7px 6px', borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', fontSize: 12 }}
          >
            <option value="NUMERIC">数值</option>
            <option value="DURATION">时长</option>
            <option value="FREQUENCY">次数</option>
            <option value="PERCENTAGE">百分比</option>
            <option value="STAGE">里程碑</option>
          </select>
          <input
            value={targetValue} onChange={e => { setTargetValue(e.target.value); setErrTarget(false); }}
            placeholder={`目标值${meta.unit ? `（${meta.unit}）` : ''}`}
            type="number" min={0}
            onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
            style={{ width: 90, padding: '7px 10px', borderRadius: 8, border: `1px solid ${errTarget ? '#ef4444' : 'var(--border, #e5e7eb)'}`, fontSize: 13 }}
          />
          <button
            onClick={addTask} disabled={busy}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--accent, #6366f1)', color: '#fff', cursor: busy ? 'wait' : 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}
          >
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
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: 'var(--success, #22c55e)', transition: 'width 0.2s' }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>{doneCount} / {activePlans.length}</span>
        </div>
      )}

      {activePlans.length > 0 ? (
        activePlans.map(plan => {
          const isCompleted = plan.status === 'COMPLETED';
          const isCancelled = plan.status === 'CANCELLED';
          return (
            <div className="day-timeline-item" key={plan.id} style={{ opacity: isCancelled ? 0.5 : 1 }}>
              <div className="day-time-block">全天</div>
              <div className="day-content">
                <div className="day-task-title" style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                  {plan.title}
                  {isCancelled && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)' }}>已取消</span>}
                </div>
                <div className="day-task-meta">
                  {METRIC_META[plan.metricType]?.label || plan.metricType}: {plan.currentValue || '0'} / {plan.targetValue}
                  {isCompleted ? ' ✅' : plan.status === 'IN_PROGRESS' ? ' ⏳' : ''}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {!isCompleted && !isCancelled && (
                    <button
                      onClick={() => toggleTask(plan)} disabled={busy}
                      style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid var(--success, #22c55e)', color: 'var(--success, #22c55e)', background: '#fff', cursor: busy ? 'wait' : 'pointer' }}
                    >
                      ✓ 完成
                    </button>
                  )}
                  {plan.status === 'PENDING' && (
                    <button
                      onClick={() => deleteTask(plan)} disabled={busy}
                      style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid var(--error, #ef4444)', color: 'var(--error, #ef4444)', background: '#fff', cursor: busy ? 'wait' : 'pointer' }}
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🌱</div>
          今天还没有任务，在上方写下第一件事
        </div>
      )}

      {review && (
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
