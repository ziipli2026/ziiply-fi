import {neon} from '@neondatabase/serverless';
if(!process.env.GUIDE_DATABASE_URL) throw Error('Missing GUIDE_DATABASE_URL');
const sql=neon(process.env.GUIDE_DATABASE_URL);
const rows=await sql`SELECT html FROM guide_pages WHERE page_key='mobile'`;
if(!rows.length) throw Error('Guide HTML missing');
const names=[...new Set([...rows[0].html.matchAll(/\/api\/asset\/([\w. -]+\.(?:png|jpe?g|webp|gif))/gi)].map(m=>m[1]))];
if(names.length<30) throw Error('Unexpected guide image count: '+names.length);
for(const name of names){
 const path=name.startsWith('mobiiliohje--')?'images/mobiiliohje/'+name.slice(13):'images/'+name;
 const url='https://raw.githubusercontent.com/ziipli2026/ziiply-fi/main/'+path.split('/').map(encodeURIComponent).join('/');
 const response=await fetch(url);
 if(!response.ok) throw Error('Image fetch failed '+name+' '+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length>12_000_000) throw Error('Image too large '+name);
 const ext=name.split('.').at(-1).toLowerCase();
 const mime=ext==='png'?'image/png':ext==='webp'?'image/webp':ext==='gif'?'image/gif':'image/jpeg';
 await sql`INSERT INTO guide_assets(asset_name,mime_type,contents) VALUES(${name},${mime},decode(${bytes.toString('hex')},'hex')) ON CONFLICT(asset_name) DO UPDATE SET mime_type=EXCLUDED.mime_type,contents=EXCLUDED.contents`;
 console.log('Imported '+name+' ('+bytes.length+' bytes)');
}
console.log('Imported '+names.length+' protected guide images');
