import { useState, useEffect } from 'react';
import { api } from '../api';
import type { CalendarDay } from '../api';
import { LoadingState, ErrorState } from './EmptyState';
import '../styles/calendar.css';

interface Props {
  year: number;
  month: number;
  onDaySelect?: (dateStr: string) => void;
}

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日'];

function getFirstDayOfMonth(year: number, month: number): number {
  // Returns 0=Mon ... 6=Sun
  const day = new Date(year, month - 1, 1).getDay();
  // Convert JS Sunday=0 to Monday=0
  return day === 0 ? 6 : day - 1;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function CalendarGrid({ year, month, onDaySelect }: Props) {
  const [data, setData] = useState<CalendarDay[] | null>(undefined);
  const [error, setError] = useState(false);

  const load = () => {
    setError(false);
    api.getCalendar(year, month)
      .then(cal => setData(cal.days))
      .catch(() => setError(true));
  };

  useEffect(load, [year, month]);

  if (data === undefined) return <LoadingState />;
  if (error) return <ErrorState onRetry={load} />;

  const dayMap = new Map<string, CalendarDay>();
  if (data) {
    data.forEach(d => {
      const parts = d.date.split('-');
      const dayNum = parseInt(parts[2], 10);
      dayMap.set(String(dayNum), d);
    });
  }

  const firstDayOffset = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1 || 12);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cells: Array<{ day: number; isOther: boolean; data?: CalendarDay; isToday: boolean }> = [];

  // Previous month padding
  for (let i = firstDayOffset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, isOther: true, isToday: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: d,
      isOther: false,
      data: dayMap.get(String(d)),
      isToday: dateStr === todayStr,
    });
  }

  // Next month padding to fill grid
  const remaining = 7 - (cells.length % 7 || 7);
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, isOther: true, isToday: false });
  }

  const getDotColor = (day?: CalendarDay) => {
    if (!day) return null;
    if (day.analysisScore != null) {
      if (day.analysisScore >= 80) return 'green';
      if (day.analysisScore >= 60) return 'yellow';
      return 'red';
    }
    if (day.hasReview) return 'gray';
    return null;
  };

  const handleDayClick = (cell: typeof cells[0]) => {
    if (cell.isOther) return;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
    onDaySelect?.(dateStr);
  };

  return (
    <div>
      <div className="cal-month-title">{year}年{month}月</div>

      <div className="cal-grid">
        {weekdayLabels.map(w => (
          <div className="cal-header" key={w}>{w}</div>
        ))}
        {cells.map((cell, i) => {
          const dotColor = getDotColor(cell.data);
          const hasData = !!dotColor;
          return (
            <div
              key={i}
              className={`cal-cell ${cell.isOther ? 'other-month' : ''} ${hasData ? 'has-data' : ''} ${cell.isToday ? 'today' : ''} ${!cell.isOther ? 'clickable' : ''}`}
              onClick={() => handleDayClick(cell)}
            >
              <div className="day-num">{cell.day}</div>
              {dotColor && <span className={`goal-dot ${dotColor}`} />}
            </div>
          );
        })}
      </div>

      <div className="cal-legend">
        <span className="goal-dot green" /> 优秀
        <span className="goal-dot yellow" style={{ marginLeft: 8 }} /> 良好
        <span className="goal-dot red" style={{ marginLeft: 8 }} /> 差
        <span className="goal-dot gray" style={{ marginLeft: 8 }} /> 缺卡
      </div>
    </div>
  );
}
