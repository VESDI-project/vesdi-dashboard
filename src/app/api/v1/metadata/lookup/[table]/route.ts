import { NextRequest } from 'next/server';
import { resolveDataset, isErrorResponse } from '@/lib/api/middleware';
import { ok, error } from '@/lib/api/response';
import { getLookupByTable } from '@/lib/db/queries/metadata';

const VALID_TABLES = [
  'voertuigsoortRDW',
  'brandstofsoort',
  'laadvermogenCombinatie',
  'maxToegestaanGewicht',
  'leeggewichtCombinatie',
  'logistiekeKlasse',
  'legeRit',
  'nuts3',
  'gemeentecode',
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;

  if (!VALID_TABLES.includes(table)) {
    return error(
      'INVALID_TABLE',
      `Invalid lookup table '${table}'. Valid tables: ${VALID_TABLES.join(', ')}`,
      400
    );
  }

  const dataset = await resolveDataset(req);
  if (isErrorResponse(dataset)) return dataset;

  const entries = await getLookupByTable(dataset.id, table);
  return ok(entries);
}
