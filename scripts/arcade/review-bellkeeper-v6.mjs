import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder=process.env.BELL_REVIEW_FOLDER||'tests/artifacts/arcade/bellkeeper-v6/',browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();await page.setContent('<video muted></video>');
 for(const name of ['bell','reveal','wraith','victory']){
  if(process.env.BELL_SCENES&&!process.env.BELL_SCENES.split(',').includes(name))continue;
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
  if(['bell','reveal','victory'].includes(name)){
   const stats=JSON.parse(fs.readFileSync(folder+name+'.json','utf8'));
   const phase=name==='bell'?'ring':name==='reveal'?'transform':'dying';
   const start=stats.phaseStarts?.find(q=>q.phase===phase)?.time;
   if(start!==undefined){
    const duration=name==='bell'?.96:name==='reveal'?2.04:2.3,ratio=result.duration/stats.simulationTime;
    const png=await page.evaluate(async({start,duration,ratio})=>{
     const v=document.querySelector('video'),canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1536;const c=canvas.getContext('2d');
     for(let i=0;i<24;i++){
      const time=(start+(i+.5)*duration/24)*ratio;await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=time;});const x=i%4*300,y=Math.floor(i/4)*256;
      c.drawImage(v,390,220,500,400,x,y,300,240);c.fillStyle='#191725';c.fillRect(x,y+240,300,16);c.fillStyle='#f3d9b5';c.font='12px sans-serif';c.fillText(time.toFixed(2)+'s',x+6,y+253);
     }return canvas.toDataURL('image/png').split(',')[1];
    },{start,duration,ratio});fs.writeFileSync(folder+name+'-detail.png',Buffer.from(png,'base64'));
   }
  }
  if(name==='wraith'){
   const png=await page.evaluate(async()=>{
    const v=document.querySelector('video'),canvas=document.createElement('canvas');canvas.width=1440;canvas.height=700;const c=canvas.getContext('2d');
    for(let i=0;i<8;i++){await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=5.12+i*.11;});const x=i%4*360,y=Math.floor(i/4)*350;c.drawImage(v,0,240,850,470,x,y,360,320);c.fillStyle='#191725';c.fillRect(x,y+320,360,30);c.fillStyle='#f3d9b5';c.font='14px sans-serif';c.fillText((5.12+i*.11).toFixed(2)+'s',x+8,y+341);}
    return canvas.toDataURL('image/png').split(',')[1];
   });fs.writeFileSync(folder+'wraith-dash-detail.png',Buffer.from(png,'base64'));
  }
 }
}finally{await browser.close();}
