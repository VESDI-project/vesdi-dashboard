import { NextResponse } from 'next/server';

interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function paginated<T>(data: T[], meta: PaginationMeta) {
  return NextResponse.json({ data, meta }, { status: 200 });
}

export function error(code: string, message: string, status: number) {
  return NextResponse.json(
    { error: { code, message } },
    { status }
  );
}
