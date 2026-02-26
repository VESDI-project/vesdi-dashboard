import { NextResponse } from 'next/server';
import { openapiSpec } from '@/lib/api/openapi-spec';

export async function GET() {
  return NextResponse.json(openapiSpec, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
