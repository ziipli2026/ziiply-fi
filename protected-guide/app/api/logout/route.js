import { NextResponse } from 'next/server';
import { sql,tokenHash } from '../../../lib/auth';
export async function POST(request) {
 const token=request.cookies.get('ziiply_guide_session')?.value;
 if(token && /^[a-f0-9]{64}$/.test(token)) await sql`DELETE FROM guide_sessions WHERE token_hash=${tokenHash(token)}`;
 const response=NextResponse.json({ok:true});
 response.cookies.delete('ziiply_guide_session');
 return response;
}
