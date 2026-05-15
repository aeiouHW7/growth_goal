import type { Flight } from '../types';

interface FlightTableProps {
  flights: Flight[];
  loading: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: '计划中',
  delayed: '延误',
  cancelled: '已取消',
  landed: '已降落',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#2563eb',
  delayed: '#d97706',
  cancelled: '#dc2626',
  landed: '#16a34a',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FlightTable({ flights, loading }: FlightTableProps) {
  if (loading) return <p style={{ textAlign: 'center', color: '#667085', padding: '40px' }}>加载中...</p>;
  if (flights.length === 0) return <p style={{ textAlign: 'center', color: '#667085', padding: '40px' }}>暂无匹配航班</p>;

  const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    backgroundColor: '#f9fafb',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '14px',
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['航班号', '航空公司', '出发城市', '到达城市', '出发时间', '到达时间', '状态'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {flights.map(f => (
            <tr key={f.id} style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
              <td style={{ ...tdStyle, fontWeight: 600, fontFamily: 'monospace' }}>{f.flightNumber}</td>
              <td style={tdStyle}>{f.airline}</td>
              <td style={tdStyle}>{f.departureCity}</td>
              <td style={tdStyle}>{f.arrivalCity}</td>
              <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{formatTime(f.departureTime)}</td>
              <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{formatTime(f.arrivalTime)}</td>
              <td style={tdStyle}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: STATUS_COLORS[f.status] || '#000',
                  backgroundColor: `${STATUS_COLORS[f.status] || '#000'}18`,
                }}>
                  {STATUS_LABELS[f.status] || f.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
