import { NextRequest } from 'next/server';
import { resolveDataset, isErrorResponse } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { getFilterParams } from '@/lib/api/params';
import { internationalCountries } from '@/lib/db/queries/aggregations';

export async function GET(req: NextRequest) {
  const dataset = await resolveDataset(req);
  if (isErrorResponse(dataset)) return dataset;

  const filters = getFilterParams(req);
  const data = await internationalCountries(dataset.id, filters);
  return ok(data);
}
