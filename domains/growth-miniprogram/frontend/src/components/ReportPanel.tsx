interface Section {
  title: string;
  content: string;
  color?: string;
}

interface Props {
  sections: Section[];
}

export function ReportPanel({ sections }: Props) {
  if (sections.length === 0) {
    return <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0', textAlign: 'center' }}>暂无报告数据</div>;
  }

  return (
    <div>
      {sections.map((s, i) => (
        <div className="report-section" key={i}>
          <div className="report-section-title" style={s.color ? { borderLeftColor: s.color } : undefined}>
            {s.title}
          </div>
          <div className="report-section-content">{s.content}</div>
        </div>
      ))}
    </div>
  );
}
