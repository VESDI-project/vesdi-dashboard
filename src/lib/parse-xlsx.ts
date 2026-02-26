import * as XLSX from 'xlsx';
import type { LookupData, LookupEntry, NutsMapping } from './types';

/**
 * Parse VESDI_lookup.xlsx → LookupData
 * Sheets: VoertuigsoortRDW, Brandstofsoort, LaadvermogenCombinatie,
 *         MaxToegestaanGewicht, LeeggewichtCombinatie, LogistiekeKlasse,
 *         LegeRit, NUTS3, Gemeentecode
 */
export function parseLookupXlsx(buffer: ArrayBuffer): LookupData {
  const workbook = XLSX.read(buffer, { type: 'array' });

  const readSheet = (name: string): LookupEntry[] => {
    const sheet = workbook.Sheets[name];
    if (!sheet) return [];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    return rows.map((row) => ({
      code: row['code'] as number | string,
      omschrijving: (row['omschrijving'] as string) || '',
    }));
  };

  return {
    voertuigsoortRDW: readSheet('VoertuigsoortRDW'),
    brandstofsoort: readSheet('Brandstofsoort'),
    laadvermogenCombinatie: readSheet('LaadvermogenCombinatie'),
    maxToegestaanGewicht: readSheet('MaxToegestaanGewicht'),
    leeggewichtCombinatie: readSheet('LeeggewichtCombinatie'),
    logistiekeKlasse: readSheet('LogistiekeKlasse'),
    legeRit: readSheet('LegeRit'),
    nuts3: readSheet('NUTS3'),
    gemeentecode: readSheet('Gemeentecode'),
  };
}

/**
 * Parse NL_NUTS_schema Excel → NutsMapping[]
 */
export function parseNutsSchema(buffer: ArrayBuffer): NutsMapping[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // Data starts at row 2 (row 1 is "Verslagjaar XXXX")
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { range: 1 });

  return rows.map((row) => ({
    gemeentecode: String(row['Gemeentecode'] || '').padStart(4, '0'),
    gemeentenaam: String(row['Gemeentenaam'] || ''),
    nuts1: String(row['NUTS1'] || ''),
    nuts2: String(row['NUTS2'] || ''),
    nuts3: String(row['NUTS3'] || ''),
    degurba: Number(row['DEGURBA'] || 0),
  }));
}

/**
 * Detect if an XLSX file is the VESDI_lookup, codetabellen, or NUTS schema
 */
export function detectXlsxType(
  buffer: ArrayBuffer
): 'VESDI_LOOKUP' | 'CODETABELLEN_GEMEENTE' | 'NUTS_SCHEMA' | 'UNKNOWN' {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  if (sheetNames.includes('VoertuigsoortRDW') && sheetNames.includes('Brandstofsoort')) {
    return 'VESDI_LOOKUP';
  }

  if (sheetNames.includes('Zendingen') || sheetNames.includes('Deelritten')) {
    return 'CODETABELLEN_GEMEENTE';
  }

  // Check for NUTS schema pattern
  const firstSheet = workbook.Sheets[sheetNames[0]];
  const firstRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { range: 1 });
  if (firstRows.length > 0 && 'Gemeentecode' in firstRows[0] && 'NUTS1' in firstRows[0]) {
    return 'NUTS_SCHEMA';
  }

  return 'UNKNOWN';
}
