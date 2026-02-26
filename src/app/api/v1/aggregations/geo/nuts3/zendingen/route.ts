import { NextRequest } from 'next/server';
import { resolveDataset, isErrorResponse } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { getFilterParams } from '@/lib/api/params';
import { geoNuts3Zendingen } from '@/lib/db/queries/aggregations';

export async function GET(req: NextRequest) {
  const dataset = await resolveDataset(req);
  if (isErrorResponse(dataset)) return dataset;

  const filters = getFilterParams(req);
  const direction = filters.direction ?? 'laad';
  const data = await geoNuts3Zendingen(dataset.id, filters, direction);
  return ok(data);
}
