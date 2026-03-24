import type { AnprRow, AnprLookupData, LookupEntry } from './types';

/**
 * Transform raw parsed ANPR CSV rows:
 * - Trim whitespace from all dimension values
 * - Parse aantalBezoeken as number
 * - Resolve lookup labels (SBI code → name, province → name, etc.)
 */
export function transformAnprRows(
  rawRows: Record<string, unknown>[],
  lookup: AnprLookupData | null
): AnprRow[] {
  const sbiMap = buildLookupMap(lookup?.sbiGroep);
  const bedrijfsMap = buildLookupMap(lookup?.bedrijfsgrootte);
  const provincieMap = buildLookupMap(lookup?.provincie);
  const tijdstipMap = buildLookupMap(lookup?.tijdstipDag);
  const weekdagMap = buildLookupMap(lookup?.weekdag);

  return rawRows.map((raw) => {
    const row: AnprRow = {
      europeseVoertuigcategorie: trimStr(raw['europeseVoertuigcategorie']),
      aantalBezoeken: safeNum(raw['aantalBezoeken']),
    };

    if ('periode' in raw) row.periode = trimStr(raw['periode']);
    if ('emissieklasse3' in raw) row.emissieklasse3 = trimStr(raw['emissieklasse3']);
    if ('OgSBI08Groep' in raw) {
      row.OgSBI08Groep = trimStr(raw['OgSBI08Groep']);
      row.sbiGroepLabel = sbiMap.get(row.OgSBI08Groep) ?? row.OgSBI08Groep;
    }
    if ('bedrijfsgrootte5Code' in raw) {
      row.bedrijfsgrootte5Code = trimStr(raw['bedrijfsgrootte5Code']);
      row.bedrijfsgrootteLabel = bedrijfsMap.get(row.bedrijfsgrootte5Code) ?? row.bedrijfsgrootte5Code;
    }
    if ('typeBezoeker3' in raw) row.typeBezoeker3 = trimStr(raw['typeBezoeker3']);
    if ('rustNuts2' in raw) {
      row.rustNuts2 = trimStr(raw['rustNuts2']);
      row.provincieLabel = provincieMap.get(row.rustNuts2) ?? row.rustNuts2;
    }
    if ('tijdstipDag6Code' in raw) {
      row.tijdstipDag6Code = trimStr(raw['tijdstipDag6Code']);
      row.tijdstipDagLabel = tijdstipMap.get(row.tijdstipDag6Code) ?? row.tijdstipDag6Code;
    }
    if ('weekdagCode' in raw) {
      row.weekdagCode = trimStr(raw['weekdagCode']);
      row.weekdagLabel = weekdagMap.get(row.weekdagCode) ?? row.weekdagCode;
    }

    return row;
  });
}

function trimStr(val: unknown): string {
  return String(val ?? '').trim();
}

function safeNum(val: unknown): number {
  if (typeof val === 'number') return val;
  const s = String(val ?? '').trim().replace(',', '.');
  const n = Number(s);
  return isNaN(n) ? 0 : n;
}

function buildLookupMap(entries: LookupEntry[] | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!entries) return map;
  for (const e of entries) {
    map.set(String(e.code).trim(), e.omschrijving);
  }
  return map;
}
