import { prisma } from '../prisma';
import type { FilterParams } from '@/lib/api/params';
import { Prisma } from '@/generated/prisma/client';

// ─── Shared filter builder ───

function zendingWhere(datasetId: string, f: FilterParams): Prisma.ZendingWhereInput {
  const w: Prisma.ZendingWhereInput = { datasetId };
  if (f.year) w.jaar = f.year;
  if (f.euronorm) w.euronormKlasse = f.euronorm;
  if (f.laadEmissiezone) w.laad_zone_emissiezonePC6 = f.laadEmissiezone;
  if (f.losEmissiezone) w.los_zone_emissiezonePC6 = f.losEmissiezone;
  if (f.handelsrichting === 'import') w.isImport = true;
  else if (f.handelsrichting === 'export') w.isExport = true;
  return w;
}

function deelritWhere(datasetId: string, f: FilterParams): Prisma.DeelritWhereInput {
  const w: Prisma.DeelritWhereInput = { datasetId };
  if (f.year) w.jaar = f.year;
  if (f.euronorm) w.euronormKlasse = f.euronorm;
  if (f.laadEmissiezone) w.laad_zone_emissiezonePC6 = f.laadEmissiezone;
  if (f.losEmissiezone) w.los_zone_emissiezonePC6 = f.losEmissiezone;
  if (f.voertuigType) w.voertuigsoortRDW = f.voertuigType;
  if (f.handelsrichting === 'import') w.isImport = true;
  else if (f.handelsrichting === 'export') w.isExport = true;
  return w;
}

// ─── KPI: Zendingen ───

export async function kpiZendingen(datasetId: string, filters: FilterParams) {
  const where = zendingWhere(datasetId, filters);
  const result = await prisma.zending.aggregate({
    where,
    _sum: { zendingAantal: true, brutoGewicht: true },
  });
  return {
    zendingAantal: result._sum.zendingAantal ?? 0,
    brutoGewicht: result._sum.brutoGewicht ?? 0,
  };
}

// ─── KPI: Deelritten ───

export async function kpiDeelritten(datasetId: string, filters: FilterParams) {
  const where = deelritWhere(datasetId, filters);

  const result = await prisma.deelrit.aggregate({
    where,
    _sum: { aantalDeelritten: true, brutoGewicht: true },
  });

  const totalTrips = result._sum.aantalDeelritten ?? 0;

  let beladingsgraad = 0;
  if (totalTrips > 0) {
    // Weighted beladingsgraad via Prisma (no raw SQL needed for simple case)
    // For the full weighted avg we use raw SQL with parameterized query
    const raw = await prisma.$queryRaw<[{ weighted_avg: number | null }]>`
      SELECT SUM("beladingsgraadGewichtGemiddeld" / 100.0 * "aantalDeelritten")
             / NULLIF(SUM("aantalDeelritten"), 0) as weighted_avg
      FROM "deelritten"
      WHERE "datasetId" = ${datasetId}
        ${filters.year ? Prisma.sql`AND "jaar" = ${filters.year}` : Prisma.empty}
        ${filters.euronorm ? Prisma.sql`AND "euronormKlasse" = ${filters.euronorm}` : Prisma.empty}
    `;
    beladingsgraad = Number(raw[0]?.weighted_avg ?? 0);
  }

  return {
    aantalDeelritten: totalTrips,
    brutoGewicht: result._sum.brutoGewicht ?? 0,
    beladingsgraad,
  };
}

// ─── Trend: Zendingen per year ───

export async function trendZendingen(datasetId: string) {
  const results = await prisma.zending.groupBy({
    by: ['jaar'],
    where: { datasetId },
    _sum: { zendingAantal: true, brutoGewicht: true },
    orderBy: { jaar: 'asc' },
  });

  return results.map((r: typeof results[number]) => ({
    year: r.jaar,
    zendingAantal: r._sum.zendingAantal ?? 0,
    brutoGewicht: r._sum.brutoGewicht ?? 0,
  }));
}

// ─── Trend: Deelritten per year ───

