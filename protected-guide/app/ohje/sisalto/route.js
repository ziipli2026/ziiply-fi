import { NextResponse } from 'next/server';
import {authenticated,sql} from '../../../lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){
 if(!(await authenticated(request))) return NextResponse.redirect(new URL('/',request.url));
 const rows=await sql`SELECT html FROM guide_pages WHERE page_key='mobile' LIMIT 1`;
 if(!rows.length) return new NextResponse('Ohjetta ei ole vielä tuotu.',{status:503});
 return new NextResponse(rows[0].html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"}});
}
