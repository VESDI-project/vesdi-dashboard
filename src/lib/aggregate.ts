import type {
  ZendingRow,
  DeelritRow,
  KlasseCount,
  CountryData,
  Nuts3Data,
  PC4Data,
  TrendPoint,
  BeladingsgraadKlasse,
} from './types';
import { getCountryFromNuts3, getCountryCode } from './country-codes';

// ─── Trend Aggregations (across years) ───

export function trendDeelrittenKms(
  deelrittenByYear: Map<number, DeelritRow[]>,
  municipalityCode: string
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const [year, rows] of deelrittenByYear) {
    const national = rows.filter((r) => r.isNational);
    const totalTrips = national.reduce((s, r) => s + r.aantalDeelritten, 0);
    // Intra-gemeente = laadGemeente === losGemeente === municipalityCode
    const intraRows = national.filter(
      (r) => r.laadGemeente === municipalityCode && r.losGemeente === municipalityCode
    );
    const kmsIntra = intraRows.reduce(
      (s, r) => s + r.deelritAfstandGemiddeld * r.aantalDeelritten,
      0
    );
    points.push({ year, value: totalTrips, value2: kmsIntra });
  }
  return points.sort((a, b) => a.year - b.year);
}

export function trendEuro6Percentage(
  deelrittenByYear: Map<number, DeelritRow[]>
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const [year, rows] of deelrittenByYear) {
    const national = rows.filter((r) => r.isNational);
    const totalTrips = national.reduce((s, r) => s + r.aantalDeelritten, 0);
    const euro6Trips = national
      .filter((r) => r.euronormKlasse === '6')
      .reduce((s, r) => s + r.aantalDeelritten, 0);
    points.push({ year, value: totalTrips > 0 ? euro6Trips / totalTrips : 0 });
  }
  return points.sort((a, b) => a.year - b.year);
}

export function trendZendingenGewicht(
  zendingenByYear: Map<number, ZendingRow[]>
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const [year, rows] of zendingenByYear) {
    const totalAantal = rows.reduce((s, r) => s + r.zendingAantal, 0);
    const totalGewicht = rows.reduce((s, r) => s + r.brutoGewicht, 0);
    points.push({ year, value: totalAantal, value2: totalGewicht });
  }
  return points.sort((a, b) => a.year - b.year);
}

// ─── Beladingsgraad per klasse (weighted average) ───

export function beladingsgraadPerKlasse(
  deelrittenByYear: Map<number, DeelritRow[]>
): BeladingsgraadKlasse[] {
  // Collect all klasses
  const allKlasses = new Set<string>();
  for (const rows of deelrittenByYear.values()) {
    const national = rows.filter((r) => r.isNational);
    for (const r of national) {
      if (r.stadslogistieke_klasse) allKlasses.add(r.stadslogistieke_klasse);
    }
  }

  const results: BeladingsgraadKlasse[] = [];
  for (const klasse of allKlasses) {
    const row: BeladingsgraadKlasse = { klasse };
    for (const [year, rows] of deelrittenByYear) {
      const national = rows.filter((r) => r.isNational);
      const klasseRows = national.filter((r) => r.stadslogistieke_klasse === klasse);
      const totalTrips = klasseRows.reduce((s, r) => s + r.aantalDeelritten, 0);
      const weightedSum = klasseRows.reduce(
        (s, r) => s + (r.beladingsgraadGewichtGemiddeld / 100) * r.aantalDeelritten,
        0
      );
      row[String(year)] = totalTrips > 0 ? Math.round((weightedSum / totalTrips) * 100) : 0;
    }
    results.push(row);
  }

  // Sort by most recent year value descending
  const years = [...deelrittenByYear.keys()].sort((a, b) => b - a);
  const latestYear = String(years[0] || '');
  return results
    .filter((r) => r.klasse !== '***Lege_rit***')
    .sort((a, b) => (Number(b[latestYear]) || 0) - (Number(a[latestYear]) || 0))
    .slice(0, 10);
}

// ─── Vehicle type percentage per year (for 100% stacked bar) ───

export function voertuigTypePerYear(
  deelrittenByYear: Map<number, DeelritRow[]>
): { year: number; [voertuig: string]: number }[] {
  const results: { year: number; [voertuig: string]: number }[] = [];
  for (const [year, rows] of deelrittenByYear) {
    const national = rows.filter((r) => r.isNational);
    const totalTrips = national.reduce((s, r) => s + r.aantalDeelritten, 0);
    const byType = new Map<string, number>();
    for (const r of national) {
      const type = r.voertuigsoort || `Type ${r.voertuigsoortRDW}`;
      byType.set(type, (byType.get(type) || 0) + r.aantalDeelritten);
    }
    const entry: Record<string, number> = { year };
    for (const [type, count] of byType) {
      entry[type] = totalTrips > 0 ? count / totalTrips : 0;
    }
    results.push(entry as { year: number; [voertuig: string]: number });
  }
  return results.sort((a, b) => a.year - b.year);
}

