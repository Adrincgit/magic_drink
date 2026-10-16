import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='tests/artifacts/arcade/barge-rebuild';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();await page.setContent('<video muted></video>');
 for(const name of ['barge-mortar','barge-burst','barge-jet','barge-drum','barge-boarding','barge-hit','barge-defeat','cannon-left','cannon-right'].filter(name=>process.argv.length<3||process.argv.slice(2).includes(name))){
  const crop=name==='cannon-left'?[120,330,830,430]:name==='cannon-right'?[500,330,830,430]:[760,315,680,385];
  const result=await page.evaluate(async({source,crop})=>{
   const video=document.querySelector('video');video.src=source;await new Promise(resolve=>video.onloadeddata=resolve);
   if(!Number.isFinite(video.duration))await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=1e6;});
   const w=460,h=Math.round(w*crop[3]/crop[2]),sheet=document.createElement('canvas');sheet.width=w*3;sheet.height=(h+23)*4;const c=sheet.getContext('2d');
   const frames=[];
   for(let i=0;i<12;i++){
    const t=.08+i*(video.duration-.2)/11;await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=t;});
    const x=i%3*w,y=Math.floor(i/3)*(h+23);c.drawImage(video,...crop,x,y,w,h);c.fillStyle='#15151a';c.fillRect(x,y+h,w,23);c.fillStyle='white';c.font='14px sans-serif';c.fillText(t.toFixed(2)+' s',x+10,y+h+17);
    if([2,5,8].includes(i)){const frame=document.createElement('canvas');frame.width=video.videoWidth;frame.height=video.videoHeight;frame.getContext('2d').drawImage(video,0,0);frames.push({time:t,image:frame.toDataURL('image/png').split(',')[1]});}
   }
   return{image:sheet.toDataURL('image/png').split(',')[1],duration:video.duration,frames};
  },{source:'data:video/webm;base64,'+fs.readFileSync(folder+'/'+name+'.webm').toString('base64'),crop});
  fs.writeFileSync(folder+'/'+name+'-motion.png',Buffer.from(result.image,'base64'));
  for(const [i,frame]of result.frames.entries())fs.writeFileSync(folder+'/'+name+'-frame-'+i+'.png',Buffer.from(frame.image,'base64'));
  console.log(name,result.duration.toFixed(2)+'s');
 }
}finally{await browser.close();}
