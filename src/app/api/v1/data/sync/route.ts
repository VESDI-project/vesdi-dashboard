import { NextRequest } from 'next/server';
import { syncDataset } from '@/lib/db/sync';
import { ok, error } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.municipality?.code || !body.municipality?.name) {
      return error('INVALID_PAYLOAD', 'municipality.code and municipality.name are required', 400);
    }

    if (!body.years?.length) {
      return error('INVALID_PAYLOAD', 'At least one year is required', 400);
    }

    await syncDataset({
      municipality: body.municipality,
      years: body.years,
      zendingenByYear: body.zendingenByYear ?? {},
      deelrittenByYear: body.deelrittenByYear ?? {},
      lookup: body.lookup ?? null,
      nutsMapping: body.nutsMapping ?? [],
    });

    return ok({ synced: true, municipality: body.municipality.name, years: body.years }, 201);
  } catch (e) {
    console.error('[sync] Error:', e);
    return error('SYNC_ERROR', e instanceof Error ? e.message : 'Unknown sync error', 500);
  }
}
