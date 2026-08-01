import { useState } from 'react';
import { api } from '../api';

interface Props {
  analysisId: string;
}

export function FeedbackPanel({ analysisId }: Props) {
  const [score, setScore] = useState(0);
  const [good, setGood] = useState('');
  const [bad, setBad] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hint = score === 0
    ? '请拖动或输入评分'
    : score < 60 ? '低分 → 将注入下次分析的反思上下文'
    : score < 80 ? '及格 → 已记录，帮助校准后续分析'
    : '高分 → 将沉淀为成功案例，供后续建议参考';

  const consequence = score >= 80
    ? '已沉淀为成功案例，供后续建议与分析参考'
    : score < 60 ? '已注入下次复盘分析的反思上下文' : '已记录到反馈库，帮助校准后续分析';

  async function submit() {
    if (!score || score < 1) { setError('请先评分（1-100）'); return; }
    setSubmitting(true); setError(null);
    try {
      await api.submitFeedback(analysisId, {
        userScore: score,
        excellentReason: good.trim() || undefined,
        failReason: bad.trim() || undefined,
      });
      setSubmitted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ marginTop: 16, padding: 16, borderRadius: 12, border: '1px solid var(--success, #22c55e)', background: 'rgba(34,197,94,0.06)' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--success, #22c55e)' }}>✓ 已评分 {score} 分</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6 }}>{consequence}</div>
        {(good || bad) && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-dim)', borderTop: '1px solid #e5e7eb', paddingTop: 10 }}>
            {good && <div style={{ marginBottom: 4 }}>👍 {good}</div>}
            {bad && <div>👎 {bad}</div>}
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>同一分析只能评分一次</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16, padding: 16, borderRadius: 12, border: '1px solid var(--border, #e5e7eb)', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>给这次分析打分</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>你的评价进入反馈闭环：高分 → 成功案例 · 低分 → 反思注入下次分析</div>
        </div>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--accent-bg, #eef2ff)', color: 'var(--accent, #6366f1)', flexShrink: 0 }}>反馈闭环</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="range" min={0} max={100} value={score}
          onChange={e => { setScore(parseInt(e.target.value, 10)); setError(null); }}
          style={{ flex: 1, accentColor: 'var(--accent, #6366f1)' }}
          aria-label="评分滑条"
        />
        <input
          type="number" min={0} max={100} value={score || ''}
          onChange={e => setScore(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
          style={{ width: 70, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
          aria-label="评分"
        />
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>分</span>
      </div>
      <div style={{ fontSize: 12, marginTop: 6, color: score >= 80 ? 'var(--success, #22c55e)' : score >= 60 ? 'var(--warning, #eab308)' : score > 0 ? 'var(--error, #ef4444)' : 'var(--text-muted)' }}>
        {hint}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
        <textarea value={good} onChange={e => setGood(e.target.value)} placeholder="👍 亮点（可选）：这次分析哪里说到你心坎里了？"
          style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, minHeight: 56, resize: 'vertical' }} />
        <textarea value={bad} onChange={e => setBad(e.target.value)} placeholder="👎 不足（可选）：哪里不准确、希望下次怎么改进？"
          style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, minHeight: 56, resize: 'vertical' }} />
      </div>

      {error && <div style={{ fontSize: 12, color: 'var(--error, #ef4444)', marginTop: 8 }}>{error}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <button onClick={submit} disabled={submitting}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--accent, #6366f1)', color: '#fff', cursor: submitting ? 'wait' : 'pointer', fontSize: 13, fontWeight: 600 }}>
          {submitting ? '提交中…' : '提交评分'}
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>同一分析只能评分一次</span>
      </div>
    </div>
  );
}
