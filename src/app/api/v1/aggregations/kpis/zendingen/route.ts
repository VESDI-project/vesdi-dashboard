import { NextRequest } from 'next/server';
import { resolveDataset, isErrorResponse } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { getFilterParams } from '@/lib/api/params';
import { kpiZendingen } from '@/lib/db/queries/aggregations';

export async function GET(req: NextRequest) {
  const dataset = await resolveDataset(req);
  if (isErrorResponse(dataset)) return dataset;

  const filters = getFilterParams(req);
  const kpis = await kpiZendingen(dataset.id, filters);
  return ok(kpis);
}
