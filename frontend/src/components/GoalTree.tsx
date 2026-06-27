import { useState, useEffect } from 'react';
import { api } from '../api';
import type { LifeGoal, YearlyGoal, MonthlyPlan } from '../api';
import { StatusBadge } from './StatusBadge';
import { LoadingState } from './EmptyState';
import '../styles/goal-tree.css';

type Filter = 'all' | 'active' | 'done';
type ViewMode = 'hierarchy' | 'time';

interface GoalNodeData {
  id: string;
  title: string;
  type: 'life' | 'yearly' | 'monthly';
  status: string;
  timeLabel?: string;
  progress?: { current?: string; target?: string; start?: string };
  children?: GoalNodeData[];
}

function GoalNode({ node, depth }: { node: GoalNodeData; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isDone = node.status === 'COMPLETED' || node.status === 'ABANDONED';

  const getPct = (current?: string, target?: string, start?: string): number => {
    const cur = parseFloat(current || '0');
    const tgt = parseFloat(target || '1');
    const st = start ? parseFloat(start) : undefined;
    if (!tgt || isNaN(cur)) return 0;
    let pct: number;
    if (st != null && !isNaN(st) && tgt !== st) {
      // 有起始值: 按增量计算 (cur - st) / (tgt - st)
      pct = Math.min((cur - st) / (tgt - st) * 100, 100);
    } else {
      // 无起始值: cur / tgt
      pct = (cur / tgt) * 100;
    }
    return Math.max(0, Math.round(pct));
  };

  const pctClass = (pct: number) => {
    if (pct >= 100) return 'green';
    if (pct >= 50) return 'yellow';
    return 'red';
  };

  const pct = node.progress ? getPct(node.progress.current, node.progress.target, node.progress.start) : 0;

  return (
    <div>
      <div className={`goal-node ${isDone ? 'done' : ''}`} onClick={() => setExpanded(!expanded)}>
        {hasChildren && <span className="goal-expand-icon">{expanded ? '▼' : '▶'}</span>}
        {!hasChildren && <span className="goal-expand-icon" />}
        <span className="goal-title-text">{node.title}</span>
        <StatusBadge status={node.status} />
        {node.timeLabel && <span className="goal-year-tag">{node.timeLabel}</span>}
        {node.progress && (
          <>
            <span className="goal-start-value">{node.progress.start}</span>
            <div className="goal-tree-bar">
              <div className="progress-bar">
                <div className={`progress-fill ${isDone ? 'gray' : pctClass(pct)}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="goal-target-value">{node.progress.target}</span>
            <span className="goal-value-text">{pct}%</span>
          </>
        )}
      </div>
      {expanded && hasChildren && (
        <div className="goal-children">
          {node.children!.map(child => (
            <GoalNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  filter: Filter;
  viewMode?: ViewMode;
}

function TimeView({ yearlyList, monthlyMap, filter }: { yearlyList: YearlyGoal[]; monthlyMap: Record<string, MonthlyPlan[]>; filter: Filter }) {
  // Group yearly goals by year
  const byYear: Record<number, YearlyGoal[]> = {};
  for (const yg of yearlyList) {
    if (!byYear[yg.year]) byYear[yg.year] = [];
    byYear[yg.year].push(yg);
  }
  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);

  const isActive = (s: string) => s === 'ACTIVE' || s === 'IN_PROGRESS';
  const isDone = (s: string) => s === 'COMPLETED' || s === 'ABANDONED';

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

  const pctClass = (pct: number) => {
    if (pct >= 100) return 'green';
    if (pct >= 50) return 'yellow';
    return 'red';
  };

  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    years.forEach(y => { init[y] = true; });
    return init;
  });

  const toggleYear = (year: number) => setExpandedYears(p => ({ ...p, [year]: !p[year] }));

  return (
    <div>
      {years.map(year => {
        const goals = byYear[year].filter(yg => {
          if (filter === 'all') return true;
          if (filter === 'active') return isActive(yg.status);
          return isDone(yg.status);
        });
        if (goals.length === 0) return null;

        const isExpanded = expandedYears[year] !== false;
        return (
          <div key={year} className="time-year-section">
            <div className="time-year-header" onClick={() => toggleYear(year)}>
              <span className="goal-expand-icon">{isExpanded ? '▼' : '▶'}</span>
              <span className="time-year-title">{year}年</span>
              <span className="time-year-count">{goals.length}个目标</span>
            </div>
            {isExpanded && (
              <div className="time-year-body">
                {goals.map(yg => {
                  const pct = getPct(yg.currentValue, yg.targetValue, yg.startValue);
                  return (
                    <div key={yg.id} className={`goal-node ${isDone(yg.status) ? 'done' : ''}`}>
                      <span className="goal-title-text">{yg.title}</span>
                      <StatusBadge status={yg.status} />
                      <span className="goal-year-tag">{yg.year}</span>
                      <span className="goal-start-value">{yg.startValue}</span>
                      <div className="goal-tree-bar">
                        <div className="progress-bar">
                          <div className={`progress-fill ${pctClass(pct)}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="goal-target-value">{yg.targetValue}</span>
                      <span className="goal-value-text">{pct}%</span>
                    </div>
                  );
                })}
                {/* Group monthly plans by month */}
                {(() => {
                  const allMps = goals.flatMap(yg => (monthlyMap[yg.id] || []));
                  const byMonth: Record<number, MonthlyPlan[]> = {};
                  allMps.forEach(mp => {
                    if (!byMonth[mp.month]) byMonth[mp.month] = [];
                    byMonth[mp.month].push(mp);
                  });
                  return Object.keys(byMonth).map(Number).sort((a, b) => a - b).map(month => (
                    <div key={month} className="time-month-section">
                      <div className="time-month-header">
                        <span>{month}月计划</span>
                      </div>
                      {byMonth[month].map(mp => {
                        const pct = getPct(mp.currentValue, mp.targetValue);
                        return (
                          <div key={mp.id} className={`goal-node ${isDone(mp.status) ? 'done' : ''}`}>
                            <span className="goal-title-text">{mp.title}</span>
                            <StatusBadge status={mp.status} />
                            <span className="goal-year-tag">{mp.month}月</span>
                            <div className="goal-tree-bar">
                              <div className="progress-bar">
                                <div className={`progress-fill ${pctClass(pct)}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <span className="goal-target-value">{mp.targetValue}</span>
                            <span className="goal-value-text">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function GoalTree({ filter, viewMode = 'hierarchy' }: Props) {
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[] | null>(undefined);
  const [yearlyMap, setYearlyMap] = useState<Record<string, YearlyGoal[]>>({});
  const [monthlyMap, setMonthlyMap] = useState<Record<string, MonthlyPlan[]>>({});

  const load = () => {
    api.getLifeGoals()
      .then(async (lifeGoals) => {
        setLifeGoals(lifeGoals);
        if (!lifeGoals || lifeGoals.length === 0) return;

        // Load yearly goals for each life goal
        const yearlyPromises = lifeGoals.map(lg =>
          api.getYearlyGoals().then(yearly => ({ lgId: lg.id, yearly }))
        );
        const yearlyResults = await Promise.all(yearlyPromises);
        const yMap: Record<string, YearlyGoal[]> = {};
        const allYearly: YearlyGoal[] = [];
        yearlyResults.forEach(r => {
          yMap[r.lgId] = r.yearly;
          allYearly.push(...r.yearly);
        });
        setYearlyMap(yMap);

        // Load monthly plans for each yearly goal (filtered by yearlyGoalId)
        const monthlyPromises = allYearly.map(yg =>
          api.getMonthlyPlans(yg.year, undefined, yg.id).then(monthly => ({ ygId: yg.id, monthly }))
        );
        const monthlyResults = await Promise.all(monthlyPromises);
        const mMap: Record<string, MonthlyPlan[]> = {};
        monthlyResults.forEach(r => {
          mMap[r.ygId] = r.monthly;
        });
        setMonthlyMap(mMap);
      })
      .catch(() => setLifeGoals(null));
  };

  useEffect(load, []);

  if (lifeGoals === undefined) return <LoadingState />;
  if (!lifeGoals || lifeGoals.length === 0) return null;

  const isActive = (s: string) => s === 'ACTIVE' || s === 'IN_PROGRESS';
  const isDone = (s: string) => s === 'COMPLETED' || s === 'ABANDONED';

  const filteredLGs = lifeGoals.filter(lg => {
    if (filter === 'all') return true;
    if (filter === 'active') return isActive(lg.status);
    return isDone(lg.status);
  });

  if (viewMode === 'time') {
    const allYearly = Object.values(yearlyMap).flat();
    return <TimeView yearlyList={allYearly} monthlyMap={monthlyMap} filter={filter} />;
  }

  return (
    <div>
      {filteredLGs.map(lg => {
        const yearly = yearlyMap[lg.id] || [];
        const isLifeDone = isDone(lg.status);

        const filteredYearly = yearly.filter(yg => {
          if (filter === 'all') return true;
          if (filter === 'active') return isActive(yg.status);
          return isDone(yg.status);
        });

        if (filter !== 'all' && filteredYearly.length === 0 && !isLifeDone) return null;

        const treeNode: GoalNodeData = {
          id: lg.id,
          title: lg.title,
          type: 'life',
          status: lg.status,
          timeLabel: lg.timeHorizon || '10-20年',
          children: filteredYearly.map(yg => ({
            id: yg.id,
            title: yg.title,
            type: 'yearly' as const,
            status: yg.status,
            timeLabel: String(yg.year),
            progress: { current: yg.currentValue, target: yg.targetValue, start: yg.startValue },
            children: (monthlyMap[yg.id] || [])
              .filter(mp => {
                if (filter === 'all') return true;
                if (filter === 'active') return isActive(mp.status);
                return isDone(mp.status);
              })
              .map(mp => ({
                id: mp.id,
                title: mp.title,
                type: 'monthly' as const,
                status: mp.status,
                timeLabel: `${mp.month}月`,
                progress: { current: mp.currentValue, target: mp.targetValue },
              })),
          })),
        };

        return <GoalNode key={lg.id} node={treeNode} depth={0} />;
      })}
    </div>
  );
}
