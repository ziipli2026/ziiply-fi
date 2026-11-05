import { NextResponse } from 'next/server';
import { sql,verifyPassword,newToken,tokenHash } from '../../../lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const fail=()=>NextResponse.json({error:'Virheelliset tunnukset'},{status:401});
export async function POST(request) {
 let body; try { body=await request.json(); } catch { return NextResponse.json({error:'Virheellinen pyyntö'},{status:400}); }
 const username=String(body.username||'').trim().toLowerCase(), password=String(body.password||'');
 if(!/^[a-z0-9_-]{3,60}$/.test(username)||password.length>256) return fail();
 // Persistently throttle attempts for each username, even across serverless instances.
 const limits=await sql`INSERT INTO guide_login_limits(username,attempts,window_start,locked_until)
 VALUES(${username},1,now(),null)
 ON CONFLICT(username) DO UPDATE SET
 attempts=CASE WHEN guide_login_limits.window_start<now()-interval '15 minutes' THEN 1 ELSE guide_login_limits.attempts+1 END,
 window_start=CASE WHEN guide_login_limits.window_start<now()-interval '15 minutes' THEN now() ELSE guide_login_limits.window_start END,
 locked_until=CASE WHEN guide_login_limits.locked_until>now() THEN guide_login_limits.locked_until
 WHEN guide_login_limits.window_start>=now()-interval '15 minutes' AND guide_login_limits.attempts>=9 THEN now()+interval '15 minutes'
 ELSE null END
 RETURNING attempts,locked_until`;
 if(limits[0].locked_until) return NextResponse.json({error:'Liian monta yritystä. Yritä myöhemmin.'},{status:429,headers:{'Retry-After':'900'}});
 const rows=await sql`SELECT username,password_salt,password_hash FROM guide_accounts WHERE username=${username} AND enabled=true LIMIT 1`;
 if(!rows.length || !verifyPassword(password,rows[0].password_salt,rows[0].password_hash)) return fail();
 await sql`DELETE FROM guide_login_limits WHERE username=${username}`;
 const token=newToken();
 await sql`INSERT INTO guide_sessions(token_hash,username,expires_at) VALUES(${tokenHash(token)},${username},now()+interval '30 days')`;
 const response=NextResponse.json({ok:true});
 response.cookies.set('ziiply_guide_session',token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:2592000});
 return response;
}
