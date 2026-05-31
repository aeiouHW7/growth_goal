import { useState, useEffect } from 'react';
import { api } from '../api';
import type { YearlyGoal, MonthlyPlan } from '../api';
import { LoadingState } from './EmptyState';
import '../styles/calendar.css';

interface Props {
  year: number;
  onMonthSelect?: (month: number) => void;
}

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function getRatingEmoji(rate?: number): string {
  if (rate == null) return '⬜';
  if (rate >= 80) return '🟢';
  if (rate >= 50) return '🟡';
  return '🔴';
}

export function YearGrid({ year, onMonthSelect }: Props) {
  const [yearlyGoals, setYearlyGoals] = useState<YearlyGoal[] | null>(undefined);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[] | null>(undefined);

  useEffect(() => {
    api.getYearlyGoals(year).then(setYearlyGoals).catch(() => setYearlyGoals(null));
    api.getMonthlyPlans(year).then(setMonthlyPlans).catch(() => setMonthlyPlans(null));
  }, [year]);

  if (yearlyGoals === undefined || monthlyPlans === undefined) return <LoadingState />;

  // Calculate completion rate per month
  const monthRates: number[] = Array(12).fill(0);
  const monthCounts: number[] = Array(12).fill(0);

  (monthlyPlans || []).forEach(mp => {
    const idx = mp.month - 1;
    if (idx >= 0 && idx < 12) {
      const cur = parseFloat(mp.currentValue || '0');
      const tgt = parseFloat(mp.targetValue || '0');
      if (tgt > 0) {
        monthRates[idx] += Math.min(cur / tgt, 1);
        monthCounts[idx]++;
      }
    }
  });

  const monthAvgRate = monthRates.map((sum, i) =>
    monthCounts[i] > 0 ? Math.round((sum / monthCounts[i]) * 100) : 0
  );

  return (
    <div>
      <div className="cal-month-title">{year}年 年度概览</div>
      <div className="year-grid">
        {monthNames.map((name, i) => (
          <div className="year-month-card" key={i} onClick={() => onMonthSelect?.(i + 1)}>
            <div className="year-month-name">{name}</div>
            <div className="year-month-rating">{getRatingEmoji(monthAvgRate[i])}</div>
            <div className="year-month-pct">
              {monthCounts[i] > 0 ? `${monthAvgRate[i]}%` : '暂无数据'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
