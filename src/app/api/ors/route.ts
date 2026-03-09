import { NextRequest, NextResponse } from 'next/server';

const ORS_BASE_URL = process.env.NEXT_PUBLIC_ORS_BASE_URL || 'https://ors.transportbeat.nl/ors';
const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || '';

// Progressive snap radii: start precise, widen on failure
const SNAP_RADII = [400, 2000, 5000, 10000, 25000, 50000];
// Server-side concurrency for batch requests
const SERVER_CONCURRENCY = 50;
// Retry on transient errors (ECONNRESET, timeouts)
const MAX_TRANSIENT_RETRIES = 3;
const RETRY_DELAY_MS = 200;

function orsHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ORS_API_KEY) h['X-API-Key'] = ORS_API_KEY;
  return h;
}

/** Single ORS fetch with transient error retry */
async function orsFetch(
  profile: string,
  body: string,
): Promise<Response | null> {
  const headers = orsHeaders();
  for (let attempt = 0; attempt < MAX_TRANSIENT_RETRIES; attempt++) {
    try {
      return await fetch(`${ORS_BASE_URL}/v2/directions/${profile}/geojson`, {
        method: 'POST',
        headers,
        body,
      });
    } catch {
      // ECONNRESET, timeout, etc — retry after delay
      if (attempt < MAX_TRANSIENT_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }
  return null;
}

/** Resolve a single route with progressive snap radii */
async function resolveRoute(
  profile: string,
  coordinates: [number, number][],
): Promise<{ coordinates: [number, number][] } | null> {
  const numCoords = coordinates.length;

  for (const radius of SNAP_RADII) {
    const body = JSON.stringify({ coordinates, radiuses: Array(numCoords).fill(radius) });
    const res = await orsFetch(profile, body);

    if (!res) return null; // all retries failed

    if (res.ok) {
      const data = await res.json();
      const coords = data.features?.[0]?.geometry?.coordinates || [];
      return { coordinates: coords };
    }

    const text = await res.text();

    // Only widen radius on "could not find routable point" (code 2010)
    if (res.status === 404 && text.includes('2010')) {
      continue;
    }

    // Other error — no point retrying with larger radius
    return null;
  }

  return null;
}

/**
 * POST /api/ors?profile=driving-hgv
 *
 * Accepts either:
 * - Single route: { coordinates: [[lng,lat],[lng,lat]] }
 * - Batch routes:  { batch: [{ coordinates: [[lng,lat],[lng,lat]] }, ...] }
 */
export async function POST(req: NextRequest) {
  const profile = req.nextUrl.searchParams.get('profile') || 'driving-hgv';
  const parsed = await req.json();

  // --- Single route (backwards compatible) ---
  if (!parsed.batch) {
    const result = await resolveRoute(profile, parsed.coordinates);
    if (!result) {
      return NextResponse.json(
        { error: 'Could not resolve route' },
        { status: 404 }
      );
    }
    // Return in GeoJSON format for backwards compatibility
    return NextResponse.json({
      features: [{ geometry: { coordinates: result.coordinates } }],
    });
  }

  // --- Batch routes: resolve server-side with high concurrency ---
  const items: { coordinates: [number, number][] }[] = parsed.batch;
  const results: ({ coordinates: [number, number][] } | null)[] = new Array(items.length).fill(null);

  let idx = 0;
  const worker = async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await resolveRoute(profile, items[i].coordinates);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(SERVER_CONCURRENCY, items.length) }, () => worker())
  );

  return NextResponse.json({ results });
}
