interface Props {
  rating?: string;
  score?: number;
  completionRate?: number;
  fallbackLabel?: string;
  fallbackScore?: number;
  dailyMetrics?: { energyRate?: number; postureDone?: boolean };
}

function getRatingEmoji(rating?: string): string {
  if (!rating) return '⬜';
  if (rating === 'EXCELLENT' || rating === 'GOOD') return '🟢';
  if (rating === 'FAIR') return '🟡';
  return '🔴';
}

export function EvalPanel({ rating, score, completionRate, fallbackLabel, fallbackScore, dailyMetrics }: Props) {
  // 日视图：展示日复盘指标
  if (dailyMetrics) {
    return (
      <div>
        <div className="eval-stats">
          <div className="eval-stat">
            <div className="eval-stat-value">{score != null ? score : '-'}</div>
            <div className="eval-stat-label">AI 评分</div>
          </div>
          <div className="eval-stat">
            <div className="eval-stat-value">{dailyMetrics.energyRate != null ? dailyMetrics.energyRate : '-'}</div>
            <div className="eval-stat-label">充沛率</div>
          </div>
          <div className="eval-stat">
            <div className="eval-stat-value">{dailyMetrics.postureDone ? '✅' : '❌'}</div>
            <div className="eval-stat-label">体态训练</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>日复盘评估</div>
      </div>
    );
  }

  return (
    <div>
      {rating || score != null ? (
        <>
          <div className="eval-rating">{getRatingEmoji(rating)}</div>
          <div className="eval-stats">
            <div className="eval-stat">
              <div className="eval-stat-value">{score != null ? score : '-'}</div>
              <div className="eval-stat-label">AI 评分</div>
            </div>
            <div className="eval-stat">
              <div className="eval-stat-value">
                {completionRate != null ? `${Math.round(completionRate * 100)}%` : '-'}
              </div>
              <div className="eval-stat-label">完成率</div>
            </div>
          </div>
        </>
      ) : fallbackLabel ? (
        <div>
          <div className="eval-stats" style={{ marginBottom: 8 }}>
            <div className="eval-stat">
              <div className="eval-stat-value">{fallbackScore != null ? fallbackScore : '-'}</div>
              <div className="eval-stat-label">AI 评分</div>
            </div>
            <div className="eval-stat">
              <div className="eval-stat-value" style={{ fontSize: 11 }}>日复盘</div>
              <div className="eval-stat-label">数据来源</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>{fallbackLabel}</div>
        </div>
      ) : (
        <div>
          <div className="eval-rating">⬜</div>
          <div className="eval-stats">
            <div className="eval-stat">
              <div className="eval-stat-value">-</div>
              <div className="eval-stat-label">AI 评分</div>
            </div>
            <div className="eval-stat">
              <div className="eval-stat-value">-</div>
              <div className="eval-stat-label">完成率</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
