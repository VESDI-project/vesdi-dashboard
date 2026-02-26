import { NextRequest } from 'next/server';
import { resolveDataset, isErrorResponse } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { trendEuro6 } from '@/lib/db/queries/aggregations';

export async function GET(req: NextRequest) {
  const dataset = await resolveDataset(req);
  if (isErrorResponse(dataset)) return dataset;

  const trends = await trendEuro6(dataset.id);
  return ok(trends);
}
