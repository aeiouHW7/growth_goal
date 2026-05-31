import { useState, useEffect } from 'react';
import { api } from '../api';
import type { DailyPlan } from '../api';
import { LoadingState, ErrorState } from './EmptyState';
import '../styles/calendar.css';

interface Props {
  year: number;
  month: number;
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function getWeekDateRange(year: number, week: number): { start: Date; end: Date } {
  const jan4 = new Date(year, 0, 4);
  const dayOffset = ((jan4.getDay() + 6) % 7);
  const start = new Date(year, 0, 4 - dayOffset + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

const weekdayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export function WeekTimeline({ year, month }: Props) {
  const [plansMap, setPlansMap] = useState<Record<string, DailyPlan[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Use today's week when it falls in the selected month, otherwise use mid-month
  const today = new Date();
  const refDate = (today.getFullYear() === year && today.getMonth() + 1 === month)
    ? today
    : new Date(year, month - 1, 15);
  const weekNum = getWeekNumber(refDate);
  const { start, end } = getWeekDateRange(year, weekNum);

  const load = () => {
    setError(false);
    setLoading(true);

    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }

    Promise.all(days.map(dateStr =>
      api.getDailyPlans(dateStr).then(plans => ({ dateStr, plans })).catch(() => ({ dateStr, plans: [] as DailyPlan[] }))
    )).then(results => {
      const map: Record<string, DailyPlan[]> = {};
      results.forEach(r => { map[r.dateStr] = r.plans; });
      setPlansMap(map);
      setLoading(false);
    });
  };

  useEffect(load, [year, month, weekNum]);

  if (loading) return <LoadingState />;

  const getStatusDot = (status: string) => {
    if (status === 'COMPLETED') return 'green';
    if (status === 'IN_PROGRESS') return 'yellow';
    return 'gray';
  };

  return (
    <div>
      <div className="cal-month-title">
        第{weekNum}周 ({start.getMonth() + 1}/{start.getDate()} - {end.getMonth() + 1}/{end.getDate()})
      </div>

      {Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const plans = plansMap[dateStr] || [];

        return (
          <div className="week-day-row" key={i}>
            <span className="week-day-name">{weekdayLabels[i]}</span>
            <span className="week-day-date">{d.getMonth() + 1}/{d.getDate()}</span>
            <span className="week-day-summary">
              {plans.length > 0
                ? plans.map(p => p.title).join('、')
                : '暂无计划'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>
              {plans.filter(p => p.status === 'COMPLETED').length}/{plans.length}
            </span>
          </div>
        );
      })}
    </div>
  );
}
