/**
 * Statistical utilities for ANPR data analysis.
 * - Linear regression with R² and extrapolation
 * - Two-proportion Z-test for month-over-month comparison
 */

// ─── Linear Regression ───

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  /** Predicted values for the input x values */
  fitted: { x: number; y: number }[];
}

export interface ExtrapolationPoint {
  x: number;
  y: number;
  label: string;
}

/**
 * Simple OLS linear regression: y = slope * x + intercept
 * x values are 0-indexed month positions (0, 1, 2, ...)
 */
export function linearRegression(
  data: { x: number; y: number }[]
): RegressionResult {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0, fitted: [] };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const { x, y } of data) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0, fitted: data.map((d) => ({ x: d.x, y: sumY / n })) };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² (coefficient of determination)
  const meanY = sumY / n;
  let ssTot = 0, ssRes = 0;
  const fitted: { x: number; y: number }[] = [];
  for (const { x, y } of data) {
    const pred = slope * x + intercept;
    ssTot += (y - meanY) ** 2;
    ssRes += (y - pred) ** 2;
    fitted.push({ x, y: pred });
  }
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return { slope, intercept, r2, fitted };
}

/**
 * Extrapolate regression line to future periods.
 * @param reg - Regression result
 * @param startLabel - Label of the first data point (e.g. "feb 2025")
 * @param numExtraMonths - How many months to project forward
 * @param dataLength - Number of existing data points (to offset x)
 */
export function extrapolate(
  reg: RegressionResult,
  dataLength: number,
  numExtraMonths: number,
  labelFn: (monthsFromStart: number) => string
): ExtrapolationPoint[] {
  const points: ExtrapolationPoint[] = [];
  for (let i = 0; i < numExtraMonths; i++) {
    const x = dataLength + i;
    const y = reg.slope * x + reg.intercept;
    points.push({ x, y, label: labelFn(x) });
  }
  return points;
}

// ─── Two-Proportion Z-Test ───

export interface ZTestResult {
  /** Proportion in group 1 */
  p1: number;
  /** Proportion in group 2 */
  p2: number;
  /** Absolute difference (p2 - p1) */
  diff: number;
  /** Relative change ((p2 - p1) / p1) */
  relativeChange: number;
  /** Z statistic */
  z: number;
  /** Two-sided p-value */
  pValue: number;
  /** Significance level: '***' (<0.001), '**' (<0.01), '*' (<0.05), 'n.s.' */
  significance: string;
  /** Count in group 1 */
  n1: number;
  /** Count in group 2 */
  n2: number;
  /** Success count in group 1 */
  k1: number;
  /** Success count in group 2 */
  k2: number;
}

/**
 * Two-proportion Z-test.
 * Tests H₀: p₁ = p₂ (e.g. Euro-6 share in Feb 2025 vs Feb 2026)
 *
 * @param k1 - Number of "successes" in group 1 (e.g. Euro-6 visits in Feb 2025)
 * @param n1 - Total count in group 1 (e.g. total visits in Feb 2025)
 * @param k2 - Number of "successes" in group 2
 * @param n2 - Total count in group 2
 */
export function twoProportionZTest(
  k1: number,
  n1: number,
  k2: number,
  n2: number
): ZTestResult {
  const p1 = n1 > 0 ? k1 / n1 : 0;
  const p2 = n2 > 0 ? k2 / n2 : 0;
  const diff = p2 - p1;
  const relativeChange = p1 > 0 ? diff / p1 : 0;

  // Pooled proportion under H₀
  const pHat = (n1 + n2) > 0 ? (k1 + k2) / (n1 + n2) : 0;
  const se = Math.sqrt(pHat * (1 - pHat) * (1 / Math.max(n1, 1) + 1 / Math.max(n2, 1)));

  const z = se > 0 ? diff / se : 0;
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));

  let significance = 'n.s.';
  if (pValue < 0.001) significance = '***';
  else if (pValue < 0.01) significance = '**';
  else if (pValue < 0.05) significance = '*';

  return { p1, p2, diff, relativeChange, z, pValue, significance, n1, n2, k1, k2 };
}

/**
 * Standard normal CDF approximation (Abramowitz & Stegun 26.2.17)
 */
function normalCDF(x: number): number {
  if (x < -8) return 0;
  if (x > 8) return 1;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX / 2);

  return 0.5 * (1.0 + sign * y);
}

// ─── Month label utilities ───

const MONTH_NAMES = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/**
 * Create a label function for extrapolation that continues the monthly sequence.
 * @param firstMonth - 1-based month index of the first data point (e.g. 1 for January)
 * @param firstYear - Year of the first data point
 */
export function monthLabelFn(firstMonth: number, firstYear: number): (idx: number) => string {
  return (idx: number) => {
    const totalMonths = (firstMonth - 1) + idx;
    const month = totalMonths % 12;
    const year = firstYear + Math.floor(totalMonths / 12);
    return `${MONTH_NAMES[month]} ${year}`;
  };
}

/**
 * Parse a formatted period label back to month/year.
 * "feb 2025" → { month: 2, year: 2025 }
 */
export function parsePeriodLabel(label: string): { month: number; year: number } | null {
  const parts = label.trim().split(' ');
  if (parts.length !== 2) return null;
  const monthIdx = MONTH_NAMES.indexOf(parts[0].toLowerCase());
  const year = parseInt(parts[1], 10);
  if (monthIdx < 0 || isNaN(year)) return null;
  return { month: monthIdx + 1, year };
}
