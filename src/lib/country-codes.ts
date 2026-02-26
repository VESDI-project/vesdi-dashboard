// NUTS country prefix → Dutch country name

export const COUNTRY_NAMES: Record<string, string> = {
  AL: 'Albanië',
  AT: 'Oostenrijk',
  BE: 'België',
  BG: 'Bulgarije',
  CH: 'Zwitserland',
  CY: 'Cyprus',
  CZ: 'Tsjechië',
  DE: 'Duitsland',
  DK: 'Denemarken',
  EE: 'Estland',
  EL: 'Griekenland',
  ES: 'Spanje',
  FI: 'Finland',
  FR: 'Frankrijk',
  HR: 'Kroatië',
  HU: 'Hongarije',
  IE: 'Ierland',
  IS: 'IJsland',
  IT: 'Italië',
  LI: 'Liechtenstein',
  LT: 'Litouwen',
  LU: 'Luxemburg',
  LV: 'Letland',
  ME: 'Montenegro',
  MK: 'Noord-Macedonië',
  MT: 'Malta',
  NL: 'Nederland',
  NO: 'Noorwegen',
  PL: 'Polen',
  PT: 'Portugal',
  RO: 'Roemenië',
  RS: 'Servië',
  SE: 'Zweden',
  SI: 'Slovenië',
  SK: 'Slowakije',
  TR: 'Turkije',
  UK: 'Verenigd Koninkrijk',
  GB: 'Verenigd Koninkrijk',
};

/**
 * Get Dutch country name from a NUTS3 code
 */
export function getCountryFromNuts3(nuts3: string): string {
  if (!nuts3 || nuts3.length < 2) return 'Onbekend';
  const prefix = nuts3.substring(0, 2);
  return COUNTRY_NAMES[prefix] || prefix;
}

/**
 * Get country code (2-letter) from a NUTS3 code
 */
export function getCountryCode(nuts3: string): string {
  if (!nuts3 || nuts3.length < 2) return '';
  return nuts3.substring(0, 2);
}
