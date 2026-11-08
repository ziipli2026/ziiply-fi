import { NextResponse } from 'next/server';
import { authenticated } from '../../../lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request) {
  if (!(await authenticated(request))) return new NextResponse('Unauthorized',{status:401,headers:{'Cache-Control':'private, no-store'}});
  const response=await fetch('https://raw.githubusercontent.com/ziipli2026/ziiply-fi/feature/protected-mobile-guide/protected-guide/gosta-tarjousvahti-mobile.jpeg',{cache:'no-store'});
  if(!response.ok) return new NextResponse('Image unavailable',{status:502});
  return new NextResponse(await response.arrayBuffer(),{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
