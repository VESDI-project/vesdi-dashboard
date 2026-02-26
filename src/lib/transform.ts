import type { ZendingRow, DeelritRow, LookupData } from './types';

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

    return {
      ...row,
      LaadLand,
      LosLand,
      PC4LaadNL: row.laadPC4 && LaadLand === 'NL' ? row.laadPC4 : null,
      PC4LosNL: row.losPC4 && LosLand === 'NL' ? row.losPC4 : null,
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

  return rows.map((row) => {
    const LaadLand = row.laadNuts3 ? row.laadNuts3.substring(0, 2) : '';
    const LosLand = row.losNuts3 ? row.losNuts3.substring(0, 2) : '';
    const isNational = LaadLand === 'NL' && LosLand === 'NL';

    return {
      ...row,
      LaadLand,
      LosLand,
      PC4LaadNL: row.laadPC4 && LaadLand === 'NL' ? row.laadPC4 : null,
      PC4LosNL: row.losPC4 && LosLand === 'NL' ? row.losPC4 : null,
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
