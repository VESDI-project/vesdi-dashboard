import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { error } from './response';
import type { Dataset } from '@/generated/prisma/client';

/**
 * Resolve a dataset from query params.
 * Uses ?dataset_id= if provided, otherwise falls back to the most recently updated dataset.
 * Returns the Dataset or an error NextResponse.
 */
export async function resolveDataset(
  req: NextRequest
): Promise<Dataset | ReturnType<typeof error>> {
  const datasetId = req.nextUrl.searchParams.get('dataset_id');

  if (datasetId) {
    const dataset = await prisma.dataset.findUnique({ where: { id: datasetId } });
    if (!dataset) {
      return error('NOT_FOUND', `Dataset '${datasetId}' not found`, 404);
    }
    return dataset;
  }

  // Fallback: most recently updated dataset
  const dataset = await prisma.dataset.findFirst({ orderBy: { updatedAt: 'desc' } });
  if (!dataset) {
    return error('NO_DATA', 'No datasets available. Upload data first.', 404);
  }
  return dataset;
}

/** Type guard to check if resolveDataset returned an error response */
export function isErrorResponse(
  result: Dataset | ReturnType<typeof error>
): result is ReturnType<typeof error> {
  return result instanceof Response;
}
