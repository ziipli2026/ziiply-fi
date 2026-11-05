// Run locally: node scripts/generate-accounts.mjs /secure/private/folder
// Never commit the generated credentials or share them in a public URL.
import {randomBytes} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const destination=process.argv[2];
if(!destination) throw new Error('Provide a private output directory');
mkdirSync(destination,{recursive:true,mode:0o700});
const rows=['ryhma,kayttajatunnus,salasana'];
const password=()=>randomBytes(24).toString('base64url');
for(let i=1;i<=6;i++) rows.push(['media','media'+i,password()].join(','));
for(let i=1;i<=400;i++) rows.push(['beta','beta'+String(i).padStart(3,'0'),password()].join(','));
const path=join(destination,'ziiply-406-credentials.csv');
writeFileSync(path,rows.join('\n')+'\n',{flag:'wx',mode:0o600});
console.log('Created 406 unique accounts in a private local file.');
