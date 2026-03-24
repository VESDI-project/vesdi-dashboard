// Expected column names for validation
// Zone columns are optional — Almere has none, Amsterdam/Den Haag/Rotterdam/Zwolle have only emissiezone,
// Utrecht has all 8 zone columns.

export const ZENDINGEN_COLUMNS_REQUIRED = [
  'jaar',
  'laadPC6',
  'laadPC4',
  'laadGemeente',
  'laadNuts3',
  'losPC6',
  'losPC4',
  'losGemeente',
  'losNuts3',
  'stadslogistieke_klasse_code',
  'euronormKlasse',
  'brandstofsoortKlasse',
  'dummy_laadInROI',
  'dummy_losInROI',
  'zendingAantal',
  'brutoGewicht',
  'zendingAfstandGemiddeld',
] as const;

export const ZENDINGEN_COLUMNS_OPTIONAL = [
  'laad_zone_emissiezonePC6',
  'laad_zone_voetganger',
  'laad_zone_afgesloten_laden_lossen',
  'laad_zone_afgesloten',
  'los_zone_emissiezonePC6',
  'los_zone_voetganger',
  'los_zone_afgesloten_laden_lossen',
  'los_zone_afgesloten',
] as const;

export const ZENDINGEN_COLUMNS = [
  ...ZENDINGEN_COLUMNS_REQUIRED,
  ...ZENDINGEN_COLUMNS_OPTIONAL,
] as const;

export const DEELRITTEN_COLUMNS_REQUIRED = [
  'jaar',
  'voertuigsoortRDW',
  'laadPC6',
  'laadPC4',
  'laadGemeente',
  'laadNuts3',
  'losPC6',
  'losPC4',
  'losGemeente',
  'losNuts3',
  'stadslogistieke_klasse_code',
  'stadslogistieke_klasse_legeRit_code',
  'euronormKlasse',
  'brandstofsoortKlasse',
  'laadvermogenCombinatie_klasse',
  'leeggewichtCombinatie_klasse',
  'maxToegestaanGewicht_klasse',
  'dummy_laadInROI',
  'dummy_losInROI',
  'aantalDeelritten',
  'aantalLegeDeelritten',
  'brutoGewicht',
  'deelritAfstandGemiddeld',
  'beladingsgraadGewichtGemiddeld',
  'aantalZendingenRitGemiddeld',
] as const;

export const DEELRITTEN_COLUMNS_OPTIONAL = [
  'laad_zone_emissiezonePC6',
  'laad_zone_voetganger',
  'laad_zone_afgesloten_laden_lossen',
  'laad_zone_afgesloten',
  'los_zone_emissiezonePC6',
  'los_zone_voetganger',
  'los_zone_afgesloten_laden_lossen',
  'los_zone_afgesloten',
] as const;

export const DEELRITTEN_COLUMNS = [
  ...DEELRITTEN_COLUMNS_REQUIRED,
  ...DEELRITTEN_COLUMNS_OPTIONAL,
] as const;

export const CODETABEL_GEMEENTE_COLUMNS = ['gemNaam', 'gemCode'] as const;

export const CODETABEL_KLASSE_COLUMNS = [
  'stadslogistieke_klasse_code',
  'stadslogistieke_klasse',
] as const;

// Key columns used for file type detection
export const DETECTION_KEYS = {
  deelritten: 'aantalDeelritten',
  zendingen: 'zendingAantal',
  gemeenteCode: 'gemNaam',
  klasseCode: 'stadslogistieke_klasse',
  anpr: 'aantalBezoeken',
} as const;

// ANPR table identification: sorted non-common columns → table ID
// Common columns (excluded from signature): europeseVoertuigcategorie, aantalBezoeken
import type { AnprTableId } from './types';

export const ANPR_TABLE_SIGNATURES: Record<string, AnprTableId> = {
  'emissieklasse3|periode': 'M1',
  'OgSBI08Groep|periode': 'M2',
  'OgSBI08Groep|typeBezoeker3': 'J1',
  'bedrijfsgrootte5Code|typeBezoeker3': 'J2',
  'rustNuts2|typeBezoeker3': 'J3',
  'OgSBI08Groep|tijdstipDag6Code': 'J5',
  'tijdstipDag6Code|weekdagCode': 'J6',
  'OgSBI08Groep|bedrijfsgrootte5Code|periode': 'K1',
};
