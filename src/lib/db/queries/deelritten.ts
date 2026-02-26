import { prisma } from '../prisma';
import type { FilterParams, PaginationParams } from '@/lib/api/params';
import type { Prisma } from '@/generated/prisma/client';

function buildWhere(datasetId: string, filters: FilterParams): Prisma.DeelritWhereInput {
  const where: Prisma.DeelritWhereInput = { datasetId };

  if (filters.year) where.jaar = filters.year;
  if (filters.euronorm) where.euronormKlasse = filters.euronorm;
  if (filters.laadEmissiezone) where.laad_zone_emissiezonePC6 = filters.laadEmissiezone;
  if (filters.losEmissiezone) where.los_zone_emissiezonePC6 = filters.losEmissiezone;
  if (filters.voertuigType) where.voertuigsoortRDW = filters.voertuigType;

  if (filters.handelsrichting === 'import') where.isImport = true;
  else if (filters.handelsrichting === 'export') where.isExport = true;

  return where;
}

export async function getDeelritten(
  datasetId: string,
  filters: FilterParams,
  pagination: PaginationParams
) {
  const where = buildWhere(datasetId, filters);
  const [data, total] = await Promise.all([
    prisma.deelrit.findMany({
      where,
      skip: (pagination.page - 1) * pagination.page_size,
      take: pagination.page_size,
      orderBy: { id: 'asc' },
      omit: { id: true, datasetId: true },
    }),
    prisma.deelrit.count({ where }),
  ]);

  return {
    data,
    total,
    page: pagination.page,
    page_size: pagination.page_size,
    total_pages: Math.ceil(total / pagination.page_size),
  };
}
