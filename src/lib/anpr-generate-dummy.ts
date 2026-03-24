/**
 * TEMPORARY: Generate realistic dummy data for ANPR tables with zero values.
 * Uses M1 totals as the base and randomly distributes across dimensions.
 * Remove this file when real data arrives from CBS.
 */
import type { AnprRow, AnprTable, AnprLookupData } from './types';

export function generateDummyData(
  m1Table: AnprTable,
  allTables: Map<string, AnprTable>,
  _lookup: AnprLookupData | null
): Map<string, AnprTable> {
  // Get annual total from M1
  const annualTotal = m1Table.rows.find(
    (r) => r.periode === '2025' && r.europeseVoertuigcategorie === 'Total' && r.emissieklasse3 === 'Total'
  );
  const baseTotal = annualTotal?.aantalBezoeken ?? 2_000_000;

  // Get monthly pattern from M1 to use as time distribution
  const monthlyPattern = getMonthlyPattern(m1Table.rows);
  const quarterlyPattern = getQuarterlyPattern(m1Table.rows);

  const result = new Map<string, AnprTable>(allTables);

  // Generate for each dummy table
  for (const [id, table] of allTables) {
    if (id === 'M1' || !table.isDummy) continue;

    const generated = generateTableRows(id, table.rows, baseTotal, monthlyPattern, quarterlyPattern);
    result.set(id, { ...table, rows: generated });
  }

  return result;
}

function getMonthlyPattern(m1Rows: AnprRow[]): Map<string, number> {
  const pattern = new Map<string, number>();
  let total = 0;
  for (const r of m1Rows) {
    if (r.periode && /^\d{4}M\d{2}$/.test(r.periode) && r.europeseVoertuigcategorie === 'Total' && r.emissieklasse3 === 'Total') {
      pattern.set(r.periode, r.aantalBezoeken);
      total += r.aantalBezoeken;
    }
  }
  // Normalize to fractions
  if (total > 0) {
    for (const [k, v] of pattern) pattern.set(k, v / total);
  }
  return pattern;
}

function getQuarterlyPattern(m1Rows: AnprRow[]): Map<string, number> {
  const pattern = new Map<string, number>();
  let total = 0;
  for (const r of m1Rows) {
    if (r.periode && /^\d{4}K\d{2}$/.test(r.periode) && r.europeseVoertuigcategorie === 'Total' && r.emissieklasse3 === 'Total') {
      pattern.set(r.periode, r.aantalBezoeken);
      total += r.aantalBezoeken;
    }
  }
  if (total > 0) {
    for (const [k, v] of pattern) pattern.set(k, v / total);
  }
  return pattern;
}

function generateTableRows(
  tableId: string,
  templateRows: AnprRow[],
  baseTotal: number,
  monthlyPattern: Map<string, number>,
  quarterlyPattern: Map<string, number>
): AnprRow[] {
  // Find the unique dimension values (excluding Total rows) from the template
  const rows = [...templateRows];

  // Identify which dimensions this table has
  const hasPeriode = rows.some((r) => r.periode !== undefined);
  const hasSbi = rows.some((r) => r.OgSBI08Groep !== undefined);
  const hasBedrijfsgrootte = rows.some((r) => r.bedrijfsgrootte5Code !== undefined);
  const hasVisitorType = rows.some((r) => r.typeBezoeker3 !== undefined);
  const hasProvince = rows.some((r) => r.rustNuts2 !== undefined);
  const hasTimeSlot = rows.some((r) => r.tijdstipDag6Code !== undefined);
  const hasWeekday = rows.some((r) => r.weekdagCode !== undefined);

  // Collect unique non-Total values per dimension
  const dims: Record<string, string[]> = {};
  if (hasSbi) dims.OgSBI08Groep = uniqueNonTotal(rows, 'OgSBI08Groep');
  if (hasBedrijfsgrootte) dims.bedrijfsgrootte5Code = uniqueNonTotal(rows, 'bedrijfsgrootte5Code');
  if (hasVisitorType) dims.typeBezoeker3 = uniqueNonTotal(rows, 'typeBezoeker3');
  if (hasProvince) dims.rustNuts2 = uniqueNonTotal(rows, 'rustNuts2');
  if (hasTimeSlot) dims.tijdstipDag6Code = uniqueNonTotal(rows, 'tijdstipDag6Code');
  if (hasWeekday) dims.weekdagCode = uniqueNonTotal(rows, 'weekdagCode');

  // Vehicle categories (always present)
  const vehicles = uniqueNonTotal(rows, 'europeseVoertuigcategorie');
  const vehicleWeights = randomWeights(vehicles.length);

  // Generate random weights for each dimension
  const dimWeights: Record<string, number[]> = {};
  for (const [key, values] of Object.entries(dims)) {
    dimWeights[key] = randomWeights(values.length);
  }

  // For each template row, calculate a value
  return rows.map((r) => {
    const newRow = { ...r };

    // Check if this is a "Total" row for any dimension
    const isVehicleTotal = r.europeseVoertuigcategorie === 'Total';
    const dimTotals: Record<string, boolean> = {};
    for (const key of Object.keys(dims)) {
      dimTotals[key] = (r[key as keyof AnprRow] as string) === 'Total';
    }

    // Calculate the value as product of dimension weights
    let value = baseTotal;

    // Vehicle weight
    if (!isVehicleTotal) {
      const idx = vehicles.indexOf(r.europeseVoertuigcategorie);
      value *= idx >= 0 ? vehicleWeights[idx] : 1 / vehicles.length;
    }

    // Other dimension weights
    for (const [key, values] of Object.entries(dims)) {
      if (dimTotals[key]) continue;
      const dimVal = r[key as keyof AnprRow] as string;
      const idx = values.indexOf(dimVal);
      value *= idx >= 0 ? dimWeights[key][idx] : 1 / values.length;
    }

    // Period weight
    if (hasPeriode && r.periode) {
      if (/^\d{4}M\d{2}$/.test(r.periode)) {
        value *= monthlyPattern.get(r.periode) ?? (1 / 12);
      } else if (/^\d{4}K\d{2}$/.test(r.periode)) {
        value *= quarterlyPattern.get(r.periode) ?? (1 / 4);
      }
      // Annual period: no additional weight
    }

    // Add some noise (±15%)
    const noise = 0.85 + Math.random() * 0.30;
    newRow.aantalBezoeken = Math.round(value * noise);

    return newRow;
  });
}

function uniqueNonTotal(rows: AnprRow[], field: keyof AnprRow): string[] {
  const values = new Set<string>();
  for (const r of rows) {
    const val = r[field] as string | undefined;
    if (val !== undefined && val !== 'Total') values.add(val);
  }
  return [...values];
}

/** Generate random weights that sum to ~1, using Dirichlet-like distribution */
function randomWeights(n: number): number[] {
  if (n === 0) return [];
  const raw = Array.from({ length: n }, () => -Math.log(Math.random() + 0.001));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / sum);
}
