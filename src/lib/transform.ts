import type { ZendingRow, DeelritRow, LookupData, LookupEntry } from './types';

type GeoLevel = 'PC6' | 'PC4' | 'NUTS3' | null;

/**
 * Resolve the best available geographic key and level for a location.
 * Fallback chain: PC6 → PC4 → NUTS3
 *
 * - PC6 present → derive PC4 from PC6[:4], geoKey = PC4 code, level = 'PC6'
 * - PC4 present → geoKey = PC4 code, level = 'PC4'
 * - NUTS3 present → geoKey = NUTS3 code (prefixed "NUTS3:"), level = 'NUTS3'
 *
 * The geoKey for PC6/PC4 is always the 4-digit PC4 code (for centroid lookup).
 * The geoKey for NUTS3 is the NUTS3 code prefixed with "NUTS3:" to distinguish
 * it from PC4 codes in centroid lookups.
 */
function resolveGeo(
  pc6: string | undefined | null,
  pc4: string | undefined | null,
  nuts3: string | undefined | null,
  land: string
): { geoKey: string | null; geoLevel: GeoLevel; pc4NL: string | null } {
  // PC6 available → use full PC6 as geoKey for centroid precision
  if (pc6 && String(pc6).trim().length >= 4) {
    const pc6Str = String(pc6).trim();
    const derivedPC4 = pc6Str.substring(0, 4);
    return {
      geoKey: land === 'NL' ? pc6Str : `NUTS3:${nuts3 || ''}`,
      geoLevel: 'PC6',
      pc4NL: land === 'NL' ? derivedPC4 : null,
    };
  }

  // PC4 available
  if (pc4 && String(pc4).trim().length >= 4) {
    const pc4Str = String(pc4).trim();
    return {
      geoKey: land === 'NL' ? pc4Str : `NUTS3:${nuts3 || ''}`,
      geoLevel: 'PC4',
      pc4NL: land === 'NL' ? pc4Str : null,
    };
  }

  // Only NUTS3 available
  if (nuts3 && String(nuts3).trim().length > 0) {
    return {
      geoKey: `NUTS3:${nuts3}`,
      geoLevel: 'NUTS3',
      pc4NL: null,
    };
  }

  return { geoKey: null, geoLevel: null, pc4NL: null };
}

/**
 * Add derived columns to zendingen data
 */
export function transformZendingen(
  rows: ZendingRow[],
  lookup: LookupData | null
): ZendingRow[] {
  const klasseMap = buildKlasseMap(lookup);

  return rows.map((row) => {
    const LaadLand = row.laadNuts3 ? row.laadNuts3.substring(0, 2) : '';
    const LosLand = row.losNuts3 ? row.losNuts3.substring(0, 2) : '';
    const isNational = LaadLand === 'NL' && LosLand === 'NL';

    const laadGeo = resolveGeo(row.laadPC6, row.laadPC4, row.laadNuts3, LaadLand);
    const losGeo = resolveGeo(row.losPC6, row.losPC4, row.losNuts3, LosLand);

    return {
      ...row,
      LaadLand,
      LosLand,
      PC4LaadNL: laadGeo.pc4NL,
      PC4LosNL: losGeo.pc4NL,
      geoKeyLaad: laadGeo.geoKey,
      geoKeyLos: losGeo.geoKey,
      geoLevelLaad: laadGeo.geoLevel,
      geoLevelLos: losGeo.geoLevel,
      isNational,
      isInternational: !isNational,
      isImport: LaadLand !== 'NL' && LaadLand !== '',
      isExport: LosLand !== 'NL' && LosLand !== '',
      stadslogistieke_klasse:
        klasseMap.get(row.stadslogistieke_klasse_code) ||
        `Klasse ${row.stadslogistieke_klasse_code}`,
    };
  });
}

/**
 * Add derived columns to deelritten data
 */
export function transformDeelritten(
  rows: DeelritRow[],
  lookup: LookupData | null
): DeelritRow[] {
  const klasseMap = buildKlasseMap(lookup);
  const voertuigMap = buildVoertuigMap(lookup);
  const maxGewichtMap = buildStringLookupMap(lookup?.maxToegestaanGewicht);
  const leeggewichtMap = buildStringLookupMap(lookup?.leeggewichtCombinatie);
  const laadvermogenMap = buildStringLookupMap(lookup?.laadvermogenCombinatie);

  return rows.map((row) => {
    const LaadLand = row.laadNuts3 ? row.laadNuts3.substring(0, 2) : '';
    const LosLand = row.losNuts3 ? row.losNuts3.substring(0, 2) : '';
    const isNational = LaadLand === 'NL' && LosLand === 'NL';

    const laadGeo = resolveGeo(row.laadPC6, row.laadPC4, row.laadNuts3, LaadLand);
    const losGeo = resolveGeo(row.losPC6, row.losPC4, row.losNuts3, LosLand);

    return {
      ...row,
      LaadLand,
      LosLand,
      PC4LaadNL: laadGeo.pc4NL,
      PC4LosNL: losGeo.pc4NL,
      geoKeyLaad: laadGeo.geoKey,
      geoKeyLos: losGeo.geoKey,
      geoLevelLaad: laadGeo.geoLevel,
      geoLevelLos: losGeo.geoLevel,
      isNational,
      isInternational: !isNational,
      isImport: LaadLand !== 'NL' && LaadLand !== '',
      isExport: LosLand !== 'NL' && LosLand !== '',
      stadslogistieke_klasse:
        klasseMap.get(row.stadslogistieke_klasse_code) ||
        `Klasse ${row.stadslogistieke_klasse_code}`,
      voertuigsoort:
        voertuigMap.get(row.voertuigsoortRDW) ||
        `Voertuigsoort ${row.voertuigsoortRDW}`,
      maxToegestaanGewicht_klasse:
        maxGewichtMap.get(String(row.maxToegestaanGewicht_klasse)) ||
        row.maxToegestaanGewicht_klasse,
      leeggewichtCombinatie_klasse:
        leeggewichtMap.get(String(row.leeggewichtCombinatie_klasse)) ||
        row.leeggewichtCombinatie_klasse,
      laadvermogenCombinatie_klasse:
        laadvermogenMap.get(String(row.laadvermogenCombinatie_klasse)) ||
        row.laadvermogenCombinatie_klasse,
    };
  });
}

function buildKlasseMap(lookup: LookupData | null): Map<number, string> {
  const map = new Map<number, string>();
  if (lookup) {
    for (const entry of lookup.logistiekeKlasse) {
      map.set(Number(entry.code), entry.omschrijving);
    }
  }
  return map;
}

function buildVoertuigMap(lookup: LookupData | null): Map<number, string> {
  const map = new Map<number, string>();
  if (lookup) {
    for (const entry of lookup.voertuigsoortRDW) {
      map.set(Number(entry.code), entry.omschrijving);
    }
  }
  return map;
}

function buildStringLookupMap(entries: LookupEntry[] | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (entries) {
    for (const entry of entries) {
      map.set(String(entry.code), entry.omschrijving);
    }
  }
  return map;
}
