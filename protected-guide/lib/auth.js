import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.GUIDE_DATABASE_URL);
export function hashPassword(password, salt) { return scryptSync(password, Buffer.from(salt, 'hex'), 64).toString('hex'); }
export function verifyPassword(password, salt, expected) {
 const actual=Buffer.from(hashPassword(password,salt),'hex'), target=Buffer.from(expected,'hex');
 return actual.length===target.length && timingSafeEqual(actual,target);
}
export function newToken() { return randomBytes(32).toString('hex'); }
export function tokenHash(token) { return createHash('sha256').update(token).digest('hex'); }
export async function authenticated(request) {
 const token=request.cookies.get('ziiply_guide_session')?.value;
 if(!token || !/^[a-f0-9]{64}$/.test(token)) return false;
 const rows=await sql`SELECT 1 FROM guide_sessions s JOIN guide_accounts a ON a.username=s.username WHERE s.token_hash=${tokenHash(token)} AND s.expires_at>now() AND a.enabled=true LIMIT 1`;
 return rows.length>0;
}
