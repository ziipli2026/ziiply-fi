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

 const slideTen = `<style id="ziiply-slide-ten-style">
@media(min-width:701px){
 .ziiply-slide-ten-panel{position:absolute;inset:0;display:flex;gap:16px;align-items:center;justify-content:center;pointer-events:none;background:var(--bg,#f8fafb);z-index:5;padding:12px;box-sizing:border-box}
 .ziiply-slide-ten-original{flex:1 1 65%;height:100%;min-width:0;display:flex;align-items:center;justify-content:center}
 .ziiply-slide-ten-original img{max-width:100%!important;max-height:100%!important;width:auto!important;height:auto!important;object-fit:contain!important}
 .ziiply-slide-ten-card{position:relative;flex:0 0 27%;height:94%;max-width:280px;min-width:145px;border:5px solid #caa05e;border-radius:44px;background:linear-gradient(170deg,#fff2c5,#e8bf6b);box-shadow:0 6px 20px #0002;display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:space-between;padding:22px 9px;box-sizing:border-box;color:#57301d}
 .ziiply-slide-ten-card .ziiply-card-top{width:100%;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px}
 .ziiply-slide-ten-card .ziiply-card-name{font-weight:900;font-size:clamp(20px,3vw,37px)}
 .ziiply-slide-ten-card .ziiply-card-sub{font-weight:800;font-size:clamp(13px,1.7vw,20px);letter-spacing:1px}
 .ziiply-slide-ten-card .ziiply-card-bottom{border-top:2px solid #a87c43;padding-top:18px;font-size:clamp(12px,1.4vw,18px);font-weight:800}
 .ziiply-slide-ten-card .ziiply-finger{position:absolute;right:-10px;top:15%;font-size:clamp(38px,5vw,70px);filter:drop-shadow(0 3px 2px #0004);transform:rotate(-25deg)}
 .ziiply-slide-ten-card .ziiply-target{position:absolute;left:50%;top:24%;width:58px;height:58px;border:4px solid #e37c2b;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 6px #e37c2b44}
}
</style><script id="ziiply-slide-ten-script">
(function(){
 if(window.matchMedia('(max-width:700px)').matches)return;
 function update(){
  const main=document.querySelector('main'),jump=document.getElementById('jump');
  if(!main||!jump)return;
  const index=jump.selectedIndex;
  const isTen=index===9||Number(jump.value)===10&&index<0;
  let panel=document.getElementById('ziiply-slide-ten-panel');
  if(!isTen){if(panel)panel.remove();return}
  const image=[...main.querySelectorAll('img')].find(el=>!el.closest('#ziiply-slide-ten-panel')&&el.getBoundingClientRect().width>100);
  if(!image)return;
  let stage=image;while(stage.parentElement&&stage.parentElement!==main)stage=stage.parentElement;
  if(stage.parentElement!==main)return;
  if(!panel){
    panel=document.createElement('div');panel.id='ziiply-slide-ten-panel';panel.className='ziiply-slide-ten-panel';
    panel.innerHTML='<div class="ziiply-slide-ten-original"></div><div class="ziiply-slide-ten-card"><div class="ziiply-card-top"><div style="font-size:50px">⛽</div><div class="ziiply-card-name">Gösta</div><div class="ziiply-card-sub">POLTTOAINEHINNAT</div><div>Lähiasemien hinnat ja hintavertailu</div></div><div class="ziiply-card-bottom">Paina kortin yläosaa nähdäksesi hintatilastot</div><div class="ziiply-target"></div><div class="ziiply-finger">👆</div></div>';
    stage.style.setProperty('position','relative','important');
    stage.appendChild(panel);
  }
  const holder=panel.querySelector('.ziiply-slide-ten-original');
  if(holder&&!holder.querySelector('img')){const clone=image.cloneNode(true);clone.removeAttribute('id');holder.appendChild(clone)}
 }
 function start(){
  update();
  document.getElementById('jump')?.addEventListener('change',()=>setTimeout(update,0));
  document.getElementById('next')?.addEventListener('click',()=>setTimeout(update,0));
  document.getElementById('prev')?.addEventListener('click',()=>setTimeout(update,0));
  document.addEventListener('keydown',()=>setTimeout(update,0));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>`;

 const html=desktop?rows[0].html.replace('</head>',desktopLayout+'</head>').replace('</body>',desktopStabilizer+slideTen+'</body>'):rows[0].html.replace('</body>',preload+'</body>');
 return new NextResponse(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"}});
}
