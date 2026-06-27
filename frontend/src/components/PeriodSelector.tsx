interface Props {
  year: number;
  month: number;
  dimension: 'year' | 'month' | 'week' | 'day';
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onDimensionChange: (d: 'year' | 'month' | 'week' | 'day') => void;
}

const dims: Array<{ key: Props['dimension']; label: string }> = [
  { key: 'year', label: '年' },
  { key: 'month', label: '月' },
  { key: 'week', label: '周' },
  { key: 'day', label: '日' },
];

export function PeriodSelector({ year, month, dimension, onYearChange, onMonthChange, onDimensionChange }: Props) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

  return (
    <div>
      <div className="date-picker">
        <label>年份:</label>
        <select value={year} onChange={e => onYearChange(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <label style={{ marginLeft: 8 }}>月份:</label>
        <select value={month} onChange={e => onMonthChange(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{m}月</option>
          ))}
        </select>
      </div>

      <div className="dim-tabs">
        {dims.map(d => (
          <button
            key={d.key}
            className={`dim-btn ${dimension === d.key ? 'active' : ''}`}
            onClick={() => onDimensionChange(d.key)}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
