'use client';

import { useMemo } from 'react';
import { useVesdiStore } from './store';
import type { ZendingRow, DeelritRow } from './types';

/**
 * Get zendingen for the selected year with optional filters applied
 */
export function useFilteredZendingen(): ZendingRow[] {
  const zendingenByYear = useVesdiStore((s) => s.zendingenByYear);
  const filters = useVesdiStore((s) => s.filters);

  return useMemo(() => {
    if (!filters.year) return [];
    const rows = zendingenByYear.get(filters.year) || [];
    return applyZendingenFilters(rows, filters);
  }, [zendingenByYear, filters]);
}

export function useNationalZendingen(): ZendingRow[] {
  const all = useFilteredZendingen();
  return useMemo(() => all.filter((r) => r.isNational), [all]);
}

export function useInternationalZendingen(): ZendingRow[] {
  const all = useFilteredZendingen();
  return useMemo(() => all.filter((r) => r.isInternational), [all]);
}

/**
 * Get deelritten for the selected year with optional filters applied
 */
export function useFilteredDeelritten(): DeelritRow[] {
  const deelrittenByYear = useVesdiStore((s) => s.deelrittenByYear);
  const filters = useVesdiStore((s) => s.filters);

  return useMemo(() => {
    if (!filters.year) return [];
    const rows = deelrittenByYear.get(filters.year) || [];
    return applyDeelrittenFilters(rows, filters);
  }, [deelrittenByYear, filters]);
}

export function useNationalDeelritten(): DeelritRow[] {
  const all = useFilteredDeelritten();
  return useMemo(() => all.filter((r) => r.isNational), [all]);
}

export function useInternationalDeelritten(): DeelritRow[] {
  const all = useFilteredDeelritten();
  return useMemo(() => all.filter((r) => r.isInternational), [all]);
}

// ─── Filter helpers ───

function applyZendingenFilters(
  rows: ZendingRow[],
  filters: { euronorm: string | null; laadEmissiezone: string | null; losEmissiezone: string | null; handelsrichting: string | null }
): ZendingRow[] {
  let filtered = rows;

  if (filters.euronorm) {
    filtered = filtered.filter((r) => r.euronormKlasse === filters.euronorm);
  }
  if (filters.laadEmissiezone) {
    filtered = filtered.filter(
      (r) => r.laad_zone_emissiezonePC6 != null && r.laad_zone_emissiezonePC6 === filters.laadEmissiezone
    );
  }
  if (filters.losEmissiezone) {
    filtered = filtered.filter(
      (r) => r.los_zone_emissiezonePC6 != null && r.los_zone_emissiezonePC6 === filters.losEmissiezone
    );
  }
  if (filters.handelsrichting === 'import') {
    filtered = filtered.filter((r) => r.isImport);
  } else if (filters.handelsrichting === 'export') {
    filtered = filtered.filter((r) => r.isExport);
  }

  return filtered;
}

function applyDeelrittenFilters(
  rows: DeelritRow[],
  filters: { euronorm: string | null; laadEmissiezone: string | null; losEmissiezone: string | null; handelsrichting: string | null }
): DeelritRow[] {
  let filtered = rows;

  if (filters.euronorm) {
    filtered = filtered.filter((r) => r.euronormKlasse === filters.euronorm);
  }
  if (filters.laadEmissiezone) {
    filtered = filtered.filter(
      (r) => r.laad_zone_emissiezonePC6 != null && r.laad_zone_emissiezonePC6 === filters.laadEmissiezone
    );
  }
  if (filters.losEmissiezone) {
    filtered = filtered.filter(
      (r) => r.los_zone_emissiezonePC6 != null && r.los_zone_emissiezonePC6 === filters.losEmissiezone
    );
  }
  if (filters.handelsrichting === 'import') {
    filtered = filtered.filter((r) => r.isImport);
  } else if (filters.handelsrichting === 'export') {
    filtered = filtered.filter((r) => r.isExport);
  }

  return filtered;
}
