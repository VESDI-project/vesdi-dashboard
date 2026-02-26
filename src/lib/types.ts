// Raw row from DATA_zendingenbestand CSV
export interface ZendingRow {
  jaar: number;
  laadPC6: string;
  laadPC4: string;
  laadGemeente: string;
  laadNuts3: string;
  losPC6: string;
  losPC4: string;
  losGemeente: string;
  losNuts3: string;
  stadslogistieke_klasse_code: number;
  euronormKlasse: string;
  brandstofsoortKlasse: number;
  laad_zone_emissiezonePC6?: string;
  laad_zone_voetganger?: string;
  laad_zone_afgesloten_laden_lossen?: string;
  laad_zone_afgesloten?: string;
  los_zone_emissiezonePC6?: string;
  los_zone_voetganger?: string;
  los_zone_afgesloten_laden_lossen?: string;
  los_zone_afgesloten?: string;
  dummy_laadInROI: number;
  dummy_losInROI: number;
  zendingAantal: number;
  brutoGewicht: number;
  zendingAfstandGemiddeld: number;
  // Derived columns
  LaadLand?: string;
  LosLand?: string;
  PC4LaadNL?: string | null;
  PC4LosNL?: string | null;
  geoKeyLaad?: string | null;   // Best available geo key: PC4 code or NUTS3 code
  geoKeyLos?: string | null;
  geoLevelLaad?: 'PC6' | 'PC4' | 'NUTS3' | null;
  geoLevelLos?: 'PC6' | 'PC4' | 'NUTS3' | null;
  isNational?: boolean;
  isInternational?: boolean;
  isImport?: boolean;
  isExport?: boolean;
  stadslogistieke_klasse?: string;
}

// Raw row from DATA_deelrittenbestand CSV
export interface DeelritRow {
  jaar: number;
  voertuigsoortRDW: number;
  laadPC6: string;
  laadPC4: string;
  laadGemeente: string;
  laadNuts3: string;
  losPC6: string;
  losPC4: string;
  losGemeente: string;
  losNuts3: string;
  stadslogistieke_klasse_code: number;
  stadslogistieke_klasse_legeRit_code: string;
  euronormKlasse: string;
  brandstofsoortKlasse: number;
  laadvermogenCombinatie_klasse: string;
  leeggewichtCombinatie_klasse: string;
  maxToegestaanGewicht_klasse: string;
  laad_zone_emissiezonePC6?: string;
  laad_zone_voetganger?: string;
  laad_zone_afgesloten_laden_lossen?: string;
  laad_zone_afgesloten?: string;
  los_zone_emissiezonePC6?: string;
  los_zone_voetganger?: string;
  los_zone_afgesloten_laden_lossen?: string;
  los_zone_afgesloten?: string;
  dummy_laadInROI: number;
  dummy_losInROI: number;
  aantalDeelritten: number;
  aantalLegeDeelritten: number;
  brutoGewicht: number;
  deelritAfstandGemiddeld: number;
  beladingsgraadGewichtGemiddeld: number;
  aantalZendingenRitGemiddeld: number;
  // Derived columns
  LaadLand?: string;
  LosLand?: string;
  PC4LaadNL?: string | null;
  PC4LosNL?: string | null;
  geoKeyLaad?: string | null;
  geoKeyLos?: string | null;
  geoLevelLaad?: 'PC6' | 'PC4' | 'NUTS3' | null;
  geoLevelLos?: 'PC6' | 'PC4' | 'NUTS3' | null;
  isNational?: boolean;
  isInternational?: boolean;
  isImport?: boolean;
  isExport?: boolean;
  stadslogistieke_klasse?: string;
  voertuigsoort?: string;
}

// Lookup tables from VESDI_lookup.xlsx
export interface LookupEntry {
  code: number | string;
  omschrijving: string;
}

export interface LookupData {
  voertuigsoortRDW: LookupEntry[];
  brandstofsoort: LookupEntry[];
  laadvermogenCombinatie: LookupEntry[];
  maxToegestaanGewicht: LookupEntry[];
  leeggewichtCombinatie: LookupEntry[];
  logistiekeKlasse: LookupEntry[];
  legeRit: LookupEntry[];
  nuts3: LookupEntry[];
  gemeentecode: LookupEntry[];
}

// Municipality info derived from data
export interface MunicipalityInfo {
  code: string;
  name: string;
}

// NUTS schema mapping
export interface NutsMapping {
  gemeentecode: string;
  gemeentenaam: string;
  nuts1: string;
  nuts2: string;
  nuts3: string;
  degurba: number;
}

// Year-keyed data store
export interface YearData {
  year: number;
  zendingen: ZendingRow[];
  deelritten: DeelritRow[];
}

// Detected file types
export type DetectedFileType =
  | 'ZENDINGEN'
  | 'DEELRITTEN'
  | 'CODETABEL_GEMEENTE'
  | 'CODETABEL_KLASSE'
  | 'VESDI_LOOKUP'
  | 'CODETABELLEN_GEMEENTE'
  | 'NUTS_SCHEMA'
  | 'METADATA'
  | 'HERO_IMAGE'
  | 'UNKNOWN';

export interface DetectedFile {
  file: File;
  type: DetectedFileType;
  status: 'valid' | 'warning' | 'error';
  message: string;
  year?: number;
}

// Filter state
export interface FilterState {
  year: number | null;
  euronorm: string | null;
  laadEmissiezone: string | null;
  losEmissiezone: string | null;
  handelsrichting: string | null; // 'import' | 'export' | null
}

// Aggregated data types for charts
export interface KlasseCount {
  klasse: string;
  count: number;
  weight: number;
}

export interface CountryData {
  country: string;
  countryCode: string;
  geladenAantal: number;
  gelostAantal: number;
}

export interface Nuts3Data {
  nuts3: string;
  count: number;
  percentage: number;
}

export interface PC4Data {
  pc4: string;
  count: number;
  weight: number;
  beladingsgraad?: number;
  lat?: number;
  lng?: number;
}

export interface TrendPoint {
  year: number;
  value: number;
  value2?: number;
}

export interface BeladingsgraadKlasse {
  klasse: string;
  [year: string]: string | number; // year columns with weighted averages
}
