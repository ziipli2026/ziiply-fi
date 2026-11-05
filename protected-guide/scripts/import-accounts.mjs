import {readFileSync} from 'node:fs';
import {randomBytes,scryptSync} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
if(!process.env.GUIDE_DATABASE_URL || !process.argv[2]) throw Error('Database URL and CSV path required');
const sql=neon(process.env.GUIDE_DATABASE_URL);
const lines=readFileSync(process.argv[2],'utf8').trim().split(/\r?\n/);
if(lines.shift()!=='ryhma,kayttajatunnus,salasana'||lines.length!==406) throw Error('Unexpected CSV');
const seen=new Set();let media=0,beta=0;
const records=lines.map(line=>{
 const [role,username,password,...extra]=line.split(',');
 if(extra.length||!['media','beta'].includes(role)||!/^[a-z0-9_-]{3,60}$/.test(username)||password.length<18||seen.has(username)) throw Error('Invalid row');
 seen.add(username);if(role==='media')media++;else beta++;
 const salt=randomBytes(16).toString('hex');
 const hash=scryptSync(password,Buffer.from(salt,'hex'),64).toString('hex');
 return {role,username,salt,hash};
});
if(media!==6||beta!==400) throw Error('Expected six media and 400 beta accounts');
for(const a of records){
 await sql`INSERT INTO guide_accounts(username,password_salt,password_hash,role,enabled)
 VALUES(${a.username},${a.salt},${a.hash},${a.role},true)
 ON CONFLICT(username) DO UPDATE SET password_salt=EXCLUDED.password_salt,password_hash=EXCLUDED.password_hash,role=EXCLUDED.role,enabled=true`;
}
console.log('Imported 406 password hashes');
