import { useState, useEffect } from 'react';
import { api } from '../api';
import type { DailyPlan } from '../api';
import { LoadingState } from './EmptyState';
import '../styles/calendar.css';

interface Props {
  year: number;
  month: number;
  selectedDay?: string;
  onDaySelect?: (dateStr: string) => void;
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
function pad2(n: number): string { return String(n).padStart(2, '0'); }

export function WeekTimeline({ year, month, selectedDay, onDaySelect }: Props) {
  const [plansMap, setPlansMap] = useState<Record<string, DailyPlan[]>>({});
  const [scoreMap, setScoreMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const refDate = (today.getFullYear() === year && today.getMonth() + 1 === month)
    ? today
    : new Date(year, month - 1, 15);
  const weekNum = getWeekNumber(refDate);
  const { start, end } = getWeekDateRange(year, weekNum);
  const todayStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      const days: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
      }
      const [results, cal] = await Promise.all([
        Promise.all(days.map(dateStr =>
          api.getDailyPlans(dateStr).then(plans => ({ dateStr, plans })).catch(() => ({ dateStr, plans: [] as DailyPlan[] }))
        )),
        api.getCalendar(year, month).catch(() => null),
      ]);
      if (cancelled) return;
      const map: Record<string, DailyPlan[]> = {};
      results.forEach(r => { map[r.dateStr] = r.plans; });
      setPlansMap(map);
      if (cal) {
        const sm: Record<string, number> = {};
        cal.days.forEach(d => { if (d.analysisScore != null) sm[d.date] = d.analysisScore; });
        setScoreMap(sm);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [year, month, weekNum]);

  if (loading) return <LoadingState />;

  const getDot = (dateStr: string): string | null => {
    const s = scoreMap[dateStr];
    if (s == null) return null;
    if (s >= 80) return 'green';
    if (s >= 60) return 'yellow';
    return 'red';
  };

  return (
    <div>
      <div className="cal-month-title">
        第{weekNum}周 ({start.getMonth() + 1}/{start.getDate()} - {end.getMonth() + 1}/{end.getDate()})
      </div>

      {Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        const plans = plansMap[dateStr] || [];
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selectedDay;
        const dot = getDot(dateStr);

        return (
          <div
            className={`week-day-row ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
            key={i}
            onClick={() => onDaySelect?.(dateStr)}
            role={onDaySelect ? 'button' : undefined}
            tabIndex={onDaySelect ? 0 : undefined}
            onKeyDown={onDaySelect ? (e) => { if (e.key === 'Enter') onDaySelect(dateStr); } : undefined}
          >
            <span className="week-day-name">{weekdayLabels[i]}</span>
            <span className="week-day-date">{d.getMonth() + 1}/{d.getDate()}</span>
            <span className="week-day-summary">
              {plans.length > 0
                ? plans.map(p => p.title).join('、')
                : '暂无计划'}
            </span>
            {dot && <span className={`cal-dot ${dot}`} />}
            <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>
              {plans.filter(p => p.status === 'COMPLETED').length}/{plans.length}
            </span>
          </div>
        );
      })}
    </div>
  );
}
