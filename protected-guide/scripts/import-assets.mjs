// Import a local image into the private database. Never commit private images.
// Usage: GUIDE_DATABASE_URL=... node scripts/import-assets.mjs filename.png /local/path/file.png
import {readFileSync} from 'node:fs';
import {neon} from '@neondatabase/serverless';
const [name,path]=process.argv.slice(2);
if (!process.env.GUIDE_DATABASE_URL || !name || !path) throw Error('Missing database URL, name or path');
if (!/^[a-zA-Z0-9_.-]{1,120}$/.test(name) || name.includes('..')) throw Error('Invalid image name');
const extension=name.split('.').pop().toLowerCase();
const mime={'png':'image/png','jpg':'image/jpeg','jpeg':'image/jpeg','webp':'image/webp','gif':'image/gif'}[extension];
if(!mime) throw Error('Unsupported image format');
const data=readFileSync(path);
if(data.length>12*1024*1024) throw Error('Image too large');
const signature=extension==='png'?data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):extension==='jpg'||extension==='jpeg'?data.subarray(0,3).equals(Buffer.from([255,216,255])):extension==='gif'?data.subarray(0,3).toString()==='GIF':data.subarray(0,4).toString()==='RIFF'&&data.subarray(8,12).toString()==='WEBP';
if(!signature) throw Error('Image signature does not match extension');
const sql=neon(process.env.GUIDE_DATABASE_URL);
await sql`INSERT INTO guide_assets(asset_name,mime_type,contents) VALUES(${name},${mime},decode(${data.toString('base64')},'base64')) ON CONFLICT(asset_name) DO UPDATE SET mime_type=EXCLUDED.mime_type,contents=EXCLUDED.contents`;
console.log('Private image imported:',name);