// ─── Deelritten per klasse per year (for grouped bar) ───

export function deelrittenPerKlassePerYear(
  deelrittenByYear: Map<number, DeelritRow[]>
): Record<string, string | number>[] {
  const allKlasses = new Set<string>();
  const dataByKlasseYear = new Map<string, Map<number, number>>();

  for (const [year, rows] of deelrittenByYear) {
    const national = rows.filter((r) => r.isNational);
    for (const r of national) {
      const k = r.stadslogistieke_klasse || `Klasse ${r.stadslogistieke_klasse_code}`;
      allKlasses.add(k);
      if (!dataByKlasseYear.has(k)) dataByKlasseYear.set(k, new Map());
      const yearMap = dataByKlasseYear.get(k)!;
      yearMap.set(year, (yearMap.get(year) || 0) + r.aantalDeelritten);
    }
  }

  const years = [...deelrittenByYear.keys()].sort();
  const latestYear = years[years.length - 1];
  return [...allKlasses]
    .map((klasse) => {
      const entry: Record<string, number | string> = { klasse };
      const yearMap = dataByKlasseYear.get(klasse)!;
      for (const y of years) {
        entry[String(y)] = yearMap.get(y) || 0;
      }
      return entry as Record<string, string | number>;
    })
    .sort((a, b) => (Number(b[String(latestYear)]) || 0) - (Number(a[String(latestYear)]) || 0));
}

// ─── Single-year aggregations ───

export function sumKPIs(
  rows: ZendingRow[]
): { zendingAantal: number; brutoGewicht: number } {
  return {
    zendingAantal: rows.reduce((s, r) => s + r.zendingAantal, 0),
    brutoGewicht: rows.reduce((s, r) => s + r.brutoGewicht, 0),
  };
}

export function sumDeelritKPIs(
  rows: DeelritRow[]
): { aantalDeelritten: number; brutoGewicht: number; beladingsgraad: number } {
  const totalTrips = rows.reduce((s, r) => s + r.aantalDeelritten, 0);
  const totalWeight = rows.reduce((s, r) => s + r.brutoGewicht, 0);
  const weightedBelading = rows.reduce(
    (s, r) => s + (r.beladingsgraadGewichtGemiddeld / 100) * r.aantalDeelritten,
    0
  );
  return {
    aantalDeelritten: totalTrips,
    brutoGewicht: totalWeight,
    beladingsgraad: totalTrips > 0 ? weightedBelading / totalTrips : 0,
  };
}

export function zendingenPerKlasse(rows: ZendingRow[]): KlasseCount[] {
  const map = new Map<string, { count: number; weight: number }>();
  for (const r of rows) {
    const k = r.stadslogistieke_klasse || `Klasse ${r.stadslogistieke_klasse_code}`;
    const current = map.get(k) || { count: 0, weight: 0 };
    current.count += r.zendingAantal;
    current.weight += r.brutoGewicht;
    map.set(k, current);
  }
  return [...map.entries()]
    .map(([klasse, v]) => ({ klasse, ...v }))
    .sort((a, b) => b.count - a.count);
}

export function deelrittenPerKlasse(rows: DeelritRow[]): KlasseCount[] {
  const map = new Map<string, { count: number; weight: number }>();
  for (const r of rows) {
    const k = r.stadslogistieke_klasse || `Klasse ${r.stadslogistieke_klasse_code}`;
    const current = map.get(k) || { count: 0, weight: 0 };
    current.count += r.aantalDeelritten;
    current.weight += r.brutoGewicht;
    map.set(k, current);
  }
  return [...map.entries()]
    .map(([klasse, v]) => ({ klasse, ...v }))
    .sort((a, b) => b.count - a.count);
}

// ─── NUTS3 aggregation for choropleth maps ───

export function zendingenPerNuts3Laad(
  rows: ZendingRow[],
  municipalityCode: string
): Nuts3Data[] {
  // Zendingen NAAR de gemeente: filter losGemeente = municipality, group by laadNuts3
  const filtered = rows.filter((r) => r.losGemeente === municipalityCode);
  return aggregateByNuts3(filtered, 'laadNuts3', 'zendingAantal');
}

