import { NextRequest } from 'next/server';
import { resolveDataset, isErrorResponse } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { getFilterParams } from '@/lib/api/params';
import { geoPC4Deelritten } from '@/lib/db/queries/aggregations';

export async function GET(req: NextRequest) {
  const dataset = await resolveDataset(req);
  if (isErrorResponse(dataset)) return dataset;

  const filters = getFilterParams(req);
  const direction = filters.direction ?? 'laad';
  const data = await geoPC4Deelritten(dataset.id, filters, direction);
  return ok(data);
}
