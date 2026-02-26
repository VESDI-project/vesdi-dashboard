import Papa from 'papaparse';

/**
 * Parse a semicolon-delimited CSV file with headers.
 * CBS delivers files with semicolon delimiter, quoted fields, and dynamic typing.
 */
export function parseCSV<T = Record<string, unknown>>(
  fileContent: string
): { data: T[]; headers: string[]; errors: Papa.ParseError[] } {
  const result = Papa.parse<T>(fileContent, {
    delimiter: ';',
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim().replace(/^"|"$/g, ''),
  });

  return {
    data: result.data,
    headers: result.meta.fields || [],
    errors: result.errors,
  };
}

/**
 * Read file content as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Read file content as ArrayBuffer (for XLSX parsing)
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}
