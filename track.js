import * as FG from "./fg.js";
if(FG.ready){
  let sid="";
  try{sid=sessionStorage.getItem("fg_sid")||""}catch(e){}
  if(!sid){
    sid=Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,"0")).join("");
    try{sessionStorage.setItem("fg_sid",sid)}catch(e){}
  }
  window.__sid=sid;
  const page=(location.pathname.split("/").pop()||"index.html").slice(0,60);
  const device=/Mobi|Android|iPhone/i.test(navigator.userAgent)?"mobile":"desktop";
  let ref="direct";
  try{if(document.referrer)ref=new URL(document.referrer).hostname.slice(0,60)||"direct"}catch(e){}
  const quiet=()=>{};
  FG.visit(sid,{page,device,ref}).catch(quiet);
  const beat=()=>{if(!document.hidden)FG.visitBeat(sid).catch(quiet)};
  setInterval(beat,60000);
  document.addEventListener("visibilitychange",beat);
  const add=document.getElementById("add");
  if(add)add.addEventListener("click",()=>FG.visitSet(sid,{cart:true}).catch(quiet));
  const pn=document.getElementById("pname");
  if(pn){
    let last="";
    new MutationObserver(()=>{
      const m=pn.textContent.split(",")[0].trim();
      if(m&&m!==last){last=m;FG.visitSet(sid,{model:m.slice(0,40)}).catch(quiet)}
    }).observe(pn,{childList:true,characterData:true,subtree:true});
  }
}
