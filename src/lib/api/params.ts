import { NextRequest } from 'next/server';

export interface FilterParams {
  year?: number;
  euronorm?: string;
  laadEmissiezone?: string;
  losEmissiezone?: string;
  handelsrichting?: 'import' | 'export';
  voertuigType?: number;
  direction?: 'laad' | 'los';
}

export interface PaginationParams {
  page: number;
  page_size: number;
}

export function getFilterParams(req: NextRequest): FilterParams {
  const sp = req.nextUrl.searchParams;
  const params: FilterParams = {};

  const year = sp.get('year');
  if (year) params.year = parseInt(year, 10);

  const euronorm = sp.get('euronorm');
  if (euronorm) params.euronorm = euronorm;

  const laadEz = sp.get('laad_emissiezone');
  if (laadEz) params.laadEmissiezone = laadEz;

  const losEz = sp.get('los_emissiezone');
  if (losEz) params.losEmissiezone = losEz;

  const handelsrichting = sp.get('handelsrichting');
  if (handelsrichting === 'import' || handelsrichting === 'export') {
    params.handelsrichting = handelsrichting;
  }

  const voertuigType = sp.get('voertuig_type');
  if (voertuigType) params.voertuigType = parseInt(voertuigType, 10);

  const direction = sp.get('direction');
  if (direction === 'laad' || direction === 'los') {
    params.direction = direction;
  }

  return params;
}

export function getPaginationParams(req: NextRequest): PaginationParams {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
  const page_size = Math.min(1000, Math.max(1, parseInt(sp.get('page_size') || '100', 10)));
  return { page, page_size };
}
