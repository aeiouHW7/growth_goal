interface StructuredReport {
  completionSummary?: { completed?: string[]; notCompleted?: string[]; completionRate?: string };
  deviationAnalysis?: { onTrack?: string[]; behind?: string[]; riskLevel?: string };
  executionDiagnosis?: { issues?: string[]; rootCause?: string; pattern?: string };
  foggDiagnosis?: { missing?: string; detail?: string };
  externalPerspective?: { trendInsights?: string[]; directionCheck?: string; newOpportunities?: string[]; risks?: string[] };
  detectedBiases?: Array<{ type: string; triggerPhrase: string; evidence: string }>;
  detectedPatterns?: Array<{ pattern: string; dimension?: string; frequency: number }>;
  capabilityDeltas?: Array<{ dimension: string; score: number; evidence: string }>;
  insight?: { unaware?: string; pattern?: string; missing?: string };
  suggestions?: Array<{ type: string; message: string }>;
  energyRate?: number;
  postureTraining?: { completed: boolean; note?: string };
  signalScore?: number;
}

interface Props {
  report: StructuredReport;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #f3f4f6' }}>
      {children}
    </div>
  );
}

function ListItems({ items, icon }: { items: string[]; icon: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 4 }}>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 13, lineHeight: 1.6, display: 'flex', gap: 4 }}>
          <span>{icon}</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
      background: color + '20', color,
    }}>
      {text}
    </span>
  );
}

