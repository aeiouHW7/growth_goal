import { useFlights } from './hooks/useFlights';
import { FilterBar } from './components/FilterBar';
import { FlightTable } from './components/FlightTable';

function App() {
  const { flights, filters, setFilters, filterOptions, loading, error } = useFlights();

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '40px 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#111827',
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
        航班信息面板
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '15px' }}>
        共 {flights.length} 条航班记录
      </p>

      <FilterBar filters={filters} filterOptions={filterOptions} onChange={setFilters} />

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <FlightTable flights={flights} loading={loading} />
    </div>
  );
}

export default App;
