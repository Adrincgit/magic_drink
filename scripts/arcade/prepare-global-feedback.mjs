import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
const root='context/arcade/global-feedback/';
const records={},atlases={};
async function groups(name,rows){
 const raw=await spriteComponents(root+'sources/'+name+'.png'),{width:w,height:h}=raw.info;
 const groups=Array.from({length:rows*4},()=>[]);
 for(const q of raw.components)if(q.area>8)groups[Math.min(rows-1,Math.floor(q.cy/h*rows))*4+Math.min(3,Math.floor(q.cx/w*4))].push(q);
 return{...raw,groups:groups.map(g=>{
  if(!g.length)throw Error(name+' has an empty cel');
  const x=Math.min(...g.map(c=>c.left)),y=Math.min(...g.map(c=>c.top)),right=Math.max(...g.map(c=>c.left+c.width)),bottom=Math.max(...g.map(c=>c.top+c.height));
  return{x,y,w:right-x,h:bottom-y,ids:new Set(g.map(c=>c.id))};
 })};
}
function isolate(raw,box){
 const {data,info,labels}=raw,{width:w,height:h}=info,rgba=Buffer.alloc(box.w*box.h*4);
 for(let y=0;y<box.h;y++)for(let x=0;x<box.w;x++){
  const j=(box.y+y)*w+box.x+x;let keep=false;
  for(let dy=-1;dy<=1&&!keep;dy++)for(let dx=-1;dx<=1;dx++){const xx=box.x+x+dx,yy=box.y+y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h&&box.ids.has(labels[yy*w+xx])){keep=true;break;}}
  if(keep)data.copy(rgba,(y*box.w+x)*4,j*4,j*4+4);
 }
 return rgba;
}
function measurements(rgba,w,h){
 let bowX=0,bowN=0;const yellow=[];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const j=(y*w+x)*4,[r,g,b,a]=rgba.subarray(j,j+4);if(a<100)continue;
  if(y>h*.3&&y<h*.72&&r>180&&g<75&&b<65){bowX+=x;bowN++;}
  if(r>180&&g>140&&b<105)yellow.push([x,y]);
 }
 const bow=bowN?bowX/bowN:w*.5,maxX=Math.max(...yellow.map(p=>p[0])),star=yellow.filter(p=>p[0]>maxX-22);
 if(!star.length)throw Error('Missing wand star');
 return{bow,tip:[star.reduce((a,p)=>a+p[0],0)/star.length,star.reduce((a,p)=>a+p[1],0)/star.length]};
}
for(const [name,rows,sheet,target]of [['glide',5,'glide-fire-v1',244],['guard',4,'guard-walk-v1',244],['idle',2,'health-idle-v1',244]]){
 try{await fs.access(root+'sources/'+name+'.png');}catch{continue;}
 const raw=await groups(name,rows),scale=target/Math.max(...raw.groups.map(b=>b.h)),parts=[],meta=[];
 for(const [i,b]of raw.groups.entries()){
  const rgba=isolate(raw,b),m=measurements(rgba,b.w,b.h),w=Math.round(b.w*scale),h=Math.round(b.h*scale),left=Math.round(160-m.bow*scale),top=300-h;
  if(left<0||left+w>320)throw Error(name+' overflow in cel '+i);
  parts.push({input:await sharp(rgba,{raw:{width:b.w,height:b.h,channels:4}}).resize(w,h).png().toBuffer(),left:i%4*320+left,top:Math.floor(i/4)*320+top});
  meta.push({tip:[+(left+m.tip[0]*scale).toFixed(2),+(top+m.tip[1]*scale).toFixed(2)]});
 }
 await sharp({create:{width:1280,height:rows*320,channels:4,background:'#00000000'}}).composite(parts).webp({lossless:true}).toFile('public/arcade/sprites/hexy/'+sheet+'.webp');
 records[name]={scale,boxes:raw.groups.map(({ids,...b})=>b)};atlases[sheet]=meta;
}
for(const [name,rows]of [['elements',6],['aura',2]]){
 try{await fs.access(root+'sources/'+name+'.png');}catch{continue;}
 const raw=await groups(name,rows),parts=[];
 for(let row=0;row<rows;row++){
  const boxes=raw.groups.slice(row*4,row*4+4),dust=name==='elements'&&row>=2&&row<=4;
  const scale=Math.min((dust?232:280)/Math.max(...boxes.map(b=>b.w)),(dust?140:280)/Math.max(...boxes.map(b=>b.h)));
  for(const [col,b]of boxes.entries()){
   const w=Math.round(b.w*(name==='aura'?280/Math.max(...boxes.map(q=>q.w)):scale)),h=Math.round(b.h*(name==='aura'?280/Math.max(...boxes.map(q=>q.h)):scale)),left=Math.round((320-w)/2),top=name==='elements'&&row===5?Math.round((320-h)/2):(dust?270:300)-h;
   parts.push({input:await sharp(isolate(raw,b),{raw:{width:b.w,height:b.h,channels:4}}).resize(w,h).png().toBuffer(),left:col*320+left,top:row*320+top});
  }
 }
 await fs.mkdir('public/arcade/sprites/feedback',{recursive:true});
 await sharp({create:{width:1280,height:rows*320,channels:4,background:'#00000000'}}).composite(parts).webp({lossless:true}).toFile('public/arcade/sprites/feedback/'+name+'-v1.webp');
 records[name]={boxes:raw.groups.map(({ids,...b})=>b)};
}
await fs.writeFile(root+'registration.json',JSON.stringify(records,null,2)+'\n');
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyFeedbackAtlas.js','// Bare wand tips measured on the registered 320px cels.\nexport default '+JSON.stringify(atlases,null,1)+';\n');
console.log('Registered '+Object.keys(atlases).join(', '));
