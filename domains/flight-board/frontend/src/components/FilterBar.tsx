import type { Filters, FilterOptions } from '../types';

interface FilterBarProps {
  filters: Filters;
  filterOptions: FilterOptions;
  onChange: (filters: Filters) => void;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: '计划中',
  delayed: '延误',
  cancelled: '已取消',
  landed: '已降落',
};

export function FilterBar({ filters, filterOptions, onChange }: FilterBarProps) {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d0d5dd',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    minWidth: '140px',
  };

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: '#667085', fontWeight: 500 }}>筛选：</span>

      <select style={selectStyle} value={filters.departureCity} onChange={e => update('departureCity', e.target.value)}>
        <option value="">全部出发城市</option>
        {filterOptions.departureCities.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select style={selectStyle} value={filters.arrivalCity} onChange={e => update('arrivalCity', e.target.value)}>
        <option value="">全部到达城市</option>
        {filterOptions.arrivalCities.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select style={selectStyle} value={filters.airline} onChange={e => update('airline', e.target.value)}>
        <option value="">全部航空公司</option>
        {filterOptions.airlines.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      <select style={selectStyle} value={filters.status} onChange={e => update('status', e.target.value)}>
        <option value="">全部状态</option>
        {filterOptions.statuses.map(s => (
          <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
        ))}
      </select>
    </div>
  );
}
