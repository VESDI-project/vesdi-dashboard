import { NextRequest } from 'next/server';
import { resolveDataset, isErrorResponse } from '@/lib/api/middleware';
import { ok, error } from '@/lib/api/response';
import { getFilterParams } from '@/lib/api/params';
import {
  distributionEmissiezone,
  distributionBrandstof,
  distributionGewichtsklasse,
  distributionVoertuigcategorie,
} from '@/lib/db/queries/aggregations';

const VALID_TYPES = ['emissiezone', 'brandstof', 'gewichtsklasse', 'voertuigcategorie'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type)) {
    return error(
      'INVALID_TYPE',
      `Invalid distribution type '${type}'. Valid types: ${VALID_TYPES.join(', ')}`,
      400
    );
  }

  const dataset = await resolveDataset(req);
  if (isErrorResponse(dataset)) return dataset;

  const filters = getFilterParams(req);

  switch (type) {
    case 'emissiezone': {
      const direction = filters.direction ?? 'laad';
      const data = await distributionEmissiezone(dataset.id, filters, direction);
      return ok(data);
    }
    case 'brandstof': {
      const data = await distributionBrandstof(dataset.id, filters);
      return ok(data);
    }
    case 'gewichtsklasse': {
      const data = await distributionGewichtsklasse(dataset.id, filters);
      return ok(data);
    }
    case 'voertuigcategorie': {
      const data = await distributionVoertuigcategorie(dataset.id, filters);
      return ok(data);
    }
    default:
      return error('INVALID_TYPE', `Unknown type: ${type}`, 400);
  }
}
