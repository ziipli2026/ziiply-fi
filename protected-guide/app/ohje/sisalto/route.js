import { NextResponse } from 'next/server';
import {authenticated,sql} from '../../../lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){
 const desktop=new URL(request.url).searchParams.get('versio')==='desktop';
 if(!(await authenticated(request))) return NextResponse.redirect(new URL(desktop?'/?versio=desktop':'/',request.url));
 const pageKey=desktop?'desktop':'mobile';
 const rows=await sql`SELECT html FROM guide_pages WHERE page_key=${pageKey} LIMIT 1`;
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
 const desktopLayout = `<style id="ziiply-desktop-fixed-layout">
@media (min-width:701px) {
 html,body{height:100%;height:100dvh;overflow:hidden}
 body{display:flex;flex-direction:column;min-height:0}
 header{flex:0 0 auto;padding-top:5px;padding-bottom:4px}
 main{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:hidden;padding-top:3px;padding-bottom:5px}
 .viewer{flex:1 1 auto;min-height:0;height:auto!important;max-height:none!important}
 .viewer:not(.zoom){overflow:hidden}
 .viewer:not(.zoom) img{max-height:100%;object-fit:contain}
 .controls{flex:0 0 auto;padding:5px 2px}
 .caption{flex:0 0 auto;box-sizing:border-box;height:2.6em!important;min-height:2.6em!important;max-height:2.6em!important;overflow:auto;margin:2px 0}
 .slide-description{flex:0 0 auto;box-sizing:border-box;height:4.05em!important;min-height:4.05em!important;max-height:4.05em!important;overflow:auto;margin:2px auto 0}
 main>div[style*="text-align:center"]{flex:0 0 auto;padding:3px!important}
 footer{flex:0 0 auto;padding:2px 8px}
}
</style>`;
 const html=desktop?rows[0].html.replace('</head>',desktopLayout+'</head>'):rows[0].html.replace('</body>',preload+'</body>');
 return new NextResponse(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"}});
}
