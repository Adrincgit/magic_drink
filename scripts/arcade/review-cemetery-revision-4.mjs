import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='tests/artifacts/arcade/cemetery-revision-4/',browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();await page.setContent('<video muted></video>');
 for(const name of ['opening','gate-return','canopy','skeleton-walk','skeleton-attack','skeleton-crumble','hand']){
  if(process.env.CEMETERY4_SCENES&&!process.env.CEMETERY4_SCENES.split(',').includes(name))continue;
  const result=await page.evaluate(async source=>{
   const v=document.querySelector('video');v.src=source;await new Promise(resolve=>v.onloadeddata=resolve);if(!Number.isFinite(v.duration))await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=1e6;});
   const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=1144;const c=canvas.getContext('2d'),frames=[];
   for(let i=0;i<12;i++){
    const time=.04+(v.duration-.12)*i/11;await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=time;});const x=i%3*480,y=Math.floor(i/3)*286;c.drawImage(v,x,y,480,270);c.fillStyle='#191725';c.fillRect(x,y+270,480,16);c.fillStyle='#f3d9b5';c.font='12px sans-serif';c.fillText(time.toFixed(2)+'s',x+8,y+283);
    if([0,2,5,6,7,8].includes(i)){const full=document.createElement('canvas');full.width=v.videoWidth;full.height=v.videoHeight;full.getContext('2d').drawImage(v,0,0);frames.push({i,png:full.toDataURL('image/png').split(',')[1]});}
   }
   return{png:canvas.toDataURL('image/png').split(',')[1],frames,duration:v.duration};
  },'data:video/webm;base64,'+fs.readFileSync(folder+name+'.webm').toString('base64'));
  fs.writeFileSync(folder+name+'-motion.png',Buffer.from(result.png,'base64'));for(const q of result.frames)fs.writeFileSync(folder+name+'-frame-'+q.i+'.png',Buffer.from(q.png,'base64'));console.log(name+': decoded '+result.duration.toFixed(2)+'s');
 }
}finally{await browser.close();}
