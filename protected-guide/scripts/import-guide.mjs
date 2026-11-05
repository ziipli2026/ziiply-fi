// Usage: GUIDE_DATABASE_URL=... node scripts/import-guide.mjs /local/path/index.html
// The original public guide must be removed after the protected deployment passes tests.
import {readFileSync} from 'node:fs';
import {neon} from '@neondatabase/serverless';
const file=process.argv[2];
if(!file||!process.env.GUIDE_DATABASE_URL) throw Error('Missing local HTML path or GUIDE_DATABASE_URL');
let html=readFileSync(file,'utf8');
if(!html.includes('const slides') || !html.includes('Ziiply')) throw Error('Unexpected guide format');
// Map existing image URLs to the authenticated same-origin asset route.
html=html.replace(/\/images\/(mobiiliohje\/)?([a-zA-Z0-9_.-]+\.(?:png|jpe?g|webp|gif))(?:\?[^"'\\\s]*)?/gi,(_,folder,name)=>'/api/asset/'+(folder?'mobiiliohje--':'')+name);
const sql=neon(process.env.GUIDE_DATABASE_URL);
await sql`INSERT INTO guide_pages(page_key,html,updated_at) VALUES('mobile',${html},now())
 ON CONFLICT(page_key) DO UPDATE SET html=EXCLUDED.html,updated_at=now()`;
console.log('Guide HTML imported. Verify all referenced assets were imported before deployment.');
