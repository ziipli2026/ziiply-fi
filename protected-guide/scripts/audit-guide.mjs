// Run: node scripts/audit-guide.mjs /path/to/original/index.html /path/to/private/assets
// Fails if any image referenced by the guide is missing from the private asset directory.
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const [htmlPath,assetsDir]=process.argv.slice(2);
if(!htmlPath||!assetsDir) throw Error('Usage: node scripts/audit-guide.mjs original.html private-assets-directory');
const html=readFileSync(htmlPath,'utf8');
const paths=[...html.matchAll(/\/images\/(mobiiliohje\/)?([a-zA-Z0-9_.-]+\.(?:png|jpe?g|webp|gif))(?:\?[^"'\\\s]*)?/gi)];
const names=[...new Set(paths.map(m=>(m[1]?'mobiiliohje--':'')+m[2]))];
const missing=names.filter(name=>!existsSync(join(assetsDir,name)));
console.log('Image references:',paths.length,'Unique protected assets:',names.length,'Missing:',missing.length);
if(missing.length){console.error(missing.join('\n'));process.exitCode=1;}
