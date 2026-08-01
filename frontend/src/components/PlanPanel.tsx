interface PlanItem {
  title: string;
  dotColor: string;
  meta?: string;
  progress?: number;
  status?: string;
}

interface Props {
  title: string;
  items: PlanItem[];
  emptyHint?: string;
  mode?: 'day' | 'week' | 'month' | 'year';
}

export function PlanPanel({ title, items, emptyHint, mode }: Props) {
  // 月/年粒度：显示进度条（对齐原型）
  const showProgress = mode === 'month' || mode === 'year';

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{title}</div>
      {items.length === 0 ? (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>暂无计划</div>
          {emptyHint && <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 0 8px 0' }}>{emptyHint}</div>}
        </div>
      ) : items.map((item, i) => (
        <div className="panel-plan-item" key={i}>
          <span className={`goal-dot ${item.dotColor}`} />
          <span className="panel-plan-title">{item.title}</span>
          {showProgress && item.progress != null && (
            <div style={{ flex: 1, maxWidth: 80, height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
              <div style={{ width: `${item.progress}%`, height: '100%', borderRadius: 3, background: 'var(--accent)' }} />
            </div>
          )}
          {item.meta && <span className="panel-plan-meta">{item.meta}</span>}
        </div>
      ))}
    </div>
  );
}
