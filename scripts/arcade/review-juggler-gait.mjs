import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='context/arcade/juggler-gait/revision-2/review/';fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:960}});await page.route('**/__review',route=>route.fulfill({contentType:'text/html',body:'<body></body>'}));await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__review');
 const result=await page.evaluate(async()=>{
  const {drawJugglerWalk}=await import('/src/components/arcade/adventure/render/jugglerWalkCanvas.js');
  const art={};for(const key of ['juggler-walk-v2']){const img=new Image();img.src='/arcade/sprites/enemies/'+key+'.webp';await img.decode();art[key]=img;}
  const sheet=document.createElement('canvas');sheet.width=1280;sheet.height=640;const c=sheet.getContext('2d');
  c.fillStyle='#303541';c.fillRect(0,0,sheet.width,sheet.height);
  for(let i=0;i<8;i++){
   c.save();c.translate(i%4*320,Math.floor(i/4)*320);c.strokeStyle='#8c8a8c';c.beginPath();c.moveTo(10,285);c.lineTo(310,285);c.stroke();
   drawJugglerWalk(c,{x:160,y:285,dir:-1,gait:(i+.01)/8},art,256);c.fillStyle='#fff0d3';c.font='18px sans-serif';c.fillText(String(i+1),15,311);c.restore();
  }
  return sheet.toDataURL('image/png').split(',')[1];
 });
 fs.writeFileSync(folder+'registered-cycle.png',Buffer.from(result,'base64'));
 console.log(folder+'registered-cycle.png');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.jugglerReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/jugglerWalkCanvas.js'].map(f=>import(root+f))));
  w.art={};for(const key of ['juggler-walk-v2']){const img=new Image();img.src='/arcade/sprites/enemies/'+key+'.webp';await img.decode();w.art[key]=img;}
  w.c=document.createElement('canvas');w.c.width=1280;w.c.height=480;w.c.style='position:fixed;inset:0;width:1280px;height:480px;z-index:999999';document.body.append(w.c);
  w.record=async(direction,speed,duration)=>{
   const s=w.createAdventure(0),e=w.makeEnemy(2700,480,3);s.damage=()=>{};s.player.x=2450;Object.assign(e,{dir:direction,timer:10});s.enemies=[e];const start=e.x,origin=direction<0?870:410,trace=[];
   const stream=w.c.captureStream(30),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3000000});
   const done=new Promise(resolve=>{rec.ondataavailable=event=>chunks.push(event.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
   const paint=()=>{const c=w.c.getContext('2d');c.fillStyle='#303541';c.fillRect(0,0,1280,480);c.strokeStyle='#6d727e';c.lineWidth=1;for(let x=0;x<1280;x+=40){c.beginPath();c.moveTo(x,390);c.lineTo(x,440);c.stroke();}c.beginPath();c.moveTo(0,420);c.lineTo(1280,420);c.stroke();w.drawJugglerWalk(c,{...e,x:origin+(e.x-start)*2,y:420},w.art,320);};
   paint();rec.start();let begin,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{begin??=now;last??=now;const time=(now-begin)/1000;acc+=Math.min(.05,(now-last)/1000)*speed;last=now;while(acc>=1/120){w.updateEnemies(s,1/120,w.playerBody,()=>{});acc-=1/120;}paint();trace.push({time,x:e.x,gait:e.gait,dir:e.dir});if(time<duration)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   rec.stop();const video=await done;stream.getTracks().forEach(track=>track.stop());return{video,trace};
  };
 });
 for(const [name,direction,speed,duration]of [['left',-1,1,4.0],['right',1,1,4.0],['slow',-1,.25,8.0]]){
  const r=await page.evaluate(args=>window.jugglerReview.record(...args),[direction,speed,duration]);fs.writeFileSync(folder+name+'.webm',Buffer.from(r.video,'base64'));fs.writeFileSync(folder+name+'-trace.json',JSON.stringify(r.trace));
  const png=await page.evaluate(async args=>{
   const video=document.createElement('video');video.muted=true;video.src=args.source;await new Promise(resolve=>video.onloadeddata=resolve);
   const sheet=document.createElement('canvas');sheet.width=1360;sheet.height=696;const c=sheet.getContext('2d');
   for(let i=0;i<12;i++){
    const t=.03+i*(64/36/args.speed-.06)/7;await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=t;});
    const actor=args.trace.reduce((a,b)=>Math.abs(a.time-t)<Math.abs(b.time-t)?a:b),x=(args.direction<0?870:410)+(actor.x-2700)*2,px=i%4*340,py=Math.floor(i/4)*348;
    c.drawImage(video,x-170,120,340,320,px,py,340,320);c.fillStyle='#222831';c.fillRect(px,py+320,340,28);c.fillStyle='#fff1da';c.font='16px sans-serif';c.fillText(`${i+1} / ${t.toFixed(2)} s`,px+10,py+340);
   }
   return sheet.toDataURL('image/png').split(',')[1];
  },{source:'data:video/webm;base64,'+r.video,trace:r.trace,direction,speed});
  fs.writeFileSync(folder+name+'-motion.png',Buffer.from(png,'base64'));console.log(name+': recorded and decoded');
 }
}finally{await browser.close();}
