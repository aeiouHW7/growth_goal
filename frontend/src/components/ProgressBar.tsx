interface Props { current?: string | null; target: string; label?: string }
export function ProgressBar({ current, target, label }: Props) {
  const cur = parseFloat(current || '0');
  const tgt = parseFloat(target);
  const pct = tgt && !isNaN(cur) ? Math.min(cur / tgt, 1) : 0;
  const color = pct >= 1 ? '#22c55e' : pct >= 0.5 ? '#eab308' : '#ef4444';
  return (
    <div style={{ margin: '4px 0' }}>
      {label && <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 12, color: '#374151', minWidth: 60, textAlign: 'right' }}>
          {current || '?'}/{target}
        </span>
      </div>
    </div>
  );
}
