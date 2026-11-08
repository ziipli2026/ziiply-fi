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
 body{display:flex!important;flex-direction:column!important;min-height:0!important}
 header{flex:0 0 auto!important;padding-top:5px!important;padding-bottom:4px!important}
 main{flex:1 1 0!important;min-height:0!important;min-width:0;display:flex!important;flex-direction:column!important;overflow:hidden!important;padding-top:3px!important;padding-bottom:5px!important}
 main>.viewer,#viewer{flex:1 1 0!important;min-height:0!important;height:0!important;max-height:none!important;overflow:hidden}
 main>.viewer.zoom,#viewer.zoom{overflow:auto!important}
 .viewer:not(.zoom) img{max-height:100%;object-fit:contain}
 main>.controls,.controls{flex:0 0 43px!important;box-sizing:border-box!important;height:43px!important;min-height:43px!important;max-height:43px!important;padding:5px 2px!important;margin:0!important}
 main>.caption,.caption{flex:0 0 45px!important;box-sizing:border-box!important;height:45px!important;min-height:45px!important;max-height:45px!important;overflow:auto!important;margin:0!important;padding:5px 0!important}
 main>.slide-description,.slide-description{flex:0 0 90px!important;box-sizing:border-box!important;height:90px!important;min-height:90px!important;max-height:90px!important;overflow:auto!important;margin:0 auto!important;padding:8px 14px!important}
 main>div[style*="text-align:center"]{flex:0 0 37px!important;box-sizing:border-box!important;height:37px!important;min-height:37px!important;max-height:37px!important;padding:3px!important;margin:0!important}
 footer{flex:0 0 auto!important;padding:2px 8px!important}
}
</style>`;
 const desktopStabilizer = `<script id="ziiply-desktop-layout-stabilizer">
(function(){
 if(window.matchMedia('(max-width:700px)').matches)return;
 function lock(){
   const main=document.querySelector('main');
   if(!main)return;
   const image=[...main.querySelectorAll('img')].find(i=>i.closest('.viewer,#viewer'))||[...main.querySelectorAll('img')].sort((a,b)=>(b.naturalWidth*b.naturalHeight)-(a.naturalWidth*a.naturalHeight))[0];
   if(!image)return;
   let stage=image;
   while(stage.parentElement&&stage.parentElement!==main)stage=stage.parentElement;
   if(stage.parentElement!==main)return;
   main.style.setProperty('display','flex','important');
   main.style.setProperty('flex-direction','column','important');
   main.style.setProperty('min-height','0','important');
   main.style.setProperty('overflow','hidden','important');
   for(const child of [...main.children]){
     child.style.setProperty('box-sizing','border-box','important');
     child.style.setProperty('min-height','0','important');
     if(child===stage){
       child.style.setProperty('flex','1 1 0px','important');
       child.style.setProperty('height','0px','important');
       child.style.setProperty('overflow','hidden','important');
       continue;
     }
     if(!child.dataset.ziiplyFixedHeight){
       const rect=child.getBoundingClientRect();
       const hasControls=!!child.querySelector('button,select,input');
       const hasText=(child.innerText||'').trim().length>0;
       const minimum=hasControls?44:hasText?Math.max(86,rect.height):Math.max(8,rect.height);
       child.dataset.ziiplyFixedHeight=String(Math.ceil(minimum));
     }
     const px=child.dataset.ziiplyFixedHeight+'px';
     child.style.setProperty('flex','0 0 '+px,'important');
     child.style.setProperty('height',px,'important');
     child.style.setProperty('min-height',px,'important');
     child.style.setProperty('max-height',px,'important');
     child.style.setProperty('overflow','auto','important');
   }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lock,{once:true});else lock();
 window.addEventListener('load',lock,{once:true});
 window.addEventListener('resize',lock);
})();
</script>`;

 const slide39LeftImage = `<script id="ziiply-slide39-remove-fabricated-elements">
(function(){
 let composition=null,original=null,oldStyle=null;
 const realSrc='/ohje/gosta-original';
 function restore(){
  if(composition){composition.remove();composition=null;}
  if(original&&oldStyle!==null){original.setAttribute('style',oldStyle);oldStyle=null;}
  original=null;
 }
 function render(){
  const img=document.getElementById('picture'),viewer=document.getElementById('viewer'),jump=document.getElementById('jump');
  if(!img||!viewer||!jump)return;
  if(Number(jump.value)!==38){restore();return;}
  if(!img.complete||!img.naturalWidth)return;
  if(original&&original!==img)restore();
  if(composition)return;
  original=img;oldStyle=img.getAttribute('style')||'';
  // The fabricated phone and avatar are REMOVED from the visible slide, not covered.
  // Only the authentic right-side instruction region is retained from the old source.
  img.style.display='none';
  composition=document.createElement('div');
  composition.id='ziiply-slide39-rebuilt';
  composition.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;box-sizing:border-box;padding:2%;background:#fff9eb;overflow:hidden;';
  const heading=document.createElement('div');
  heading.style.cssText='flex:0 0 12%;display:flex;align-items:center;box-sizing:border-box;border:2px solid #c49d54;border-radius:12px;padding:0 2%;font:bold clamp(13px,2.4vw,34px) system-ui;color:#164b3a;';
  heading.textContent='GÖSTA – TARJOUSVAHTI';
  const columns=document.createElement('div');
  columns.style.cssText='flex:1;min-height:0;display:flex;gap:1.5%;padding-top:1%;';
  const left=document.createElement('div');
  left.style.cssText='flex:0 0 40%;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;';
  const authentic=document.createElement('img');
  authentic.src=realSrc;authentic.alt='Alkuperäinen Göstan tarjousvahtinäkymä';
  authentic.style.cssText='display:block!important;position:static!important;width:auto!important;height:auto!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;transform:none!important;';
  left.appendChild(authentic);
  const right=document.createElement('div');
  right.style.cssText='flex:1;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;';
  const canvas=document.createElement('canvas');
  // Crop ONLY the existing genuine instruction panel, excluding the entire fake phone and avatar.
  const sx=Math.round(img.naturalWidth*.418),sy=Math.round(img.naturalHeight*.213);
  const sw=Math.round(img.naturalWidth*.565),sh=Math.round(img.naturalHeight*.69);
  canvas.width=sw;canvas.height=sh;
  canvas.getContext('2d').drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
  canvas.style.cssText='display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;';
  right.appendChild(canvas);
  columns.append(left,right);composition.append(heading,columns);
  viewer.appendChild(composition);
 }
 function start(){
  const img=document.getElementById('picture');if(!img)return;
  img.addEventListener('load',()=>{restore();render()});
  new MutationObserver(()=>{restore();render()}).observe(img,{attributes:true,attributeFilter:['src']});
  document.getElementById('jump')?.addEventListener('change',()=>requestAnimationFrame(()=>{restore();render()}));
  for(const id of ['next','prev'])document.getElementById(id)?.addEventListener('click',()=>requestAnimationFrame(()=>{restore();render()}));
  render();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>`;
 const html=desktop?rows[0].html.replace('</head>',desktopLayout+'</head>').replace('</body>',desktopStabilizer+'</body>'):rows[0].html.replace('</body>',preload+slide39LeftImage+'</body>');
 return new NextResponse(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"}});
}
