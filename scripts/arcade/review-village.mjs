import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder=process.env.VILLAGE_REVIEW_FOLDER||'tests/artifacts/arcade/village-5-2/revision-2/',browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();await page.setContent('<video muted></video>');
 for(const name of (process.env.VILLAGE_SCENES||'arrival,orchard,approach,fire,candy,child-candy,street,market,refuge').split(',')){
  const stats=JSON.parse(fs.readFileSync(folder+name+'.json','utf8'));
  const result=await page.evaluate(async({source,stats,name})=>{
   const v=document.querySelector('video');v.src=source;await new Promise(r=>v.onloadeddata=r);if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1e6;});
   const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=1144;const c=canvas.getContext('2d'),frames=[];
   const ratio=v.duration/stats.simulationTime,at=stats.transforms[0]?.time;
   for(let i=0;i<12;i++){
    const time=name.includes('candy')&&at!==undefined?Math.min(v.duration-.1,Math.max(.04,(at-.5+i*.2)*ratio)):.04+(v.duration-.12)*i/11;
    await new Promise(r=>{v.onseeked=r;v.currentTime=time;});const x=i%3*480,y=Math.floor(i/3)*286;c.drawImage(v,x,y,480,270);c.fillStyle='#191725';c.fillRect(x,y+270,480,16);c.fillStyle='#f3d9b5';c.font='12px sans-serif';c.fillText(time.toFixed(2)+'s',x+8,y+283);
    if([0,3,5,7,9].includes(i)){const full=document.createElement('canvas');full.width=v.videoWidth;full.height=v.videoHeight;full.getContext('2d').drawImage(v,0,0);frames.push({i,png:full.toDataURL('image/png').split(',')[1]});}
   }return{png:canvas.toDataURL('image/png').split(',')[1],frames,duration:v.duration};
  },{source:'data:video/webm;base64,'+fs.readFileSync(folder+name+'.webm').toString('base64'),stats,name});
  fs.writeFileSync(folder+name+'-motion.png',Buffer.from(result.png,'base64'));for(const f of result.frames)fs.writeFileSync(folder+name+'-frame-'+f.i+'.png',Buffer.from(f.png,'base64'));console.log(name+': decoded '+result.duration.toFixed(2)+'s');
 }
}finally{await browser.close();}
