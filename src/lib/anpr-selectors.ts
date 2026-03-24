'use client';

import { useMemo } from 'react';
import { useVesdiStore } from './store';
import type { AnprTable, AnprTableId, AnprLookupData } from './types';

export function useAnprTable(tableId: AnprTableId): AnprTable | null {
  const anprTables = useVesdiStore((s) => s.anprTables);
  return anprTables.get(tableId) ?? null;
}

export function useHasAnprData(): boolean {
  const anprTables = useVesdiStore((s) => s.anprTables);
  return anprTables.size > 0;
}

export function useAnprLookup(): AnprLookupData | null {
  return useVesdiStore((s) => s.anprLookup);
}

export function useAnprYear(): number | null {
  return useVesdiStore((s) => s.anprYear);
}

export function useAnprTables(): Map<string, AnprTable> {
  return useVesdiStore((s) => s.anprTables);
}

/** Check if any ANPR table has dummy data */
export function useHasAnprDummyData(): boolean {
  const anprTables = useVesdiStore((s) => s.anprTables);
  return useMemo(() => {
    for (const table of anprTables.values()) {
      if (table.isDummy) return true;
    }
    return false;
  }, [anprTables]);
}
