import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
const dir='context/arcade/nightmare-storm-v8',out='public/arcade/act-two/nightmare-storm-v8';await fs.mkdir(out,{recursive:true});
const body={},palms=[],aerialPalms=[],staffTips={},report={};
const median=a=>[...a].sort((a,b)=>a-b)[Math.floor(a.length/2)];
const stature=JSON.parse(await fs.readFile('context/arcade/nightmare-coherence-v7/registration.json','utf8')).reference.targetHeight;
async function isolated(file,count,cols){
 let s=await spriteComponents(file),threshold=32;
 if(s.components.filter(q=>q.area>1500).length<count){
  const original=await sharp(file).ensureAlpha().raw().toBuffer(),mask=Buffer.from(original);threshold=100;
  for(let i=3;i<mask.length;i+=4)if(mask[i]<threshold)mask[i]=0;
  s=await spriteComponents(await sharp(mask,{raw:{width:s.info.width,height:s.info.height,channels:4}}).png().toBuffer());s.data=original;
 }
 const boxes=s.components.filter(q=>q.area>500).sort((a,b)=>b.area-a.area).slice(0,count).sort((a,b)=>a.cy-b.cy),frames=[];
 if(boxes.length!==count)throw Error(file+' missing characters');
 const ordered=[];for(let row=0;row<count/cols;row++)ordered.push(...boxes.slice(row*cols,row*cols+cols).sort((a,b)=>a.cx-b.cx));
 for(const q of ordered){
  const pad=20,left=Math.max(0,q.left-pad),top=Math.max(0,q.top-pad),width=Math.min(s.info.width-left,q.width+pad*2),height=Math.min(s.info.height-top,q.height+pad*2),rgba=Buffer.alloc(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const p=(y+top)*s.info.width+x+left,a=s.data[p*4+3];
   // Retain the whole component plus its faint alpha halo. Transparent RGB
   // can contain generated colors; it is never interpreted as visible ink.
   let halo=threshold===32;
   if(threshold>32&&a>0&&a<=threshold)for(let dy=-3;dy<=3&&!halo;dy++)for(let dx=-3;dx<=3&&!halo;dx++){
    const xx=x+left+dx,yy=y+top+dy;if(xx>=0&&yy>=0&&xx<s.info.width&&yy<s.info.height&&s.labels[yy*s.info.width+xx]===q.id)halo=true;
   }
   if(s.labels[p]===q.id||a>0&&a<=threshold&&halo){s.data.copy(rgba,(y*width+x)*4,p*4,p*4+4);}
  }
  frames.push({input:await sharp(rgba,{raw:{width,height,channels:4}}).png().toBuffer(),w:width,h:height,box:q});
 }
 return frames;
}
function point(data,w,h,test){let sx=0,sy=0,n=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=(y*w+x)*4;if(data[p+3]>150&&test(x,y,...data.subarray(p,p+3))){sx+=x;sy+=y;n++;}}if(!n)throw Error('Missing registered point');return[sx/n,sy/n];}
for(const phase of [2,3]){
 const key='nightmare-staff-'+phase,frames=await isolated(dir+'/sources/staff-phase-'+phase+'.png',8,2),scale=Math.min(440/Math.max(...frames.map(q=>q.h)),480/Math.max(...frames.map(q=>q.w))),parts=[];body[key]=[];staffTips[key]=[];
 const referenceHeight=frames[7].box.height*scale,size=512*stature/referenceHeight;
 for(const [i,q]of frames.entries()){
  const w=Math.round(q.w*scale),h=Math.round(q.h*scale),left=Math.round((512-w)/2),top=499-h;
  const input=await sharp(q.input).resize(w,h).png().toBuffer();parts.push({input,left:i%4*512+left,top:Math.floor(i/4)*512+top});
  const data=await sharp(input).ensureAlpha().raw().toBuffer();
  const socket=point(data,w,h,(x,y,r,g,b)=>r>180&&g>100&&b<110&&r>b*1.7&&((i<4&&y<h*.55)||(i>=4&&x<w*.3)));
  staffTips[key].push([left+socket[0],top+socket[1]]);body[key].push({size,offsetX:0});
 }
 await sharp({create:{width:2048,height:1024,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/staff-'+phase+'.webp');report[key]={frames:8,scale,size};
}
const worldParts=[],portraitParts=[];body['pressure-boss-air']=[];
const mad=await isolated('context/arcade/nightmare-sprites-v6/sources/boss-air-mad.png',4,2),strain=await isolated(dir+'/sources/boss-air-strain.png',4,2);
for(let row=0;row<4;row++){
 const frames=row===3?strain:mad,scale=Math.min(438/Math.max(...frames.map(q=>q.h)),480/Math.max(...frames.map(q=>q.w)));
 for(const [cel,q]of frames.entries()){
  const w=Math.round(q.w*scale),h=Math.round(q.h*scale),input=await sharp(q.input).resize(w,h).png().toBuffer(),data=await sharp(input).ensureAlpha().raw().toBuffer();
  const palm=point(data,w,h,(x,y,r,g,b)=>x<w*.3&&y<h*.6&&r>195&&g>190&&b>180),left=Math.round(86-palm[0]),top=Math.round(210-palm[1]);
  if(left<0||top<0||left+w>512||top+h>512)throw Error('Air cast outside cel '+row+':'+cel);
  worldParts.push({input,left:cel*512+left,top:row*512+top});palms.push([left+palm[0],top+palm[1]]);body['pressure-boss-air'].push({size:102.4,offsetX:0});
  if(row<3){
   portraitParts.push({input:await sharp('public/arcade/act-two/nightmare-sprites-v6/boss-portraits.webp').extract({left:cel*704,top:2*704,width:704,height:704}).png().toBuffer(),left:cel*704,top:row*704});
  }else{
   const raw=await sharp(q.input).ensureAlpha().raw().toBuffer(),face=point(raw,q.w,q.h,(x,y,r,g,b)=>x>q.w*.25&&x<q.w*.65&&y>q.h*.14&&y<q.h*.4&&r>195&&g>110&&b>100&&r>g+20);
   const ps=1.6,pw=Math.round(q.w*ps),ph=Math.round(q.h*ps),px=Math.round(335-face[0]*ps),py=Math.round(260-face[1]*ps);
   const resized=await sharp(q.input).resize(pw,ph).png().toBuffer(),canvas=await sharp({create:{width:1536,height:1536,channels:4,background:'#0000'}}).composite([{input:resized,left:px+256,top:py+256}]).png().toBuffer();
   portraitParts.push({input:await sharp(canvas).extract({left:256,top:256,width:704,height:704}).png().toBuffer(),left:cel*704,top:row*704});
  }
 }
}
await sharp({create:{width:2048,height:2048,channels:4,background:'#0000'}}).composite(worldParts).webp({lossless:true}).toFile(out+'/boss-air.webp');
await sharp({create:{width:2816,height:2816,channels:4,background:'#0000'}}).composite(portraitParts).webp({lossless:true}).toFile(out+'/boss-portraits.webp');
{
 const frames=await isolated(dir+'/sources/aerial-five-fingers.png',16,4),scale=Math.min(440/Math.max(...frames.map(q=>q.h)),480/Math.max(...frames.map(q=>q.w))),parts=[];
 const ref=median(frames.slice(4,10).map(q=>q.box.height*scale)),size=512*108/ref;body['aerial-boss-air-actions']=[];
 for(const [i,q]of frames.entries()){
  const w=Math.round(q.w*scale),h=Math.round(q.h*scale),left=Math.round((512-w)/2),top=499-h,input=await sharp(q.input).resize(w,h).png().toBuffer();
  parts.push({input,left:i%4*512+left,top:Math.floor(i/4)*512+top});body['aerial-boss-air-actions'].push({size,offsetX:0});
  let palm=[w*.3,h*.3];
  if(i>=3&&i<10){const raw=await sharp(input).ensureAlpha().raw().toBuffer();palm=point(raw,w,h,(x,y,r,g,b)=>y<h*.22&&r>200&&g>190&&b>180);}
  aerialPalms.push([left+palm[0],top+palm[1]]);
 }
 await sharp({create:{width:2048,height:2048,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/boss-aerial-actions.webp');
}
for(const [name,count,cols,side,h]of [['purple-energy',8,4,256,256],['speech-balloons',4,2,512,224]]){
 const frames=await isolated(dir+'/sources/'+name+'.png',count,cols),parts=[];
 for(const [i,q]of frames.entries()){
  const scale=Math.min((side-24)/q.w,(h-24)/q.h),w=Math.round(q.w*scale),height=Math.round(q.h*scale);
  parts.push({input:await sharp(q.input).resize(w,height).png().toBuffer(),left:i%cols*side+Math.round((side-w)/2),top:Math.floor(i/cols)*h+Math.round((h-height)/2)});
 }
 await sharp({create:{width:side*cols,height:h*(count/cols),channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/'+name+'.webp');
}
await fs.writeFile('src/components/arcade/adventure/actors/bosses/nightmareStormRegistration.js','// Generated by pack-nightmare-storm.mjs. Cyan/magenta spiral eyes, firmly extended palm.\nexport const NIGHTMARE_STORM_BODY='+JSON.stringify(body)+';\nexport const NIGHTMARE_STORM_PALMS='+JSON.stringify(palms)+';\nexport const NIGHTMARE_STORM_AERIAL_PALMS='+JSON.stringify(aerialPalms)+';\nexport const NIGHTMARE_STAFF_TIPS='+JSON.stringify(staffTips)+';\n');
await fs.writeFile(dir+'/registration.json',JSON.stringify({body,palms,aerialPalms,staffTips,report},null,2)+'\n');console.log('Packed melee cels, fixed-palm airborne cels, spiral portraits, purple energy and painted speech balloons.');