export function zendingenPerNuts3Los(
  rows: ZendingRow[],
  municipalityCode: string
): Nuts3Data[] {
  // Zendingen VANUIT de gemeente: filter laadGemeente = municipality, group by losNuts3
  const filtered = rows.filter((r) => r.laadGemeente === municipalityCode);
  return aggregateByNuts3(filtered, 'losNuts3', 'zendingAantal');
}

function aggregateByNuts3(
  rows: (ZendingRow | DeelritRow)[],
  nuts3Field: 'laadNuts3' | 'losNuts3',
  countField: 'zendingAantal' | 'aantalDeelritten'
): Nuts3Data[] {
  const map = new Map<string, number>();
  let total = 0;
  for (const r of rows) {
    const nuts3 = r[nuts3Field];
    if (!nuts3) continue;
    const count = (r as unknown as Record<string, number>)[countField] || 0;
    map.set(nuts3, (map.get(nuts3) || 0) + count);
    total += count;
  }
  return [...map.entries()]
    .map(([nuts3, count]) => ({
      nuts3,
      count,
      percentage: total > 0 ? count / total : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// ─── International: country-level aggregation ───

export function internationalPerCountry(
  rows: ZendingRow[]
): CountryData[] {
  const map = new Map<string, { geladen: number; gelost: number }>();

  for (const r of rows) {
    if (!r.isInternational) continue;

    // Import: loaded abroad (LaadLand != NL)
    if (r.LaadLand && r.LaadLand !== 'NL') {
      const current = map.get(r.LaadLand) || { geladen: 0, gelost: 0 };
      current.geladen += r.zendingAantal;
      map.set(r.LaadLand, current);
    }

    // Export: delivered abroad (LosLand != NL)
    if (r.LosLand && r.LosLand !== 'NL') {
      const current = map.get(r.LosLand) || { geladen: 0, gelost: 0 };
      current.gelost += r.zendingAantal;
      map.set(r.LosLand, current);
    }
  }

  return [...map.entries()]
    .map(([code, data]) => ({
      country: getCountryFromNuts3(code + '000'),
      countryCode: code,
      geladenAantal: data.geladen,
      gelostAantal: data.gelost,
    }))
    .sort((a, b) => (b.geladenAantal + b.gelostAantal) - (a.geladenAantal + a.gelostAantal));
}

export function importExportPercentage(
  rows: ZendingRow[]
): { importPct: number; exportPct: number } {
  const intl = rows.filter((r) => r.isInternational);
  const total = intl.reduce((s, r) => s + r.zendingAantal, 0);
  const importCount = intl
    .filter((r) => r.isImport)
    .reduce((s, r) => s + r.zendingAantal, 0);
  const exportCount = intl
    .filter((r) => r.isExport)
    .reduce((s, r) => s + r.zendingAantal, 0);
  return {
    importPct: total > 0 ? importCount / total : 0,
    exportPct: total > 0 ? exportCount / total : 0,
  };
}

// ─── PC4 aggregation for bubble/choropleth maps ───

export function deelrittenPerPC4Laad(rows: DeelritRow[]): PC4Data[] {
  const map = new Map<string, { count: number; weight: number; beladSum: number }>();
  for (const r of rows) {
    const pc4 = r.PC4LaadNL;
    if (!pc4) continue;
    const current = map.get(pc4) || { count: 0, weight: 0, beladSum: 0 };
    current.count += r.aantalDeelritten;
    current.weight += r.brutoGewicht;
    current.beladSum += (r.beladingsgraadGewichtGemiddeld / 100) * r.aantalDeelritten;
    map.set(pc4, current);
  }
  return [...map.entries()]
    .map(([pc4, v]) => ({
      pc4,
      count: v.count,
      weight: v.weight,
      beladingsgraad: v.count > 0 ? v.beladSum / v.count : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function deelrittenPerPC4Los(rows: DeelritRow[]): PC4Data[] {
  const map = new Map<string, { count: number; weight: number; beladSum: number }>();
  for (const r of rows) {
    const pc4 = r.PC4LosNL;
    if (!pc4) continue;
    const current = map.get(pc4) || { count: 0, weight: 0, beladSum: 0 };
    current.count += r.aantalDeelritten;
    current.weight += r.brutoGewicht;
    current.beladSum += (r.beladingsgraadGewichtGemiddeld / 100) * r.aantalDeelritten;
    map.set(pc4, current);
  }
  return [...map.entries()]
    .map(([pc4, v]) => ({
      pc4,
      count: v.count,
      weight: v.weight,
      beladingsgraad: v.count > 0 ? v.beladSum / v.count : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function deelrittenPerPC6Laad(rows: DeelritRow[]): PC4Data[] {
  const map = new Map<string, { count: number; weight: number; beladSum: number }>();
  for (const r of rows) {
    const pc6 = r.laadPC6;
    if (!pc6 || String(pc6).trim().length < 6) continue;
    const key = String(pc6).trim();
    const current = map.get(key) || { count: 0, weight: 0, beladSum: 0 };
    current.count += r.aantalDeelritten;
    current.weight += r.brutoGewicht;
    current.beladSum += (r.beladingsgraadGewichtGemiddeld / 100) * r.aantalDeelritten;
    map.set(key, current);
  }
  return [...map.entries()]
    .map(([pc4, v]) => ({
      pc4,
      count: v.count,
      weight: v.weight,
      beladingsgraad: v.count > 0 ? v.beladSum / v.count : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function deelrittenPerPC6Los(rows: DeelritRow[]): PC4Data[] {
  const map = new Map<string, { count: number; weight: number; beladSum: number }>();
  for (const r of rows) {
    const pc6 = r.losPC6;
    if (!pc6 || String(pc6).trim().length < 6) continue;
    const key = String(pc6).trim();
    const current = map.get(key) || { count: 0, weight: 0, beladSum: 0 };
    current.count += r.aantalDeelritten;
    current.weight += r.brutoGewicht;
    current.beladSum += (r.beladingsgraadGewichtGemiddeld / 100) * r.aantalDeelritten;
    map.set(key, current);
  }
  return [...map.entries()]
    .map(([pc4, v]) => ({
      pc4,
      count: v.count,
      weight: v.weight,
      beladingsgraad: v.count > 0 ? v.beladSum / v.count : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// ─── Emissiezone donut data ───

export function emissiezoneDistribution(
  rows: ZendingRow[],
  field: 'laad_zone_emissiezonePC6' | 'los_zone_emissiezonePC6'
): { name: string; value: number }[] {
  let ja = 0;
  let nee = 0;
  let hasData = false;
  for (const r of rows) {
    const val = r[field];
    if (val == null || val === '') continue;
    hasData = true;
    if (val === 'ja' || val === 'Ja') {
      ja += r.zendingAantal;
    } else {
      nee += r.zendingAantal;
    }
  }
  if (!hasData) return [];
  return [
    { name: 'Ja', value: ja },
    { name: 'Nee', value: nee },
  ];
}

// ─── Fuel type distribution (stacked bar) ───

export function brandstofDistribution(
  rows: DeelritRow[],
  lookup: { code: number | string; omschrijving: string }[]
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  const lookupMap = new Map<number, string>();
  for (const e of lookup) lookupMap.set(Number(e.code), e.omschrijving);

  for (const r of rows) {
    const name = lookupMap.get(r.brandstofsoortKlasse) || `Brandstof ${r.brandstofsoortKlasse}`;
    map.set(name, (map.get(name) || 0) + r.aantalDeelritten);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ─── Weight class distribution (donut) ───

export function gewichtsklasseDistribution(
  rows: DeelritRow[]
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const name = r.maxToegestaanGewicht_klasse || 'Onbekend';
    map.set(name, (map.get(name) || 0) + r.aantalDeelritten);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ─── Vehicle category distribution (donut) ───

export function voertuigcategorieDistribution(
  rows: DeelritRow[]
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const name = r.voertuigsoort || `Voertuigsoort ${r.voertuigsoortRDW}`;
    map.set(name, (map.get(name) || 0) + r.aantalDeelritten);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ─── Data completeness (volledigheid) ───

export function dataCompleteness(
  rows: Record<string, unknown>[],
  fields: string[]
): { field: string; completeness: number }[] {
  const total = rows.length;
  if (total === 0) return fields.map((field) => ({ field, completeness: 0 }));

  return fields.map((field) => {
    const filled = rows.filter((r) => {
      const val = r[field];
      return val !== null && val !== undefined && val !== '' && String(val).trim() !== '';
    }).length;
    return { field, completeness: filled / total };
  });
}

// ─── Euro-6 percentage for KPI ───

export function euro6Percentage(rows: DeelritRow[]): number {
  const total = rows.reduce((s, r) => s + r.aantalDeelritten, 0);
  const euro6 = rows
    .filter((r) => r.euronormKlasse === '6')
    .reduce((s, r) => s + r.aantalDeelritten, 0);
  return total > 0 ? euro6 / total : 0;
}

// ─── Lege deelritten percentage ───

export function legeDeelrittenPercentage(rows: DeelritRow[]): number {
  const total = rows.reduce((s, r) => s + r.aantalDeelritten, 0);
  const leeg = rows.reduce((s, r) => s + r.aantalLegeDeelritten, 0);
  return total > 0 ? leeg / total : 0;
}
