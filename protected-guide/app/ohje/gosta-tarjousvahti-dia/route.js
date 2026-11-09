import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { authenticated } from '../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (!(await authenticated(request))) {
    return new NextResponse('Unauthorized', { status: 401, headers });
  }

  const image = await readFile(join(process.cwd(), 'gosta-tarjousvahti-slide-39.png'));
  return new NextResponse(image, {
    headers: {
      ...headers,
      'Content-Type': 'image/png',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
