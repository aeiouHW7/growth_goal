import { useState, useEffect } from 'react';
import { api, ARCHIVE_API } from '../api';
import type { LifeGoal, YearlyGoal, MonthlyPlan, Suggestion, DailyPlan } from '../api';
import { Card } from '../components/Card';
import { UserPopover } from '../components/UserPopover';
import { EmptyState, LoadingState, ErrorState } from '../components/EmptyState';
import { AISuggestModal } from '../components/AISuggestModal';
import '../styles/overview.css';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function getWeekDates(): string[] {
  const d = new Date();
  const day = d.getDay();
  const monOffset = day === 0 ? -6 : 1 - day;
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(d);
    date.setDate(d.getDate() + monOffset + i);
    days.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
  }
  return days;
}

const weekdayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export function OverviewPage({ onGoArchive }: { onGoArchive?: () => void }) {
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[] | null | undefined>(undefined);
  const [yearlyGoals, setYearlyGoals] = useState<YearlyGoal[] | null | undefined>(undefined);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[] | null | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null | undefined>(undefined);
  const [weeklyPlans, setWeeklyPlans] = useState<Record<string, DailyPlan[]>>({});
  const [error, setError] = useState(false);
  const [noUser, setNoUser] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [summaryState, setSummaryState] = useState<'loading' | 'empty' | 'generating' | 'ready'>('loading');
  const [summaryText, setSummaryText] = useState('');

  const load = () => {
    setError(false);
    setNoUser(false);

    api.getLifeGoals()
      .then(setLifeGoals)
      .catch(() => {
        setLifeGoals(null);
        setNoUser(true);
      });

    api.getYearlyGoals(currentYear)
      .then(setYearlyGoals)
      .catch(() => setYearlyGoals(null));

    api.getMonthlyPlans(currentYear, currentMonth)
      .then(setMonthlyPlans)
      .catch(() => setMonthlyPlans(null));

    api.getSuggestions()
      .then(setSuggestions)
      .catch(() => setSuggestions(null));

    // Load this week's daily plans
    const weekDates = getWeekDates();
    Promise.all(weekDates.map(dateStr =>
      api.getDailyPlans(dateStr).then(plans => ({ dateStr, plans })).catch(() => ({ dateStr, plans: [] as DailyPlan[] }))
    )).then(results => {
      const map: Record<string, DailyPlan[]> = {};
      results.forEach(r => { map[r.dateStr] = r.plans; });
      setWeeklyPlans(map);
    });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve(); // 确保 load 内 setState 在微任务后，规避 set-state-in-effect
      if (cancelled) return;
      load();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LifeArchive 摘要卡片三态加载（VS5）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const arc = await ARCHIVE_API.get();
        if (cancelled) return;
        if (!arc) setSummaryState('empty');
        else if (arc.summary) { setSummaryText(arc.summary); setSummaryState('ready'); }
        else setSummaryState('generating');
      } catch {
        if (!cancelled) setSummaryState('empty');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function refreshSummary() {
    try {
      const s = await ARCHIVE_API.refreshSummary();
      setSummaryText(s?.summary || '');
      setSummaryState(s?.summary ? 'ready' : 'generating');
    } catch {
      setSummaryState('generating');
    }
  }

  if (lifeGoals === undefined) return <LoadingState />;

  if (noUser || (lifeGoals && lifeGoals.length === 0)) {
    return <EmptyState />;
  }

  if (error) return <ErrorState onRetry={load} />;

  const activeYearlyGoals = yearlyGoals?.filter(g => g.status === 'ACTIVE') || [];
  const lifeGoal = lifeGoals?.[0];

  const getPct = (current?: string, target?: string, start?: string): number => {
    const cur = parseFloat(current || '0');
    const tgt = parseFloat(target || '1');
    const st = start ? parseFloat(start) : undefined;
    if (!tgt || isNaN(cur)) return 0;
    let pct: number;
    if (st != null && !isNaN(st) && tgt !== st) {
      pct = Math.min((cur - st) / (tgt - st) * 100, 100);
    } else {
      pct = (cur / tgt) * 100;
    }
    return Math.max(0, Math.round(pct));
  };

  const pctColor = (pct: number) => {
    if (pct >= 100) return 'green';
    if (pct >= 50) return 'yellow';
    return 'red';
  };

  const weekDates = getWeekDates();

  return (
    <div className="overview-page">
      <div className="overview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{currentYear}年{currentMonth}月{now.getDate()}日</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowSuggest(true)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--accent, #6366f1)',
              background: '#fff', color: 'var(--accent, #6366f1)', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
            }}
          >
            🤖 AI 建议年度目标
          </button>
          <UserPopover />
        </div>
      </div>

      {/* LifeArchive 摘要卡片（VS5，渐变背景对齐原型） */}
      <div style={{ background: 'linear-gradient(150deg, #eef2ff 0%, #f5f8ff 60%, #fff 100%)', border: '1px solid #c7d2fe', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>🤖 AI 对你了解</h3>
          {summaryState === 'ready' && (
            <span onClick={onGoArchive} style={{ fontSize: 12, color: 'var(--accent)', cursor: onGoArchive ? 'pointer' : 'default' }}>编辑档案 →</span>
          )}
        </div>
        {summaryState === 'loading' && (
          <div>
            <div style={{ height: 12, borderRadius: 4, background: 'var(--bg)', marginBottom: 6 }} />
            <div style={{ height: 12, borderRadius: 4, background: 'var(--bg)', width: '70%' }} />
          </div>
        )}
        {summaryState === 'ready' && (
          <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{summaryText}</div>
        )}
        {summaryState === 'generating' && (
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            <div style={{ height: 12, borderRadius: 4, background: 'var(--bg)', marginBottom: 6 }} />
            <div style={{ height: 12, borderRadius: 4, background: 'var(--bg)', width: '60%' }} />
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>摘要生成中…</span>
              <button onClick={refreshSummary} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}>刷新</button>
            </div>
          </div>
        )}
        {summaryState === 'empty' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>AI 还无法了解你，填写人生档案后生成专属画像</div>
            <button onClick={onGoArchive} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: onGoArchive ? 'pointer' : 'default' }}>
              填写档案 →
            </button>
          </div>
        )}
      </div>

      {/* Life Goal */}
      <Card title="人生总目标" action={<span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 400 }}>10-20年</span>}>
        <div className="life-goal-title">{lifeGoal?.title || '设定你的人生目标'}</div>
        {lifeGoal?.description && <div className="life-goal-sub">{lifeGoal.description}</div>}
      </Card>

      {/* Active Yearly Goals */}
      <Card title="进行中的年度目标" action={<span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 400 }}>{currentYear}</span>}>
        {activeYearlyGoals.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '8px 0' }}>暂无进行中的年度目标</div>
        ) : activeYearlyGoals.map(goal => {
          const pct = getPct(goal.currentValue, goal.targetValue, goal.startValue);
          return (
            <div className="goal-item" key={goal.id}>
              <span className={`goal-dot ${pct >= 80 ? 'green' : 'yellow'}`} />
              <span className="goal-title">{goal.title}</span>
              <span className="goal-value">{pct}%</span>
              <div className="goal-bar-wrap">
                <div className="progress-bar">
                  <div className={`progress-fill ${pctColor(pct)}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Weekly Plan (5.18-5.24) */}
      <Card title="本周计划" action={<span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 400 }}>5.18 - 5.24</span>}>
        {weekDates.map((dateStr, i) => {
          const plans = weeklyPlans[dateStr] || [];
          if (plans.length === 0) return null;
          const dateObj = new Date(dateStr);
          return (
            <div className="goal-item" key={dateStr}>
              <span style={{ width: 32, fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>
                {weekdayLabels[i]}
              </span>
              <span style={{ width: 36, fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>
                {dateObj.getDate()}日
              </span>
              <span className="goal-title" style={{ fontSize: 12 }}>
                {plans.map(p => p.title).join('、')}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                {plans.filter(p => p.status === 'COMPLETED').length}/{plans.length}
              </span>
            </div>
          );
        })}
        {Object.values(weeklyPlans).every(p => p.length === 0) && (
          <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '8px 0' }}>暂无本周计划</div>
        )}
      </Card>

      {/* AI Suggestions */}
      <Card title="AI 建议改进点">
        {suggestions && suggestions.length > 0 ? (
          suggestions.map((s, i) => (
            <div className={`ai-msg ${s.type === 'positive' ? 'green' : s.type === 'warning' ? 'yellow' : 'red'}`} key={i}>
              {s.message}
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '8px 0' }}>
            暂无 AI 建议，完成一些每日复盘后将会生成
          </div>
        )}
      </Card>

      {/* Monthly Progress */}
      <Card title="目标完成进度" action={<span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 400 }}>{monthNames[currentMonth - 1]}</span>}>
        {monthlyPlans && monthlyPlans.length > 0 ? (
          monthlyPlans.map(plan => {
            const pct = getPct(plan.currentValue, plan.targetValue);
            return (
              <div className="monthly-progress-item" key={plan.id}>
                <div className="monthly-progress-header">
                  <span className="monthly-progress-label">{plan.title}</span>
                  <span className={`monthly-progress-value ${pctColor(pct)}`}>
                    {plan.currentValue || '0'} / {plan.targetValue}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${pctColor(pct)}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '8px 0' }}>暂无当月计划数据</div>
        )}
      </Card>

      {showSuggest && (
        <AISuggestModal
          mode="yearly"
          onClose={() => setShowSuggest(false)}
          onConfirm={load}
        />
      )}
    </div>
  );
}
