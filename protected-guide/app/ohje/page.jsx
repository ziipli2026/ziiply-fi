import LogoutButton from './logout-button';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql,tokenHash } from '../../lib/auth';
export const dynamic='force-dynamic';
export default async function Guide(){
 const token=(await cookies()).get('ziiply_guide_session')?.value;
 if(!token || !/^[a-f0-9]{64}$/.test(token)) redirect('/');
 const rows=await sql`SELECT 1 FROM guide_sessions s JOIN guide_accounts a ON a.username=s.username WHERE s.token_hash=${tokenHash(token)} AND s.expires_at>now() AND a.enabled LIMIT 1`;
 if(!rows.length) redirect('/');
 return <main><h1>Ziiplyn mobiiliohje</h1><p>Kirjautuminen onnistui. Avaa suojattu mobiiliohje alla olevasta linkistä.</p><p><a href='/ohje/sisalto'>Avaa mobiiliohje</a></p><LogoutButton/></main>;
}
