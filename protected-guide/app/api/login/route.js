import { NextResponse } from 'next/server';
import { sql,verifyPassword,newToken,tokenHash } from '../../../lib/auth';
export const runtime='nodejs';
export async function POST(request) {
 let body; try { body=await request.json(); } catch { return NextResponse.json({error:'Virheellinen pyyntö'},{status:400}); }
 const username=String(body.username||'').trim().toLowerCase(), password=String(body.password||'');
 if(!/^[a-z0-9_-]{3,60}$/.test(username)||password.length>256) return NextResponse.json({error:'Virheelliset tunnukset'},{status:401});
 const rows=await sql`SELECT username,password_salt,password_hash FROM guide_accounts WHERE username=${username} AND enabled=true LIMIT 1`;
 if(!rows.length || !verifyPassword(password,rows[0].password_salt,rows[0].password_hash)) return NextResponse.json({error:'Virheelliset tunnukset'},{status:401});
 const token=newToken();
 await sql`INSERT INTO guide_sessions(token_hash,username,expires_at) VALUES(${tokenHash(token)},${username},now()+interval '30 days')`;
 const response=NextResponse.json({ok:true});
 response.cookies.set('ziiply_guide_session',token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:2592000});
 return response;
}
