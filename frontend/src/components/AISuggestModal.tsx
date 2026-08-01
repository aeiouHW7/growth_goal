import { useEffect, useState } from 'react';
import { api } from '../api';
import type { SuggestedGoal, SuggestedPlan } from '../api';

interface Props {
  mode: 'yearly' | 'monthly';
  yearlyGoalId?: string;
  onClose: () => void;
  onConfirm?: () => void;
  onGoArchive?: () => void;
}

type Decision = 'pending' | 'accepted' | 'rejected';

interface YearlyItem { kind: 'yearly'; goal: SuggestedGoal; decision: Decision; editing: boolean; editTitle: string; editTarget: string; }
interface MonthlyItem { kind: 'monthly'; plan: SuggestedPlan; decision: Decision; editing: boolean; editTitle: string; editTarget: string; }
type Item = YearlyItem | MonthlyItem;

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24,
};
const modal: React.CSSProperties = {
  background: '#fff', borderRadius: 16, maxWidth: 620, width: '100%',
  maxHeight: '85vh', display: 'flex', flexDirection: 'column',
  boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
};

function getErrMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'AI 生成失败';
}

export function AISuggestModal({ mode, yearlyGoalId, onClose, onConfirm, onGoArchive }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const title = mode === 'yearly' ? 'AI 目标建议' : 'AI 计划建议';
  const subtitle = '基于你的生活画像与人生档案生成的建议，确认后写入目标体系';

  async function fetchSuggest(): Promise<Item[]> {
    const result = mode === 'yearly'
      ? await api.suggestYearly()
      : yearlyGoalId ? await api.suggestMonthly(yearlyGoalId) : null;
    if (!result) throw new Error(mode === 'monthly' ? '缺少年度目标，无法生成月度计划' : 'AI 生成失败');
    return mode === 'yearly'
      ? (result as { goals: SuggestedGoal[] }).goals.map(g => ({ kind: 'yearly', goal: g, decision: 'pending' as Decision, editing: false, editTitle: g.title, editTarget: g.targetValue }))
      : (result as { plans: SuggestedPlan[] }).plans.map(p => ({ kind: 'monthly', plan: p, decision: 'pending' as Decision, editing: false, editTitle: p.title, editTarget: p.targetValue }));
  }

  // 初始加载：所有 setState 都在 await 之后，避免 effect 内同步 setState
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchSuggest();
        if (cancelled) return;
        if (!list.length) setEmpty(true);
        setItems(list);
      } catch (e: unknown) {
        if (!cancelled) setError(getErrMsg(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, yearlyGoalId]);

  async function retry() {
    setLoading(true); setError(null); setEmpty(false); setItems([]);
    try {
      const list = await fetchSuggest();
      if (!list.length) setEmpty(true);
      setItems(list);
    } catch (e: unknown) {
      setError(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }

  function setDecision(i: number, d: Decision) {
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, decision: d, editing: false } : it)));
  }
  function startEdit(i: number) {
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, editing: true } : it)));
  }
  function updateEdit(i: number, field: 'title' | 'target', value: string) {
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, [field === 'title' ? 'editTitle' : 'editTarget']: value } : it)));
  }
  function saveEdit(i: number) {
    setItems(prev => prev.map((it, idx) => {
      if (idx !== i) return it;
      const t = it.editTitle.trim();
      const v = it.editTarget.trim();
      if (!t || !v) return it;
      if (it.kind === 'yearly') return { ...it, editing: false, goal: { ...it.goal, title: t, targetValue: v }, decision: 'accepted' as Decision };
      return { ...it, editing: false, plan: { ...it.plan, title: t, targetValue: v }, decision: 'accepted' as Decision };
    }));
  }
  function acceptAll() {
    setItems(prev => prev.map(it => (it.decision === 'rejected' ? it : { ...it, decision: 'accepted' as Decision })));
  }

  async function submit() {
    const accepted = items.filter(it => it.decision === 'accepted');
    if (!accepted.length) { setError('请至少接受一条建议'); return; }
    setSubmitting(true); setError(null);
    try {
      if (mode === 'yearly') {
        await api.confirmYearly(accepted.map(it => (it as YearlyItem).goal));
      } else {
        await api.confirmMonthly(accepted.map(it => (it as MonthlyItem).plan));
      }
      setDone(true);
      onConfirm?.();
      setTimeout(onClose, 1500);
    } catch (e: unknown) {
      setError(getErrMsg(e));
    } finally {
      setSubmitting(false);
    }
  }

  const acceptedCount = items.filter(it => it.decision === 'accepted').length;

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget && !submitting) onClose(); }}>
      <div style={modal} role="dialog" aria-modal="true" aria-label={title}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>🤖 {title}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-dim)' }}>{subtitle}</p>
          </div>
          <button onClick={() => { if (!submitting) onClose(); }} aria-label="关闭"
            style={{ border: 'none', background: 'var(--bg)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: '16px 24px 24px', overflowY: 'auto' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
              <div>正在基于人生档案与生活画像生成建议…</div>
            </div>
          )}

          {!loading && error && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>❗</div>
              <p style={{ fontSize: 14, color: 'var(--error, #ef4444)', marginBottom: 12 }}>{error}</p>
              <button onClick={retry}
                style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}>
                重试
              </button>
            </div>
          )}

          {!loading && !error && empty && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧭</div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>暂无可推荐目标</p>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>请先完善人生档案，让 AI 了解你后才能给出有依据的建议</p>
              <button onClick={() => { (onGoArchive ?? onClose)(); }}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--accent, #6366f1)', color: '#fff', cursor: 'pointer' }}>
                填写人生档案 →
              </button>
            </div>
          )}

          {!loading && !error && !empty && (
            <>
              {items.map((it, i) => {
                const name = it.kind === 'yearly' ? it.goal.title : it.plan.title;
                const meta = it.kind === 'yearly'
                  ? `类型: ${it.goal.metricType} · 目标: ${it.goal.targetValue}${it.goal.startValue ? ` · 起始: ${it.goal.startValue}` : ''}`
                  : `类型: ${it.plan.metricType ?? ''} · 目标: ${it.plan.targetValue}`;
                const reason = it.kind === 'yearly' ? it.goal.description : it.plan.description;
                const isAccepted = it.decision === 'accepted';
                const isRejected = it.decision === 'rejected';
                const isModified = it.kind === 'yearly'
                  ? (it.editTitle !== it.goal.title && !it.editing) || it.editTarget !== it.goal.targetValue
                  : (it.editTitle !== it.plan.title && !it.editing) || it.editTarget !== it.plan.targetValue;

                return (
                  <div key={i} style={{
                    border: '1px solid var(--border)',
                    background: isAccepted ? 'rgba(34,197,94,0.06)' : isRejected ? 'rgba(0,0,0,0.02)' : '#fff',
                    borderRadius: 12, padding: 14, marginBottom: 10, opacity: isRejected ? 0.55 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{it.kind === 'yearly' ? '📊' : '📅'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {name}
                          {isModified && !it.editing && (
                            <span style={{ marginLeft: 8, fontSize: 11, color: '#ff9f0a', border: '1px solid #ff9f0a', borderRadius: 4, padding: '0 6px' }}>已修改</span>
                          )}
                        </div>
                        {it.editing ? (
                          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <input value={it.editTitle} onChange={e => updateEdit(i, 'title', e.target.value)}
                              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }} />
                            <input value={it.editTarget} onChange={e => updateEdit(i, 'target', e.target.value)}
                              placeholder="目标值" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }} />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => saveEdit(i)}
                                style={{ padding: '4px 14px', borderRadius: 6, border: 'none', background: 'var(--accent, #6366f1)', color: '#fff', cursor: 'pointer', fontSize: 13 }}>保存</button>
                              <button onClick={() => setDecision(i, 'pending')}
                                style={{ padding: '4px 14px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: 13 }}>取消</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ fontSize: 12, color: 'var(--text-dim)', margin: '4px 0' }}>{meta}</div>
                            {reason && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{reason}</div>}
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              {isAccepted ? (
                                <span style={{ fontSize: 12, color: 'var(--success, #22c55e)', fontWeight: 600 }}>✓ 已接受</span>
                              ) : isRejected ? (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>已拒绝</span>
                              ) : (
                                <>
                                  <button onClick={() => setDecision(i, 'accepted')}
                                    style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--success, #22c55e)', color: 'var(--success, #22c55e)', background: '#fff', cursor: 'pointer', fontSize: 12 }}>✓ 接受</button>
                                  <button onClick={() => startEdit(i)}
                                    style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: 12 }}>✏️ 修改</button>
                                  <button onClick={() => setDecision(i, 'rejected')}
                                    style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--error, #ef4444)', color: 'var(--error, #ef4444)', background: '#fff', cursor: 'pointer', fontSize: 12 }}>✕ 拒绝</button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {done ? (
                <div style={{ textAlign: 'center', padding: 16, color: 'var(--success, #22c55e)', fontWeight: 600 }}>
                  ✓ 已创建 {acceptedCount} 个{mode === 'yearly' ? '目标' : '计划'}（ACTIVE）
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={submit} disabled={submitting || !acceptedCount}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: acceptedCount ? 'var(--accent, #6366f1)' : 'var(--bg)', color: acceptedCount ? '#fff' : 'var(--text-muted)', cursor: acceptedCount ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
                    {submitting ? '写入中…' : `确认写入（${acceptedCount} 条）`}
                  </button>
                  <button onClick={() => acceptAll()} disabled={submitting}
                    style={{ padding: '0 20px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}>
                    全部接受
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