export async function trendDeelritten(datasetId: string, municipalityCode: string) {
  const results = await prisma.deelrit.groupBy({
    by: ['jaar'],
    where: { datasetId, isNational: true },
    _sum: { aantalDeelritten: true },
    orderBy: { jaar: 'asc' },
  });

  const kmsRaw = await prisma.$queryRaw<{ jaar: number; kms_intra: number }[]>`
    SELECT "jaar",
           SUM("deelritAfstandGemiddeld" * "aantalDeelritten") as kms_intra
    FROM "deelritten"
    WHERE "datasetId" = ${datasetId}
      AND "isNational" = true
      AND "laadGemeente" = ${municipalityCode}
      AND "losGemeente" = ${municipalityCode}
    GROUP BY "jaar"
    ORDER BY "jaar"
  `;

  const kmsMap = new Map(kmsRaw.map((r: { jaar: number; kms_intra: number }) => [r.jaar, Number(r.kms_intra)]));

  return results.map((r: typeof results[number]) => ({
    year: r.jaar,
    aantalDeelritten: r._sum.aantalDeelritten ?? 0,
    kmsIntraMunicipaal: kmsMap.get(r.jaar) ?? 0,
  }));
}

// ─── Trend: Euro-6 percentage per year ───

export async function trendEuro6(datasetId: string) {
  const all = await prisma.deelrit.groupBy({
    by: ['jaar'],
    where: { datasetId, isNational: true },
    _sum: { aantalDeelritten: true },
    orderBy: { jaar: 'asc' },
  });

  const euro6 = await prisma.deelrit.groupBy({
    by: ['jaar'],
    where: { datasetId, isNational: true, euronormKlasse: '6' },
    _sum: { aantalDeelritten: true },
    orderBy: { jaar: 'asc' },
  });

  const euro6Map = new Map(euro6.map((r: typeof euro6[number]) => [r.jaar, r._sum.aantalDeelritten ?? 0]));

  return all.map((r: typeof all[number]) => {
    const total = r._sum.aantalDeelritten ?? 0;
    const e6 = euro6Map.get(r.jaar) ?? 0;
    return {
      year: r.jaar,
      percentage: total > 0 ? e6 / total : 0,
      euro6Trips: e6,
      totalTrips: total,
    };
  });
}

// ─── Geo: NUTS3 aggregation for zendingen ───

export async function geoNuts3Zendingen(
  datasetId: string,
  filters: FilterParams,
  direction: 'laad' | 'los'
) {
  const where = zendingWhere(datasetId, filters);

  // Use separate queries for laad/los to keep types clean
  if (direction === 'laad') {
    const results = await prisma.zending.groupBy({
      by: ['laadNuts3'],
      where,
      _sum: { zendingAantal: true },
      orderBy: { _sum: { zendingAantal: 'desc' } },
    });
    const total = results.reduce((s: number, r: typeof results[number]) => s + (r._sum.zendingAantal ?? 0), 0);
    return results.map((r: typeof results[number]) => ({
      nuts3: r.laadNuts3,
      count: r._sum.zendingAantal ?? 0,
      percentage: total > 0 ? (r._sum.zendingAantal ?? 0) / total : 0,
    }));
  } else {
    const results = await prisma.zending.groupBy({
      by: ['losNuts3'],
      where,
      _sum: { zendingAantal: true },
      orderBy: { _sum: { zendingAantal: 'desc' } },
    });
    const total = results.reduce((s: number, r: typeof results[number]) => s + (r._sum.zendingAantal ?? 0), 0);
    return results.map((r: typeof results[number]) => ({
      nuts3: r.losNuts3,
      count: r._sum.zendingAantal ?? 0,
      percentage: total > 0 ? (r._sum.zendingAantal ?? 0) / total : 0,
    }));
  }
}

// ─── Geo: PC4 aggregation for deelritten ───

export async function geoPC4Deelritten(
  datasetId: string,
  filters: FilterParams,
  direction: 'laad' | 'los'
) {
  if (direction === 'laad') {
    const results = await prisma.deelrit.groupBy({
      by: ['PC4LaadNL'],
      where: { ...deelritWhere(datasetId, filters), PC4LaadNL: { not: null } },
      _sum: { aantalDeelritten: true, brutoGewicht: true },
      orderBy: { _sum: { aantalDeelritten: 'desc' } },
    });
    return results.map((r: typeof results[number]) => ({
      pc4: r.PC4LaadNL,
      count: r._sum.aantalDeelritten ?? 0,
      weight: r._sum.brutoGewicht ?? 0,
    }));
  } else {
    const results = await prisma.deelrit.groupBy({
      by: ['PC4LosNL'],
      where: { ...deelritWhere(datasetId, filters), PC4LosNL: { not: null } },
      _sum: { aantalDeelritten: true, brutoGewicht: true },
      orderBy: { _sum: { aantalDeelritten: 'desc' } },
    });
    return results.map((r: typeof results[number]) => ({
      pc4: r.PC4LosNL,
      count: r._sum.aantalDeelritten ?? 0,
      weight: r._sum.brutoGewicht ?? 0,
    }));
  }
}

// ─── International: countries ───

