interface PlanItem {
  title: string;
  dotColor: string;
  meta?: string;
}

interface Props {
  title: string;
  items: PlanItem[];
  emptyHint?: string;
}

export function PlanPanel({ title, items, emptyHint }: Props) {
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
          {item.meta && <span className="panel-plan-meta">{item.meta}</span>}
        </div>
      ))}
    </div>
  );
}
