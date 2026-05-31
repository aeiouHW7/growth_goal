import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { PeriodSelector } from '../components/PeriodSelector';
import { CalendarGrid } from '../components/CalendarGrid';
import { YearGrid } from '../components/YearGrid';
import { WeekTimeline } from '../components/WeekTimeline';
import { DayTimeline } from '../components/DayTimeline';
import { PlanPanel } from '../components/PlanPanel';
import { EvalPanel } from '../components/EvalPanel';
import { ReportPanel } from '../components/ReportPanel';
import { StructuredReportPanel } from '../components/StructuredReportPanel';
import { api } from '../api';
import type { MonthlyPlan, MonthlyReviewData, DailyPlan } from '../api';
import '../styles/panels.css';

type Dimension = 'year' | 'month' | 'week' | 'day';
type Panel = 'plan' | 'eval' | 'report';

const now = new Date();
const defaultYear = now.getFullYear();
const defaultMonth = now.getMonth() + 1;

function avgCapabilityScore(report?: any): number | undefined {
  const deltas = report?.capabilityDeltas;
  if (!deltas || !Array.isArray(deltas) || deltas.length === 0) return undefined;
  const sum = deltas.reduce((acc: number, d: any) => acc + (d.score ?? 0), 0);
  return Math.round((sum / deltas.length) * 10) / 10;
}

function getDotColor(value?: string, target?: string): string {
  const cur = parseFloat(value || '0');
  const tgt = parseFloat(target || '1');
  if (!tgt || isNaN(cur)) return 'gray';
  const pct = cur / tgt;
  if (pct >= 1) return 'green';
  if (pct >= 0.5) return 'yellow';
  return 'yellow';
}