export function StructuredReportPanel({ report }: Props) {
  const sections: React.ReactNode[] = [];

  // === Insights ===
  if (report.insight) {
    const ins = report.insight;
    const parts: string[] = [];
    if (ins.unaware) parts.push(ins.unaware);
    if (ins.pattern) parts.push(`模式: ${ins.pattern}`);
    if (ins.missing) parts.push(ins.missing);
    if (parts.length > 0) {
      sections.push(
        <div key="insight" className="report-section">
          <SectionTitle>💡 洞察</SectionTitle>
          <div className="report-section-content">
            {parts.map((p, i) => <div key={i} style={{ marginBottom: 2 }}>{p}</div>)}
          </div>
        </div>
      );
    }
  }

  // === Completion ===
  const cs = report.completionSummary;
  if (cs) {
    const hasData = (cs.completed?.length || cs.notCompleted?.length || cs.completionRate);
    if (hasData) {
      sections.push(
        <div key="completion" className="report-section">
          <SectionTitle>📋 完成情况</SectionTitle>
          <div className="report-section-content">
            <ListItems items={cs.completed || []} icon="✅" />
            <ListItems items={cs.notCompleted || []} icon="❌" />
            {cs.completionRate && (
              <div style={{ fontSize: 13, marginTop: 4 }}>
                <span style={{ color: 'var(--text-dim)' }}>完成率: </span>
                <span style={{ fontWeight: 600 }}>{cs.completionRate}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // === Deviation ===
  const da = report.deviationAnalysis;
  if (da && (da.onTrack?.length || da.behind?.length || da.riskLevel)) {
    const riskColor = da.riskLevel === '高' ? 'var(--error)' : da.riskLevel === '中' ? 'var(--warning)' : 'var(--success)';
    sections.push(
      <div key="deviation" className="report-section">
        <SectionTitle>📊 偏差分析</SectionTitle>
        <div className="report-section-content">
          {da.riskLevel && (
            <div style={{ marginBottom: 6 }}>
              <Badge text={`风险: ${da.riskLevel}`} color={riskColor} />
            </div>
          )}
          <ListItems items={da.onTrack || []} icon="✅" />
          <ListItems items={da.behind || []} icon="🔴" />
        </div>
      </div>
    );
  }

  // === Execution Diagnosis ===
  const diag = report.executionDiagnosis;
  if (diag && ((diag.issues?.length ?? 0) > 0 || diag.rootCause)) {
    sections.push(
      <div key="execution" className="report-section">
        <SectionTitle>🔧 执行诊断</SectionTitle>
        <div className="report-section-content">
          <ListItems items={diag.issues || []} icon="•" />
          {diag.rootCause && (
            <div style={{ fontSize: 13, marginTop: 4 }}>
              <span style={{ color: 'var(--text-dim)' }}>原因: </span>
              <span>{diag.rootCause}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === Fogg Diagnosis ===
  const fogg = report.foggDiagnosis;
  if (fogg?.missing) {
    const foggLabels: Record<string, string> = { M: '动机不足', A: '能力不足', P: '提示不足' };
    const foggColors: Record<string, string> = { M: '#f59e0b', A: '#ef4444', P: '#3b82f6' };
    const label = foggLabels[fogg.missing] || fogg.missing;
    sections.push(
      <div key="fogg" className="report-section">
        <SectionTitle>⚡ Fogg 模型</SectionTitle>
        <div className="report-section-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Badge text={label} color={foggColors[fogg.missing] || 'var(--text-dim)'} />
          </div>
          {fogg.detail && <div style={{ fontSize: 13 }}>{fogg.detail}</div>}
        </div>
      </div>
    );
  }

  // === Biases ===
  const biases = report.detectedBiases;
  if (biases && biases.length > 0) {
    sections.push(
      <div key="biases" className="report-section">
        <SectionTitle>🧠 认知偏误</SectionTitle>
        <div className="report-section-content">
          {biases.slice(0, 4).map((b, i) => (
            <div key={i} style={{ fontSize: 13, marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid #e5e7eb' }}>
              <div style={{ fontWeight: 500 }}>{b.type}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>"{b.triggerPhrase}"</div>
              {b.evidence && <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 1 }}>{b.evidence}</div>}
            </div>
          ))}
          {biases.length > 4 && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>+{biases.length - 4} 项偏误</div>
          )}
        </div>
      </div>
    );
  }

  // === Patterns ===
  const patterns = report.detectedPatterns;
  if (patterns && patterns.length > 0) {
    sections.push(
      <div key="patterns" className="report-section">
        <SectionTitle>🔄 行为模式</SectionTitle>
        <div className="report-section-content">
          {patterns.map((p, i) => (
            <div key={i} style={{ fontSize: 13, marginBottom: 2, display: 'flex', gap: 4 }}>
              <span style={{ color: 'var(--text-dim)' }}>• {p.pattern}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({p.frequency}次)</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // === Capability Deltas ===
  const caps = report.capabilityDeltas;
  if (caps && caps.length > 0) {
    sections.push(
      <div key="caps" className="report-section">
        <SectionTitle>📈 能力评分</SectionTitle>
        <div className="report-section-content">
          {caps.map((c, i) => {
            const pct = (c.score / 10) * 100;
            const barColor = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--error)';
            return (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 2 }}>
                  <span>{c.dimension}</span>
                  <span style={{ fontWeight: 600 }}>{c.score}/10</span>
                </div>
                <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2 }} />
                </div>
                {c.evidence && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{c.evidence}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === Suggestions ===
  const suggestions = report.suggestions;
  if (suggestions && suggestions.length > 0) {
    sections.push(
      <div key="suggestions" className="report-section">
        <SectionTitle>💪 改进建议</SectionTitle>
        <div className="report-section-content">
          {suggestions.map((s, i) => {
            const sColor = s.type === 'critical' ? 'var(--error)' : s.type === 'warning' ? 'var(--warning)' : 'var(--success)';
            return (
              <div key={i} style={{ fontSize: 13, marginBottom: 4, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <Badge text={s.type} color={sColor} />
                <span>{s.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === External Perspective ===
  const ext = report.externalPerspective;
  if (ext) {
    const extParts: React.ReactNode[] = [];
    if (ext.trendInsights?.length) extParts.push(<ListItems key="trends" items={ext.trendInsights} icon="🌊" />);
    if (ext.directionCheck) extParts.push(<div key="dir" style={{ fontSize: 13 }}>方向: {ext.directionCheck}</div>);
    if (ext.newOpportunities?.length) extParts.push(<ListItems key="opps" items={ext.newOpportunities} icon="✨" />);
    if (ext.risks?.length) extParts.push(<ListItems key="risks" items={ext.risks} icon="⚠️" />);
    if (extParts.length > 0) {
      sections.push(
        <div key="external" className="report-section">
          <SectionTitle>👁️ 外部视角</SectionTitle>
          <div className="report-section-content">{extParts}</div>
        </div>
      );
    }
  }

  // === Energy & Metrics ===
  if (report.energyRate != null || report.postureTraining != null) {
    const metrics: string[] = [];
    if (report.energyRate != null) metrics.push(`充沛率: ${report.energyRate}/100`);
    if (report.postureTraining != null) metrics.push(`体态: ${report.postureTraining.completed ? '✅' : '❌'}`);
    sections.push(
      <div key="metrics" className="report-section">
        <SectionTitle>📈 指标</SectionTitle>
        <div className="report-section-content">
          {metrics.map((m, i) => <div key={i} style={{ fontSize: 13 }}>{m}</div>)}
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0', textAlign: 'center' }}>
        暂无分析数据
      </div>
    );
  }

  return <div>{sections}</div>;
}
