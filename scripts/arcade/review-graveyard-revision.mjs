import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='tests/artifacts/arcade/graveyard-revision/',browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();await page.setContent('<video muted></video>');
 for(const name of ['panic','emergence','crypt','skeleton','crawler','fear','bellkeeper']){
  const r=await page.evaluate(async source=>{
   const video=document.querySelector('video');video.src=source;await new Promise(resolve=>video.onloadeddata=resolve);
   if(!Number.isFinite(video.duration))await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=1e6;});
   const w=440,h=240,c=document.createElement('canvas');c.width=w*3;c.height=(h+23)*4;const ctx=c.getContext('2d');
   for(let i=0;i<12;i++){
    const t=.04+i*(video.duration-.12)/11;await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=t;});const x=i%3*w,y=Math.floor(i/3)*(h+23);
    ctx.drawImage(video,0,200,1440,590,x,y,w,h);ctx.fillStyle='#30273b';ctx.fillRect(x,y+h,w,23);ctx.fillStyle='#fff2d8';ctx.font='14px sans-serif';ctx.fillText(t.toFixed(2)+' s',x+10,y+h+16);
   }
   await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=2.4;});
   const full=document.createElement('canvas');full.width=video.videoWidth;full.height=video.videoHeight;full.getContext('2d').drawImage(video,0,0);
   return{png:c.toDataURL('image/png').split(',')[1],snapshot:full.toDataURL('image/png').split(',')[1],duration:video.duration};
  },'data:video/webm;base64,'+fs.readFileSync(folder+name+'.webm').toString('base64'));
  fs.writeFileSync(folder+name+'-motion.png',Buffer.from(r.png,'base64'));fs.writeFileSync(folder+name+'-in-game.png',Buffer.from(r.snapshot,'base64'));console.log(name+' decoded '+r.duration.toFixed(2)+' s');
 }
}finally{await browser.close();}