function getWeekDateRangeForMonth(year: number, month: number) {
  const today = new Date();
  const refDate = (today.getFullYear() === year && today.getMonth() + 1 === month)
    ? today
    : new Date(year, month - 1, 15);
  const jan4 = new Date(year, 0, 4);
  const dayOffset = ((jan4.getDay() + 6) % 7);
  refDate.setHours(0, 0, 0, 0);
  refDate.setDate(refDate.getDate() + 3 - ((refDate.getDay() + 6) % 7));
  const weekNum = 1 + Math.round(((refDate.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
  const start = new Date(year, 0, 4 - dayOffset + (weekNum - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end, weekNum };
}

export function PlansPage() {
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [dimension, setDimension] = useState<Dimension>('month');
  const [activePanel, setActivePanel] = useState<Panel>('plan');
  const [selectedDay, setSelectedDay] = useState<number | undefined>(undefined);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[] | null>(undefined);
  const [monthlyReview, setMonthlyReview] = useState<MonthlyReviewData | null>(undefined);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [dailyReview, setDailyReview] = useState<any>(null);
  // 月视图降级：当月最新日复盘的分析报告
  const [latestMonthAnalysis, setLatestMonthAnalysis] = useState<any>(undefined);

  // Fetch monthly data
  useEffect(() => {
    api.getMonthlyPlans(year, month)
      .then(setMonthlyPlans)
      .catch(() => setMonthlyPlans(null));
    api.getMonthlyReview(year, month)
      .then(setMonthlyReview)
      .catch(() => setMonthlyReview(null));
  }, [year, month]);

  // 月视图降级：获取当月最新日复盘分析
  useEffect(() => {
    if (dimension !== 'month') {
      setLatestMonthAnalysis(undefined);
      return;
    }
    api.getCalendar(year, month).then(cal => {
      const reviewDays = cal.days.filter(d => d.hasReview).sort((a, b) => b.date.localeCompare(a.date));
      if (reviewDays.length === 0) { setLatestMonthAnalysis(null); return; }
      const latest = reviewDays[0];
      api.getDailyReview(latest.date).then(r => {
        const analysis = r?.aiAnalyses?.[0]?.structuredReport;
        setLatestMonthAnalysis(analysis || null);
      }).catch(() => setLatestMonthAnalysis(null));
    }).catch(() => setLatestMonthAnalysis(null));
  }, [year, month, dimension]);

  // Fetch daily plans and daily review (for day/week modes)
  useEffect(() => {
    if (dimension === 'day' && selectedDay) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      api.getDailyPlans(dateStr).then(setDailyPlans).catch(() => setDailyPlans([]));
      api.getDailyReview(dateStr).then(setDailyReview).catch(() => setDailyReview(null));
      return;
    }
    if (dimension !== 'week') {
      setDailyPlans([]);
      setDailyReview(null);
      return;
    }
    const { start, end } = getWeekDateRangeForMonth(year, month);
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    Promise.all(days.map(dateStr =>
      api.getDailyPlans(dateStr).then(plans => plans).catch(() => [] as DailyPlan[])
    )).then(results => {
      setDailyPlans(results.flat());
    });
    // Fetch today's daily review for analysis
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    if (days.includes(today)) {
      api.getDailyReview(today).then(setDailyReview).catch(() => setDailyReview(null));
    }
  }, [year, month, dimension, selectedDay]);

  const monthlyPlanItems = (monthlyPlans || []).map(mp => ({
    title: mp.title,
    dotColor: getDotColor(mp.currentValue, mp.targetValue),
    meta: `目标: ${mp.targetValue}`,
  }));

  const dailyPlanItems = dailyPlans.map(dp => ({
    title: dp.title,
    dotColor: getDotColor(dp.currentValue, dp.targetValue),
    meta: dp.date ? new Date(dp.date).getDate() + '日' : '',
  }));

  const getPlanPanelTitle = () => {
    switch (dimension) {
      case 'year': return `${year}年计划`;
      case 'month': return `${month}月计划`;
      case 'week': {
        const { start, end, weekNum } = getWeekDateRangeForMonth(year, month);
        return `第${weekNum}周 (${start.getMonth()+1}.${start.getDate()} - ${end.getMonth()+1}.${end.getDate()})`;
      }
      case 'day': return `${month}月${selectedDay || ''}日计划`;
    }
  };

  const getPlanPanelItems = () => {
    switch (dimension) {
      case 'year':
      case 'month':
        return monthlyPlanItems;
      case 'week':
      case 'day':
        return dailyPlanItems.length > 0 ? dailyPlanItems : monthlyPlanItems;
    }
  };

  const getPlanPanelEmptyHint = () => {
    if (dimension === 'day' && dailyPlanItems.length === 0 && monthlyPlanItems.length > 0) {
      return '该日暂无日计划，下方展示当月月计划';
    }
    return undefined;
  };

  const renderLeftView = () => {
    switch (dimension) {
      case 'year':
        return <YearGrid year={year} onMonthSelect={(m) => { setMonth(m); setDimension('month'); setSelectedDay(undefined); }} />;
      case 'month':
        return <CalendarGrid year={year} month={month} onDaySelect={(dateStr) => {
          const [y, m, d] = dateStr.split('-').map(Number);
          setYear(y); setMonth(m); setSelectedDay(d); setDimension('day');
        }} />;
      case 'week':
        return <WeekTimeline year={year} month={month} />;
      case 'day':
        return <DayTimeline year={year} month={month} day={selectedDay} />;
    }
  };

  const renderRightPanel = () => {
    switch (activePanel) {
      case 'plan':
        return (
          <PlanPanel
            title={getPlanPanelTitle()}
            items={getPlanPanelItems()}
            emptyHint={getPlanPanelEmptyHint()}
          />
        );
      case 'eval':
        // 日视图：用日复盘数据
        if (dimension === 'day' || dimension === 'week') {
          const da = dailyReview?.aiAnalyses?.[0]?.structuredReport;
          const aiScore = avgCapabilityScore(da) ?? monthlyReview?.analysisScore;
          return (
            <EvalPanel
              score={aiScore}
              completionRate={da?.completionSummary?.completionRate != null ? parseFloat(da.completionSummary.completionRate) / 100 : monthlyReview?.completionRate}
              dailyMetrics={da ? { energyRate: da.energyRate, postureDone: da.postureTraining?.completed } : undefined}
            />
          );
        }
        // 月视图降级：没月度复盘时用日复盘数据
        const evalRating = monthlyReview?.rating;
        const evalScore = monthlyReview?.analysisScore;
        const evalRate = monthlyReview?.completionRate;
        const hasFallback = dimension === 'month' && !monthlyReview && latestMonthAnalysis != null;
        return (
          <EvalPanel
            rating={evalRating}
            score={evalScore}
            completionRate={evalRate}
            fallbackLabel={hasFallback ? '暂无月度评估（展示最近日复盘）' : undefined}
            fallbackScore={avgCapabilityScore(latestMonthAnalysis)}
          />
        );
      case 'report': {
        const dailyAnalysis = dailyReview?.aiAnalyses?.[0]?.structuredReport;
        const monthAnalysis = dimension === 'month' ? latestMonthAnalysis : null;
        const monthlyRevAnalysis = monthlyReview?.aiAnalyses?.[0]?.structuredReport;
        const report = dailyAnalysis || monthAnalysis || monthlyRevAnalysis;
        return report ? <StructuredReportPanel report={report} /> : <ReportPanel sections={[]} />;
      }
    }
  };

  return (
    <div>
      <Card>
        <PeriodSelector
          year={year}
          month={month}
          dimension={dimension}
          onYearChange={(y) => { setYear(y); setSelectedDay(undefined); }}
          onMonthChange={(m) => { setMonth(m); setSelectedDay(undefined); }}
          onDimensionChange={(d) => { if (d !== 'day') setSelectedDay(undefined); setDimension(d); }}
        />

        <div className="plans-layout">
          <div className="plans-left">
            {renderLeftView()}
          </div>

          <div className="plans-right">
            <div className="panel-tabs">
              {(['plan', 'eval', 'report'] as Panel[]).map(p => (
                <button
                  key={p}
                  className={`panel-tab ${activePanel === p ? 'active' : ''}`}
                  onClick={() => setActivePanel(p)}
                >
                  {{ plan: '计划', eval: '评估', report: '报告' }[p]}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 0, padding: 16, background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
              {renderRightPanel()}
            </div>

            <div className="plans-right-tip">
              点击年份卡片中的月份可查看月计划，点击日历中的日期可查看日数据
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
