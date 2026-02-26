import { parseCSV, readFileAsText, readFileAsArrayBuffer } from './parse-csv';
import { detectXlsxType } from './parse-xlsx';
import { DETECTION_KEYS } from './column-schemas';
import type { DetectedFile, DetectedFileType } from './types';

/**
 * Auto-detect file type by inspecting content (not just filename).
 * Returns detection result with status badge color.
 */
export async function detectFileType(file: File): Promise<DetectedFile> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  // Skip metadata docs
  if (ext === 'docx') {
    return {
      file,
      type: 'METADATA',
      status: 'valid',
      message: 'Metadata-document (wordt niet verwerkt)',
    };
  }

  // Hero image
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
    return {
      file,
      type: 'HERO_IMAGE',
      status: 'valid',
      message: 'Afbeelding gedetecteerd',
    };
  }

  // CSV files
  if (ext === 'csv') {
    return detectCsvType(file);
  }

  // Excel files
  if (ext === 'xlsx' || ext === 'xls') {
    return detectExcelType(file);
  }

  return {
    file,
    type: 'UNKNOWN',
    status: 'error',
    message: `Onbekend bestandstype: .${ext}`,
  };
}

async function detectCsvType(file: File): Promise<DetectedFile> {
  try {
    const text = await readFileAsText(file);
    const { headers, data } = parseCSV(text);

    // Detect by column presence
    if (headers.includes(DETECTION_KEYS.deelritten)) {
      const year = data.length > 0 ? (data[0] as Record<string, unknown>)['jaar'] as number : undefined;
      return {
        file,
        type: 'DEELRITTEN',
        status: 'valid',
        message: `Deelrittenbestand (${data.length.toLocaleString('nl-NL')} rijen)`,
        year,
      };
    }

    if (headers.includes(DETECTION_KEYS.zendingen)) {
      const year = data.length > 0 ? (data[0] as Record<string, unknown>)['jaar'] as number : undefined;
      return {
        file,
        type: 'ZENDINGEN',
        status: 'valid',
        message: `Zendingenbestand (${data.length.toLocaleString('nl-NL')} rijen)`,
        year,
      };
    }

    if (headers.includes(DETECTION_KEYS.gemeenteCode)) {
      return {
        file,
        type: 'CODETABEL_GEMEENTE',
        status: 'valid',
        message: `Gemeentecodetabel (${data.length} gemeenten)`,
      };
    }

    if (headers.includes(DETECTION_KEYS.klasseCode) || headers.includes('stadslogistieke_klasse')) {
      return {
        file,
        type: 'CODETABEL_KLASSE',
        status: 'valid',
        message: 'Stadslogistieke klasse codetabel',
      };
    }

    // Zones file (Amsterdam-style: gemeente, PC6, zone)
    if (headers.includes('zone') && headers.includes('PC6')) {
      return {
        file,
        type: 'METADATA' as const,
        status: 'valid',
        message: `Zone-toewijzing (${data.length} rijen, wordt niet verwerkt)`,
      };
    }

    return {
      file,
      type: 'UNKNOWN',
      status: 'warning',
      message: `CSV met onbekende kolommen: ${headers.slice(0, 3).join(', ')}...`,
    };
  } catch {
    return {
      file,
      type: 'UNKNOWN',
      status: 'error',
      message: 'Fout bij het lezen van CSV-bestand',
    };
  }
}

async function detectExcelType(file: File): Promise<DetectedFile> {
  try {
    const buffer = await readFileAsArrayBuffer(file);
    const xlsxType = detectXlsxType(buffer);

    const typeMap: Record<string, { type: DetectedFileType; message: string }> = {
      VESDI_LOOKUP: { type: 'VESDI_LOOKUP', message: 'VESDI lookup-tabel' },
      CODETABELLEN_GEMEENTE: { type: 'CODETABELLEN_GEMEENTE', message: 'Gemeente codetabellen' },
      NUTS_SCHEMA: { type: 'NUTS_SCHEMA', message: 'NUTS-indeling schema' },
    };

    const match = typeMap[xlsxType];
    if (match) {
      return { file, ...match, status: 'valid' };
    }

    return {
      file,
      type: 'UNKNOWN',
      status: 'warning',
      message: 'Excel-bestand met onbekende structuur',
    };
  } catch {
    return {
      file,
      type: 'UNKNOWN',
      status: 'error',
      message: 'Fout bij het lezen van Excel-bestand',
    };
  }
}
