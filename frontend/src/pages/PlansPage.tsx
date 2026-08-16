import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { PeriodSelector } from '../components/PeriodSelector';
import { CalendarGrid } from '../components/CalendarGrid';
import { YearGrid } from '../components/YearGrid';
import { WeekTimeline } from '../components/WeekTimeline';
import { DayTimeline } from '../components/DayTimeline';
import { PlanPanel } from '../components/PlanPanel';
import { EvalPanel } from '../components/EvalPanel';
import { StructuredReportPanel } from '../components/StructuredReportPanel';
import { api } from '../api';
import type { MonthlyPlan, MonthlyReviewData, DailyPlan, YearlyGoal, Review, StructuredReport } from '../api';
import { AISuggestModal } from '../components/AISuggestModal';
import '../styles/panels.css';

type Dimension = 'year' | 'month' | 'week' | 'day';
type Panel = 'plan' | 'eval' | 'report';

const now = new Date();
const defaultYear = now.getFullYear();
const defaultMonth = now.getMonth() + 1;

interface CapabilityDelta { score?: number }

function avgCapabilityScore(report?: { capabilityDeltas?: CapabilityDelta[] } | null): number | undefined {
  const deltas = report?.capabilityDeltas;
  if (!deltas || deltas.length === 0) return undefined;
  const sum = deltas.reduce((acc: number, d) => acc + (d.score ?? 0), 0);
  return Math.round((sum / deltas.length) * 10) / 10;
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

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${m}月${d}日`;
}

function pad2(n: number): string { return String(n).padStart(2, '0'); }

export function PlansPage() {
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [dimension, setDimension] = useState<Dimension>('month');
  const [initialized, setInitialized] = useState(false);
  // pin 联动：月/周视图点某天下钻，不切视图
  const [pinnedDay, setPinnedDay] = useState<string | undefined>(undefined);

  // First load: navigate to most recent month with review data
  useEffect(() => {
    if (initialized) return;
    api.getProgressOverview().then(overview => {
      const reviews = overview.recentReviews;
      if (reviews && reviews.length > 0) {
        const latest = reviews[0];
        const d = new Date(latest.date);
        const reviewYear = d.getFullYear();
        const reviewMonth = d.getMonth() + 1;
        if (reviewYear !== defaultYear || reviewMonth !== defaultMonth) {
          setYear(reviewYear);
          setMonth(reviewMonth);
        }
      }
      setInitialized(true);
    }).catch(() => setInitialized(true));
  }, [initialized]);
  const [activePanel, setActivePanel] = useState<Panel>('plan');
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestYearlyGoalId, setSuggestYearlyGoalId] = useState<string | undefined>(undefined);
  const [yearlyGoals, setYearlyGoals] = useState<YearlyGoal[]>([]);
  const [suggestHint, setSuggestHint] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | undefined>(undefined);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[] | null | undefined>(undefined);
  const [monthlyReview, setMonthlyReview] = useState<MonthlyReviewData | null | undefined>(undefined);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [dailyReview, setDailyReview] = useState<Review | null>(null);
  const [weeklyReview, setWeeklyReview] = useState<Review | null>(null);
  // 月视图降级：当月最新日复盘的分析报告
  const [latestMonthAnalysis, setLatestMonthAnalysis] = useState<StructuredReport | null | undefined>(undefined);

  // 当前聚焦的"日"（day 视图的 selectedDay 或 pin 的日期）
  const dayDateStr = (() => {
    if (dimension === 'day') {
      return selectedDay ? `${year}-${pad2(month)}-${pad2(selectedDay)}` : undefined;
    }
    return pinnedDay || undefined;
  })();

  // 右侧面板粒度：day（下钻）/ 周期（month/week/year）
  function rightMode(): Dimension {
    if (dimension === 'day') return 'day';
    if (dimension === 'year') return 'year';
    return dayDateStr ? 'day' : dimension;
  }

  const periodLabel = rightMode() === 'day'
    ? (dayDateStr ? fmtDate(dayDateStr) : '')
    : dimension === 'year' ? `${year}年`
    : dimension === 'week' ? `第${getWeekDateRangeForMonth(year, month).weekNum}周`
    : `${year}年${month}月`;

  // Load yearly goals for AI monthly suggestion
  useEffect(() => {
    api.getYearlyGoals(defaultYear).then(setYearlyGoals).catch(() => setYearlyGoals([]));
  }, []);

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
    if (dimension !== 'month' || pinnedDay) return;
    let cancelled = false;
    (async () => {
      try {
        const cal = await api.getCalendar(year, month);
        if (cancelled) return;
        const reviewDays = cal.days.filter(d => d.hasReview).sort((a, b) => b.date.localeCompare(a.date));
        if (reviewDays.length === 0) { setLatestMonthAnalysis(null); return; }
        const r = await api.getDailyReview(reviewDays[0].date).catch(() => null);
        if (cancelled) return;
        const analysis = r?.aiAnalyses?.[0]?.structuredReport;
        setLatestMonthAnalysis(analysis || null);
      } catch {
        if (!cancelled) setLatestMonthAnalysis(null);
      }
    })();
    return () => { cancelled = true; };
  }, [year, month, dimension, pinnedDay]);

  // Fetch daily plans and daily review（day 粒度 = 下钻目标天；week = 整周）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (dayDateStr) {
        const [p, r] = await Promise.all([
          api.getDailyPlans(dayDateStr).catch(() => [] as DailyPlan[]),
          api.getDailyReview(dayDateStr).catch(() => null),
        ]);
        if (cancelled) return;
        setDailyPlans(p);
        setDailyReview(r);
        return;
      }
      if (dimension !== 'week') {
        if (cancelled) return;
        setDailyPlans([]);
        setDailyReview(null);
        return;
      }
      const { start, weekNum } = getWeekDateRangeForMonth(year, month);
      const weekly = await api.getWeeklyReview(year, weekNum).catch(() => null);
      const days: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
      }
      const results = await Promise.all(days.map(dateStr =>
        api.getDailyPlans(dateStr).catch(() => [] as DailyPlan[])
      ));
      if (cancelled) return;
      setWeeklyReview(weekly);
      setDailyPlans(results.flat());
      const today = `${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}-${pad2(new Date().getDate())}`;
      if (days.includes(today)) {
        const r = await api.getDailyReview(today).catch(() => null);
        if (!cancelled) setDailyReview(r);
      }
    })();
    return () => { cancelled = true; };
  }, [year, month, dimension, selectedDay, pinnedDay]);

  // 目标数值已从展示移除：只保留标题、日期标签与状态，dot 用中性灰
  const monthlyPlanItems = (monthlyPlans || []).map(mp => ({
    id: mp.id,
    title: mp.title,
    dotColor: 'gray',
    status: mp.status,
  }));

  const dailyPlanItems = dailyPlans.map(dp => ({
    title: dp.title,
    dotColor: 'gray',
    meta: dp.date ? new Date(dp.date).getDate() + '日' : '',
    status: dp.status,
  }));

  const getPlanPanelTitle = () => {
    const mode = rightMode();
    switch (mode) {
      case 'year': return `${year}年计划`;
      case 'month': return `${month}月计划`;
      case 'week': {
        const { start, end, weekNum } = getWeekDateRangeForMonth(year, month);
        return `第${weekNum}周 (${start.getMonth()+1}.${start.getDate()} - ${end.getMonth()+1}.${end.getDate()})`;
      }
      case 'day': return dayDateStr ? `${fmtDate(dayDateStr)} 日计划` : '日计划';
    }
  };

  const getPlanPanelItems = () => {
    const mode = rightMode();
    switch (mode) {
      case 'year':
      case 'month':
        return monthlyPlanItems;
      case 'week':
      case 'day':
        return dailyPlanItems.length > 0 ? dailyPlanItems : monthlyPlanItems;
    }
  };

  const getPlanPanelEmptyHint = () => {
    if (rightMode() === 'day' && dailyPlanItems.length === 0 && monthlyPlanItems.length > 0) {
      return '该日暂无日计划，下方展示当月月计划';
    }
    return undefined;
  };

  const reloadMonthly = () =>
    api.getMonthlyPlans(year, month).then(setMonthlyPlans).catch(() => setMonthlyPlans(null));

  // pin 交互
  function handlePin(dateStr: string) {
    setPinnedDay(dateStr);
  }
  function unpin() {
    setPinnedDay(undefined);
  }

  const renderLeftView = () => {
    switch (dimension) {
      case 'year':
        return <YearGrid year={year} onMonthSelect={(m) => { setMonth(m); setDimension('month'); setSelectedDay(undefined); setPinnedDay(undefined); }} />;
      case 'month':
        return <CalendarGrid
          year={year}
          month={month}
          selectedDay={pinnedDay}
          onDaySelect={(dateStr) => { handlePin(dateStr); }} />;
      case 'week':
        return <WeekTimeline year={year} month={month} selectedDay={pinnedDay} onDaySelect={handlePin} />;
      case 'day':
        return <DayTimeline year={year} month={month} day={selectedDay} />;
    }
  };

  const renderRightPanel = () => {
    const mode = rightMode();
    switch (activePanel) {
      case 'plan':
        return (
          <PlanPanel
            title={getPlanPanelTitle()}
            items={getPlanPanelItems()}
            emptyHint={getPlanPanelEmptyHint()}
            mode={rightMode()}
            editable={rightMode() === 'month'}
            onEdit={async (id, data) => {
              await api.updateMonthlyPlan(id, data);
              reloadMonthly();
            }}
            onDelete={async (id) => {
              await api.deleteMonthlyPlan(id);
              reloadMonthly();
            }}
            onAdd={async (data) => {
              await api.createMonthlyPlan({ ...data, year, month });
              reloadMonthly();
            }}
          />
        );
      case 'eval': {
        if (mode === 'day') {
          const da = dailyReview?.aiAnalyses?.[0]?.structuredReport;
          const aiScore = avgCapabilityScore(da) ?? monthlyReview?.analysisScore;
          return (
            <EvalPanel
              score={aiScore}
              completionRate={da?.completionSummary?.completionRate != null ? parseFloat(da.completionSummary.completionRate) / 100 : monthlyReview?.completionRate}
              dailyMetrics={da ? { postureDone: da.postureTraining?.completed } : undefined}
            />
          );
        }
        const evalRating = monthlyReview?.rating;
        const evalScore = monthlyReview?.analysisScore;
        const evalRate = monthlyReview?.completionRate;
        const hasFallback = mode === 'month' && !monthlyReview && latestMonthAnalysis != null;
        return (
          <EvalPanel
            rating={evalRating}
            score={evalScore}
            completionRate={evalRate}
            fallbackLabel={hasFallback ? '暂无月度评估（展示最近日复盘）' : undefined}
            fallbackScore={avgCapabilityScore(latestMonthAnalysis)}
          />
        );
      }
      case 'report': {
        const dailyAnalysis = dailyReview?.aiAnalyses?.[0]?.structuredReport;
        const weekAnalysis = mode === 'week' ? weeklyReview?.aiAnalyses?.[0]?.structuredReport : null;
        const monthAnalysis = mode === 'month' ? latestMonthAnalysis : null;
        const monthlyRevAnalysis = monthlyReview?.aiAnalyses?.[0]?.structuredReport;
        const report = dailyAnalysis || weekAnalysis || monthAnalysis || monthlyRevAnalysis;
        const reportAnalysisId = dailyReview?.aiAnalyses?.[0]?.id ?? weeklyReview?.aiAnalyses?.[0]?.id ?? monthlyReview?.aiAnalyses?.[0]?.id;
        return report ? (
          <StructuredReportPanel report={report} analysisId={reportAnalysisId} />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: 14 }}>暂无可分析数据</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>完成复盘并生成分析后可在这里查看</div>
          </div>
        );
      }
    }
  };

  return (
    <div>
      <Card>
        {/* 周期状态 + 选择器 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'var(--accent-bg)', color: 'var(--accent)', fontWeight: 600 }}>
            {periodLabel}
          </span>
          <PeriodSelector
            year={year}
            month={month}
            dimension={dimension}
            onYearChange={(y) => { setYear(y); setSelectedDay(undefined); setPinnedDay(undefined); }}
            onMonthChange={(m) => { setMonth(m); setSelectedDay(undefined); setPinnedDay(undefined); }}
            onDimensionChange={(d) => { if (d !== 'day') setSelectedDay(undefined); setDimension(d); setPinnedDay(undefined); }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button
            onClick={() => {
              const active = yearlyGoals.filter(g => g.status === 'ACTIVE');
              if (active.length === 0) { setSuggestHint('请先创建进行中的年度目标，再使用 AI 建议月度计划'); return; }
              setSuggestHint(null);
              setSuggestYearlyGoalId(active[0].id);
              setShowSuggest(true);
            }}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--accent, #6366f1)',
              background: '#fff', color: 'var(--accent, #6366f1)', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
            }}
          >
            🤖 AI 建议月度计划
          </button>
        </div>
        {suggestHint && (
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>{suggestHint}</div>
        )}

        <div className="plans-layout">
          <div className="plans-left">
            {renderLeftView()}
          </div>

          <div className="plans-right">
            {/* Panel 状态栏（pin 指示） */}
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8, minHeight: 18 }}>
              {dimension !== 'day' && pinnedDay ? (
                <span>
                  📌 已定位 {fmtDate(pinnedDay)}
                  <a href="javascript:void(0)" onClick={unpin} style={{ color: 'var(--accent)', marginLeft: 8 }}>查看{dimension === 'week' ? '周' : '月'}汇总 →</a>
                </span>
              ) : (
                <span>{periodLabel}{dimension === 'month' || dimension === 'week' ? ' · 点击左侧日期可下钻到当天' : ''}</span>
              )}
            </div>

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
              点击年份卡片中的月份可查看月计划，点击日历中的日期可下钻到当天
            </div>
          </div>
        </div>
      </Card>

      {showSuggest && (
        <AISuggestModal
          mode="monthly"
          yearlyGoalId={suggestYearlyGoalId}
          onClose={() => setShowSuggest(false)}
          onConfirm={() => {
            api.getMonthlyPlans(year, month).then(setMonthlyPlans).catch(() => setMonthlyPlans(null));
          }}
        />
      )}
    </div>
  );
}
