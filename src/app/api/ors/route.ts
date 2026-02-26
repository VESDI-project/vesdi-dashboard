import { NextRequest, NextResponse } from 'next/server';

const ORS_BASE_URL = process.env.NEXT_PUBLIC_ORS_BASE_URL || 'https://ors.transportbeat.nl/ors';
const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || '';

/**
 * Proxy ORS requests through Next.js to avoid CORS issues.
 * POST /api/ors?profile=driving-hgv
 */
export async function POST(req: NextRequest) {
  const profile = req.nextUrl.searchParams.get('profile') || 'driving-hgv';
  const body = await req.text();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ORS_API_KEY) headers['X-API-Key'] = ORS_API_KEY;

  const res = await fetch(`${ORS_BASE_URL}/v2/directions/${profile}/geojson`, {
    method: 'POST',
    headers,
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
