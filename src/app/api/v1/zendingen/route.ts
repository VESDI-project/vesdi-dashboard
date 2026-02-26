import { NextRequest } from 'next/server';
import { resolveDataset, isErrorResponse } from '@/lib/api/middleware';
import { paginated } from '@/lib/api/response';
import { getFilterParams, getPaginationParams } from '@/lib/api/params';
import { getZendingen } from '@/lib/db/queries/zendingen';

export async function GET(req: NextRequest) {
  const dataset = await resolveDataset(req);
  if (isErrorResponse(dataset)) return dataset;

  const filters = getFilterParams(req);
  const pagination = getPaginationParams(req);
  const result = await getZendingen(dataset.id, filters, pagination);

  return paginated(result.data, {
    page: result.page,
    page_size: result.page_size,
    total: result.total,
    total_pages: result.total_pages,
  });
}
