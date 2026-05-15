import { useState, useEffect, useCallback } from 'react';
import type { Flight, Filters, FilterOptions } from '../types';

const API_BASE = 'http://localhost:3001';

export function useFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    departureCities: [],
    arrivalCities: [],
    airlines: [],
    statuses: [],
  });
  const [filters, setFilters] = useState<Filters>({
    departureCity: '',
    arrivalCity: '',
    airline: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.departureCity) params.set('departureCity', filters.departureCity);
      if (filters.arrivalCity) params.set('arrivalCity', filters.arrivalCity);
      if (filters.airline) params.set('airline', filters.airline);
      if (filters.status) params.set('status', filters.status);

      const res = await fetch(`${API_BASE}/api/flights?${params}`);
      const json = await res.json();
      if (json.success) setFlights(json.data);
      else setError(json.error);
    } catch {
      setError('无法连接服务器');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchFlights, 300);
    return () => clearTimeout(timer);
  }, [fetchFlights]);

  useEffect(() => {
    fetch(`${API_BASE}/api/flights/filters`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setFilterOptions(json.data);
      })
      .catch(() => {});
  }, []);

  return { flights, filters, setFilters, filterOptions, loading, error };
}