export async function internationalCountries(datasetId: string, filters: FilterParams) {
  const where = zendingWhere(datasetId, filters);

  const imports = await prisma.zending.groupBy({
    by: ['LaadLand'],
    where: { ...where, isInternational: true, LaadLand: { not: 'NL' } },
    _sum: { zendingAantal: true },
  });

  const exports = await prisma.zending.groupBy({
    by: ['LosLand'],
    where: { ...where, isInternational: true, LosLand: { not: 'NL' } },
    _sum: { zendingAantal: true },
  });

  const countryMap = new Map<string, { geladen: number; gelost: number }>();

  for (const r of imports) {
    const code = r.LaadLand ?? '';
    if (!code) continue;
    const entry = countryMap.get(code) ?? { geladen: 0, gelost: 0 };
    entry.geladen += r._sum.zendingAantal ?? 0;
    countryMap.set(code, entry);
  }

  for (const r of exports) {
    const code = r.LosLand ?? '';
    if (!code) continue;
    const entry = countryMap.get(code) ?? { geladen: 0, gelost: 0 };
    entry.gelost += r._sum.zendingAantal ?? 0;
    countryMap.set(code, entry);
  }

  return [...countryMap.entries()]
    .map(([countryCode, data]) => ({
      countryCode,
      geladenAantal: data.geladen,
      gelostAantal: data.gelost,
    }))
    .sort((a, b) => (b.geladenAantal + b.gelostAantal) - (a.geladenAantal + a.gelostAantal));
}

// ─── Distributions ───

export async function distributionEmissiezone(
  datasetId: string,
  filters: FilterParams,
  direction: 'laad' | 'los'
) {
  if (direction === 'laad') {
    const results = await prisma.zending.groupBy({
      by: ['laad_zone_emissiezonePC6'],
      where: { ...zendingWhere(datasetId, filters), laad_zone_emissiezonePC6: { not: null } },
      _sum: { zendingAantal: true },
    });
    return results.map((r: typeof results[number]) => ({
      name: r.laad_zone_emissiezonePC6 ?? '',
      value: r._sum.zendingAantal ?? 0,
    }));
  } else {
    const results = await prisma.zending.groupBy({
      by: ['los_zone_emissiezonePC6'],
      where: { ...zendingWhere(datasetId, filters), los_zone_emissiezonePC6: { not: null } },
      _sum: { zendingAantal: true },
    });
    return results.map((r: typeof results[number]) => ({
      name: r.los_zone_emissiezonePC6 ?? '',
      value: r._sum.zendingAantal ?? 0,
    }));
  }
}

export async function distributionBrandstof(datasetId: string, filters: FilterParams) {
  const where = deelritWhere(datasetId, filters);

  const results = await prisma.deelrit.groupBy({
    by: ['brandstofsoortKlasse'],
    where,
    _sum: { aantalDeelritten: true },
    orderBy: { _sum: { aantalDeelritten: 'desc' } },
  });

  const lookups = await prisma.lookupEntry.findMany({
    where: { datasetId, tableName: 'brandstofsoort' },
  });
  const nameMap = new Map(lookups.map((l: typeof lookups[number]) => [Number(l.code), l.omschrijving]));

  return results.map((r: typeof results[number]) => ({
    name: nameMap.get(r.brandstofsoortKlasse) ?? `Brandstof ${r.brandstofsoortKlasse}`,
    value: r._sum.aantalDeelritten ?? 0,
  }));
}

export async function distributionGewichtsklasse(datasetId: string, filters: FilterParams) {
  const where = deelritWhere(datasetId, filters);

  const results = await prisma.deelrit.groupBy({
    by: ['maxToegestaanGewicht_klasse'],
    where,
    _sum: { aantalDeelritten: true },
    orderBy: { _sum: { aantalDeelritten: 'desc' } },
  });

  return results.map((r: typeof results[number]) => ({
    name: r.maxToegestaanGewicht_klasse || 'Onbekend',
    value: r._sum.aantalDeelritten ?? 0,
  }));
}

export async function distributionVoertuigcategorie(datasetId: string, filters: FilterParams) {
  const where = deelritWhere(datasetId, filters);

  const results = await prisma.deelrit.groupBy({
    by: ['voertuigsoort'],
    where: { ...where, voertuigsoort: { not: null } },
    _sum: { aantalDeelritten: true },
    orderBy: { _sum: { aantalDeelritten: 'desc' } },
  });

  return results.map((r: typeof results[number]) => ({
    name: r.voertuigsoort ?? 'Onbekend',
    value: r._sum.aantalDeelritten ?? 0,
  }));
}
