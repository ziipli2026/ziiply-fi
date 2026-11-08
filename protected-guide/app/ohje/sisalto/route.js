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

 const slide39LeftImage = `<script id="ziiply-slide39-authentic-left">
(function(){
 const src='/ohje/gosta-original';
 let left=null, avatarMask=null;
 function place(){
  const image=document.getElementById('picture'),viewer=document.getElementById('viewer'),jump=document.getElementById('jump');
  if(!image||!viewer||!jump)return;
  const active=Number(jump.value)===38;
  if(!active){left?.remove();avatarMask?.remove();left=null;avatarMask=null;return;}
  if(!image.naturalWidth||!image.naturalHeight)return;
  if(!left){
   left=document.createElement('div');
   left.id='ziiply-gosta-authentic-left';
   left.style.cssText='position:absolute;z-index:5;overflow:hidden;background:#fffaf0;display:flex;align-items:center;justify-content:center;pointer-events:none;';
   const actual=document.createElement('img');
   actual.src=src;
   actual.alt='Göstan alkuperäinen tarjousvahtinäkymä';
   actual.style.cssText='display:block;position:static!important;transform:none!important;width:auto!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;';
   left.appendChild(actual);
   viewer.appendChild(left);
  }
  if(!avatarMask){
   avatarMask=document.createElement('div');
   avatarMask.id='ziiply-gosta-fabricated-avatar-mask';
   avatarMask.style.cssText='position:absolute;z-index:5;background:#fffaf0;pointer-events:none;';
   viewer.appendChild(avatarMask);
  }
  const rect=image.getBoundingClientRect(),frame=viewer.getBoundingClientRect();
  const scale=Math.min(rect.width/image.naturalWidth,rect.height/image.naturalHeight);
  const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
  const x=rect.left-frame.left+(rect.width-w)/2;
  const y=rect.top-frame.top+(rect.height-h)/2;
  // Replace the full fabricated phone and frame, not just the screen.
  Object.assign(left.style,{left:(x+w*0.025)+'px',top:(y+h*0.214)+'px',width:(w*0.395)+'px',height:(h*0.689)+'px'});
  // Hide only the fabricated portrait in the top-left title strip; preserve heading and right-side instructions.
  Object.assign(avatarMask.style,{left:(x+w*0.028)+'px',top:(y+h*0.110)+'px',width:(w*0.080)+'px',height:(h*0.095)+'px'});
 }
 function start(){
  const image=document.getElementById('picture');if(!image)return;
  image.addEventListener('load',place);
  new MutationObserver(place).observe(image,{attributes:true,attributeFilter:['src']});
  window.addEventListener('resize',place);
  document.getElementById('jump')?.addEventListener('change',()=>requestAnimationFrame(place));
  for(const id of ['next','prev'])document.getElementById(id)?.addEventListener('click',()=>requestAnimationFrame(place));
  place();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>`;
 const html=desktop?rows[0].html.replace('</head>',desktopLayout+'</head>').replace('</body>',desktopStabilizer+'</body>'):rows[0].html.replace('</body>',preload+slide39LeftImage+'</body>');
 return new NextResponse(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"}});
}
