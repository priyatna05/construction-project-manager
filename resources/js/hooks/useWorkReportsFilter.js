import { useState, useMemo } from 'react';

export function useWorkReportsFilter(reports) {
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('');

  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Apply search filter
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.remarks?.toLowerCase().includes(term) ||
          r.weather?.toLowerCase().includes(term) ||
          r.status?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    if (sortOption) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortOption) {
          case 'date-asc':
            return new Date(a.report_date) - new Date(b.report_date);
          case 'date-desc':
            return new Date(b.report_date) - new Date(a.report_date);
          case 'progress-asc':
            return a.progress - b.progress;
          case 'progress-desc':
            return b.progress - a.progress;
          case 'status-asc':
            return a.status.localeCompare(b.status);
          case 'status-desc':
            return b.status.localeCompare(a.status);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [search, reports, sortOption]);

  return {
    search,
    setSearch,
    sortOption,
    setSortOption,
    filteredReports,
  };
}
