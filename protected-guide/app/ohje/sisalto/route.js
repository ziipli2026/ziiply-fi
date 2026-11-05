import { NextResponse } from 'next/server';
import {authenticated,sql} from '../../../lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){
 if(!(await authenticated(request))) return NextResponse.redirect(new URL('/',request.url));
 const rows=await sql`SELECT html FROM guide_pages WHERE page_key='mobile' LIMIT 1`;
 if(!rows.length) return new NextResponse('Ohjetta ei ole vielä tuotu.',{status:503});
 const preload = `<script>
(function(){
 const urls=[...new Set(slides.map(s=>encodeURI(s.src)))];
 const loaded=new Set(), queued=new Set();
 let running=0, cursor=0;
 const maxParallel=2;
 function fetchImage(url){
   if(!url || loaded.has(url) || queued.has(url)) return;
   queued.add(url);running++;
   const img=new Image();
   const done=()=>{loaded.add(url);running--;pump();};
   img.onload=done;img.onerror=done;img.src=url;
 }
 function pump(){
   while(running<maxParallel && cursor<urls.length) fetchImage(urls[cursor++]);
 }
 // The first slide is already requested by the viewer; prioritize the next slides.
 cursor=1; pump();
 const next=document.getElementById('next'), prev=document.getElementById('prev');
 for(const b of [next,prev]) b?.addEventListener('click',()=>{const i=Number(document.getElementById('jump').value);for(let j=i+1;j<Math.min(i+4,urls.length);j++) fetchImage(urls[j]);});
})();
</script>`;
 const html=rows[0].html.replace('</body>',preload+'</body>');
 return new NextResponse(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"}});
}
