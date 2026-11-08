import { NextResponse } from 'next/server';
import { authenticated } from '../../../lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){
 if(!(await authenticated(request)))return new NextResponse('Unauthorized',{status:401});
 const url='https://raw.githubusercontent.com/ziipli2026/ziiply-fi/feature/protected-mobile-guide/protected-guide/gosta-tarjousvahti-mobile.jpeg';
 const response=await fetch(url,{cache:'no-store'});
 if(!response.ok)return new NextResponse('Original image unavailable',{status:502});
 const bytes=await response.arrayBuffer();
 return new NextResponse(bytes,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
