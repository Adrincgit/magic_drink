import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
import {NIGHTMARE_PERFORMANCE_BODY,NIGHTMARE_PERFORMANCE_PALMS} from '../../src/components/arcade/adventure/actors/bosses/nightmarePerformanceRegistration.js';
const dir='context/arcade/nightmare-combat-v11',out='public/arcade/act-two/nightmare-combat-v11';await fs.mkdir(out,{recursive:true});
const median=a=>[...a].sort((a,b)=>a-b)[Math.floor(a.length/2)],body={...NIGHTMARE_PERFORMANCE_BODY},palms=[...NIGHTMARE_PERFORMANCE_PALMS],report={};
const targetFace=18.9938671875;
async function isolated(name,count,cols){
 const file=dir+'/sources/'+name+'.png';let s=await spriteComponents(file),threshold=32;
 if(s.components.filter(q=>q.area>1000).length<count){
  const original=s.data,{width,height}=s.info;
  for(const limit of [100,160,200,225]){const mask=Buffer.from(original);threshold=limit;for(let i=3;i<mask.length;i+=4)if(mask[i]<limit)mask[i]=0;
   s=await spriteComponents(await sharp(mask,{raw:{width,height,channels:4}}).png().toBuffer());s.data=original;if(s.components.filter(q=>q.area>1000).length>=count)break;
  }
 }
 const boxes=s.components.filter(q=>q.area>1000).sort((a,b)=>b.area-a.area).slice(0,count).sort((a,b)=>a.cy-b.cy),order=[];
 if(boxes.length!==count)throw Error(name+' expected '+count+' components, found '+boxes.length);
 for(let row=0;row<count/cols;row++)order.push(...boxes.slice(row*cols,row*cols+cols).sort((a,b)=>a.cx-b.cx));
 // Keep detached painted smear tips and smoke wisps with their own drawing.
 // They must not be discarded merely because their alpha is disconnected.
 const owners=new Map();for(const part of s.components.filter(q=>q.area>50)){
  const owner=boxes.includes(part)?part:boxes.reduce((best,q)=>(part.cx-q.cx)**2+(part.cy-q.cy)**2<(part.cx-best.cx)**2+(part.cy-best.cy)**2?q:best,boxes[0]);owners.set(part.id,owner.id);
 }
 for(const q of boxes){const parts=s.components.filter(p=>owners.get(p.id)===q.id),right=Math.max(...parts.map(p=>p.left+p.width)),bottom=Math.max(...parts.map(p=>p.top+p.height));q.left=Math.min(...parts.map(p=>p.left));q.top=Math.min(...parts.map(p=>p.top));q.width=right-q.left;q.height=bottom-q.top;}
 const frames=[];for(const q of order){
  const pad=12,left=Math.max(0,q.left-pad),top=Math.max(0,q.top-pad),w=Math.min(s.info.width-left,q.width+pad*2),h=Math.min(s.info.height-top,q.height+pad*2),rgba=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const p=(y+top)*s.info.width+x+left,a=s.data[p*4+3];let halo=threshold===32;
   if(threshold>32&&a>0&&a<=threshold)for(let dy=-3;dy<=3&&!halo;dy++)for(let dx=-3;dx<=3&&!halo;dx++){const xx=x+left+dx,yy=y+top+dy;if(xx>=0&&yy>=0&&xx<s.info.width&&yy<s.info.height&&s.labels[yy*s.info.width+xx]===q.id)halo=true;}
   if(owners.get(s.labels[p])===q.id||a>0&&a<=threshold&&halo)s.data.copy(rgba,(y*w+x)*4,p*4,p*4+4);
  }
  frames.push({rgba,w,h,input:await sharp(rgba,{raw:{width:w,height:h,channels:4}}).png().toBuffer(),box:q});
 }
 return frames;
}
function skinBox(q){
 const points=[];for(let y=0;y<q.h*.65;y++)for(let x=0;x<q.w*.8;x++){const i=(y*q.w+x)*4,[r,g,b,a]=q.rgba.subarray(i,i+4);if(a>150&&r>200&&g>120&&b>100&&r>g+25&&r>b+15&&b/g>.68)points.push([x,y]);}
 // A broad skin envelope around the face excludes white gloves, cloth and
 // gold. A common scale across each complete sequence preserves anatomy.
 if(!points.length)throw Error('Missing skin landmarks');const ys=points.map(p=>p[1]).sort((a,b)=>a-b),lo=ys[Math.floor(ys.length*.1)],hi=ys[Math.floor(ys.length*.7)],xs=points.filter(p=>p[1]>=lo&&p[1]<=hi).map(p=>p[0]).sort((a,b)=>a-b);
 return{width:xs[Math.floor(xs.length*.95)]-xs[Math.floor(xs.length*.05)],x:median(xs),y:median(ys)};
}
function average(q,test){let sx=0,sy=0,n=0;for(let y=0;y<q.h;y++)for(let x=0;x<q.w;x++){const i=(y*q.w+x)*4;if(q.rgba[i+3]>150&&test(x,y,...q.rgba.subarray(i,i+3))){sx+=x;sy+=y;n++;}}if(!n)throw Error('Missing socket');return[sx/n,sy/n];}
async function faceWidth(q){
 const mask=Buffer.from(q.rgba);for(let p=0;p<mask.length;p+=4){const[r,g,b,a]=mask.subarray(p,p+4);if(!(a>150&&r>210&&g>125&&g<225&&b>100&&b<210&&r>g+25&&r>b+35&&b/g>.72))mask[p+3]=0;}
 const s=await spriteComponents(await sharp(mask,{raw:{width:q.w,height:q.h,channels:4}}).png().toBuffer()),faces=s.components.filter(c=>c.area>30&&c.width/c.height>.55&&c.width/c.height<2.2).sort((a,b)=>b.area-a.area);
 if(!faces.length)throw Error('Face not found');return faces[0].width;
}
for(const phase of [2,3]){
 const key='nightmare-staff-sweep-'+phase,source=await isolated('staff-sweep-'+phase+'-spaced',12,4),scale=Math.min(440/Math.max(...source.map(q=>q.h)),470/Math.max(...source.map(q=>q.w))),faces=await Promise.all(source.map(faceWidth)),face=median(faces),worldScale=101.300625/source[11].box.height,size=512*worldScale/scale,parts=[];body[key]=[];
 for(const [i,q]of source.entries()){
  const w=Math.round(q.w*scale),h=Math.round(q.h*scale),left=Math.round((512-w)/2),top=499-h;
  parts.push({input:await sharp(q.input).resize(w,h).png().toBuffer(),left:i%4*512+left,top:Math.floor(i/4)*512+top});
  const foot=average(q,(x,y,r,g,b)=>y>q.h*.78&&b>g*1.3&&b>r*1.05);
  body[key].push({size,offsetX:(256-left-foot[0]*scale)*size/512,reach:Math.max(45,(foot[0]-12)*worldScale)});
 }
 await sharp({create:{width:2048,height:1536,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/staff-sweep-'+phase+'.webp');report[key]={size,face,faces,worldScale};
}
{
 const source=await isolated('strained-joy',4,2),scale=Math.min(438/Math.max(...source.map(q=>q.h)),480/Math.max(...source.map(q=>q.w))),world=[{input:await sharp('public/arcade/act-two/nightmare-performance-v10/boss-air.webp').png().toBuffer(),left:0,top:0}],portraits=[{input:await sharp('public/arcade/act-two/nightmare-performance-v10/boss-portraits.webp').png().toBuffer(),left:0,top:0}];
 body['pressure-boss-air']=[...body['pressure-boss-air'],...Array.from({length:4},()=>({size:102.4,offsetX:0}))];
 for(const [i,q]of source.entries()){
  const p=average(q,(x,y,r,g,b)=>x<q.w*.3&&y<q.h*.6&&r>195&&g>190&&b>180),w=Math.round(q.w*scale),h=Math.round(q.h*scale),left=Math.round(86-p[0]*scale),top=Math.round(210-p[1]*scale);
  if(left<0||top<0||left+w>512||top+h>512)throw Error('Casting outside cell '+i);
  world.push({input:await sharp(q.input).resize(w,h).png().toBuffer(),left:i*512+left,top:3072+top});palms.push([left+p[0]*scale,top+p[1]*scale]);
  const face=average(q,(x,y,r,g,b)=>x>q.w*.25&&x<q.w*.65&&y>q.h*.14&&y<q.h*.4&&r>195&&g>110&&b>100&&r>g+20),ps=scale*1.8,pw=Math.round(q.w*ps),ph=Math.round(q.h*ps),px=Math.round(335-face[0]*ps),py=Math.round(260-face[1]*ps);
  const canvas=await sharp({create:{width:1536,height:1536,channels:4,background:'#0000'}}).composite([{input:await sharp(q.input).resize(pw,ph).png().toBuffer(),left:px+256,top:py+256}]).png().toBuffer();portraits.push({input:await sharp(canvas).extract({left:256,top:256,width:704,height:704}).png().toBuffer(),left:i*704,top:4224});
 }
 await sharp({create:{width:2048,height:3584,channels:4,background:'#0000'}}).composite(world).webp({lossless:true}).toFile(out+'/boss-air.webp');
 await sharp({create:{width:2816,height:4928,channels:4,background:'#0000'}}).composite(portraits).webp({lossless:true}).toFile(out+'/boss-portraits.webp');
}
{
 const source=await isolated('purple-detonation-spaced',8,4),scale=470/Math.max(...source.map(q=>Math.max(q.w,q.h))),parts=[];
 for(const [i,q]of source.entries()){const w=Math.round(q.w*scale),h=Math.round(q.h*scale);parts.push({input:await sharp(q.input).resize(w,h).png().toBuffer(),left:i%4*512+Math.round((512-w)/2),top:Math.floor(i/4)*512+499-h});}
 await sharp({create:{width:2048,height:1024,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/purple-detonation.webp');
}
const crops=Array.from({length:28},(_,i)=>[i%4*704,Math.floor(i/4)*704,704,704]);
await fs.writeFile('src/components/arcade/adventure/actors/bosses/nightmareCombatRegistration.js','// Generated by pack-nightmare-combat.mjs. Registered drawing scale, feet and emitting palm.\nexport const NIGHTMARE_COMBAT_BODY='+JSON.stringify(body)+';\nexport const NIGHTMARE_COMBAT_PALMS='+JSON.stringify(palms)+';\nexport const NIGHTMARE_COMBAT_PORTRAITS='+JSON.stringify(crops)+';\n');
await fs.writeFile(dir+'/registration.json',JSON.stringify({body,palms,report},null,2)+'\n');console.log('Packed staff smears, acrobatics, effortful joy and purple fire/smoke.');
