import { NextResponse } from 'next/server';
import { authenticated, sql } from '../../../../lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request,{params}) {
 if(!(await authenticated(request))) return new NextResponse('Unauthorized',{status:401,headers:{'Cache-Control':'private, no-store'}});
 const {name}=await params;
 if(!/^[a-zA-Z0-9_.-]{1,120}$/.test(name)||name.includes('..')) return new NextResponse('Not found',{status:404});
 const rows=await sql`SELECT mime_type, encode(contents,'base64') AS encoded FROM guide_assets WHERE asset_name=${name} LIMIT 1`;
 if(!rows.length) return new NextResponse('Not found',{status:404});
 return new NextResponse(Buffer.from(rows[0].encoded,'base64'),{headers:{'Content-Type':rows[0].mime_type,'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff'}});
}
