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

export function DayTimeline({ year, month, day: propDay }: Props) {
  const [plans, setPlans] = useState<DailyPlan[] | null>(undefined);
  const [review, setReview] = useState<Review | null>(undefined);
  const [error, setError] = useState(false);

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

  useEffect(load, [dateStr]);

  if (plans === undefined) return <LoadingState />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div>
      <div className="cal-month-title">
        {year}年{String(month).padStart(2, '0')}月{String(day).padStart(2, '0')}日 {getWeekday(year, month, day)}
      </div>

      {plans && plans.length > 0 ? (
        plans.map(plan => (
          <div className="day-timeline-item" key={plan.id}>
            <div className="day-time-block">全天</div>
            <div className="day-content">
              <div className="day-task-title">{plan.title}</div>
              <div className="day-task-meta">
                {plan.metricType}: {plan.currentValue || '0'} / {plan.targetValue}
                {plan.status === 'COMPLETED' ? ' ✅' : plan.status === 'IN_PROGRESS' ? ' ⏳' : ''}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
          暂无该日计划数据
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
