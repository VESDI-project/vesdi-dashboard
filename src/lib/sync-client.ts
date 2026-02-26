import type { ZendingRow, DeelritRow, LookupData, MunicipalityInfo, NutsMapping } from './types';

interface SyncPayload {
  municipality: MunicipalityInfo;
  years: number[];
  zendingenByYear: Record<string, ZendingRow[]>;
  deelrittenByYear: Record<string, DeelritRow[]>;
  lookup: LookupData | null;
  nutsMapping: NutsMapping[];
}

export async function syncToServer(payload: SyncPayload): Promise<void> {
  const res = await fetch('/api/v1/data/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Sync failed: ${res.status}`);
  }
}
