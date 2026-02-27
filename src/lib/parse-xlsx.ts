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
 * Known section header names in the CBS codetabellen XLSX → lookup field mapping.
 */
const SECTION_MAP: Record<string, keyof LookupData> = {
  voertuigsoortrdw: 'voertuigsoortRDW',
  euronormklasse: 'voertuigsoortRDW', // handled separately — see note below
  brandstofsoortklasse: 'brandstofsoort',
  laadvermogencombinatie_klasse: 'laadvermogenCombinatie',
  leeggewichtcombinatie_klasse: 'leeggewichtCombinatie',
  maxtoegestaangewicht_klasse: 'maxToegestaanGewicht',
  stadslogistieke_klasse_code: 'logistiekeKlasse',
  stadslogistieke_klasse_legerit_code: 'legeRit',
};

/**
 * Parse codetabellen_VESDI_gemeente_*.xlsx → partial LookupData
 *
 * CBS provides this file with two sheets ("Zendingen" and "Deelritten").
 * Each sheet contains multiple embedded lookup tables in the format:
 *
 *   sectionName | "code"        | "omschrijving"
 *               | <code value>  | <description>
 *               | <code value>  | <description>
 *               | (empty row)
 *
 * This parser scans each sheet row-by-row, detects section headers by
 * checking if column A is a known field name with "code" in column B,
 * then collects the data rows until the next blank row.
 */
export function parseCodetabellenXlsx(buffer: ArrayBuffer): Partial<LookupData> {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const result: Partial<LookupData> = {};

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
    });

    let currentSection: keyof LookupData | null = null;
    let entries: LookupEntry[] = [];

    for (const row of rows) {
      const colA = String(row[0] ?? '').trim();
      const colB = String(row[1] ?? '').trim();
      const colC = String(row[2] ?? '').trim();

      // Detect section header: colA is a known field, colB = "code", colC = "omschrijving"
      if (colB.toLowerCase() === 'code' && colC.toLowerCase() === 'omschrijving') {
        // Flush previous section
        if (currentSection && entries.length > 0) {
          result[currentSection] = [
            ...(result[currentSection] || []),
            ...entries,
          ];
        }

        const key = colA.toLowerCase();
        // Skip EuronormKlasse — it's not a lookup we use (already a data column)
        if (key === 'euronormklasse') {
          currentSection = null;
          entries = [];
          continue;
        }

        currentSection = SECTION_MAP[key] || null;
        entries = [];
        continue;
      }

      // Data row: colA empty, colB has a code value
      if (currentSection && colA === '' && colB !== '') {
        // Parse code: keep as number if numeric, otherwise string
        const numCode = Number(colB);
        const code = !isNaN(numCode) && String(numCode) === colB ? numCode : colB;
        // Capitalize first letter of omschrijving (CBS sometimes uses lowercase)
        const omschrijving = colC.charAt(0).toUpperCase() + colC.slice(1);
        entries.push({ code, omschrijving });
        continue;
      }

      // Empty row or non-matching row → flush section
      if (currentSection && colB === '') {
        if (entries.length > 0) {
          result[currentSection] = [
            ...(result[currentSection] || []),
            ...entries,
          ];
        }
        currentSection = null;
        entries = [];
      }
    }

    // Flush last section
    if (currentSection && entries.length > 0) {
      result[currentSection] = [
        ...(result[currentSection] || []),
        ...entries,
      ];
    }
  }

  return result;
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
