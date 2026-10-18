import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
const dir='context/arcade/cornfield-v2',out='public/arcade/act-two/cornfield-v2';
const source='C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646/';
const files={king:'41c973ea-2ee5-4f9e-b26f-b6e59dc95d6e',harvest:'4623c660-fb5a-4c45-9b37-68d966b9456e',scenery:'6fad9bf5-b738-481d-b85a-6b397b05f422',imp:'7c982b23-49db-4da5-9388-7e1efb652ba4',flock:'e4425ddf-52fd-4b0b-90d9-de9fbfdd7a71'};
await fs.mkdir(out,{recursive:true});await fs.mkdir(dir+'/sources',{recursive:true});
const registration={};
for(const [name,id] of Object.entries(files)){
 const saved=dir+'/sources/'+name+'.png';
 try{await fs.access(saved);}catch{await fs.copyFile(source+'exec-'+id+'.png',saved);}
 if(name==='scenery'){
  const boxes=[[0,0,568,520],[568,0,430,524],[998,0,538,520],[0,526,516,498],[516,688,680,316],[1198,536,338,488]];
  for(const [i,[left,top,width,height]]of boxes.entries()){
   const crop=await sharp(saved).extract({left,top,width,height}).png().toBuffer();
   await sharp(crop).trim({threshold:20}).webp({quality:93,alphaQuality:100}).toFile(out+'/prop-'+i+'.webp');
  }
  registration.scenery=boxes;continue;
 }
 // Keep authored torso coordinates and extract COMPLETE components. A few
 // pitchforks/wings cross the nominal grid; they must not become stray strips
 // in the neighbouring cel. Padding preserves those extremities.
 const sourceActors=await spriteComponents(saved),groups=Array.from({length:16},()=>new Set());
 for(const q of sourceActors.components)if(q.area>10)groups[Math.min(3,Math.floor(q.cy/256))*4+Math.min(3,Math.floor(q.cx/384))].add(q.id);
 const parts=[],side=512,top=name==='flock'?128:244;
 for(let frame=0;frame<16;frame++){
  const raw=Buffer.alloc(side*side*4),{data,info,labels}=sourceActors,originX=frame%4*384-64,originY=Math.floor(frame/4)*256-top;
  for(let y=0;y<side;y++)for(let x=0;x<side;x++){
   const sx=x+originX,sy=y+originY;if(sx<0||sy<0||sx>=info.width||sy>=info.height)continue;
   const at=sy*info.width+sx;let selected=groups[frame].has(labels[at]);
   if(!selected)for(let dy=-1;dy<=1&&!selected;dy++)for(let dx=-1;dx<=1;dx++){const xx=sx+dx,yy=sy+dy;if(xx>=0&&xx<info.width&&yy>=0&&yy<info.height&&groups[frame].has(labels[yy*info.width+xx])){selected=true;break;}}
   if(selected)data.copy(raw,(y*side+x)*4,at*4,at*4+4);
  }
  const input=await sharp(raw,{raw:{width:side,height:side,channels:4}}).resize(384,384).png().toBuffer();
  parts.push({input,left:frame%4*384,top:Math.floor(frame/4)*384});
 }
 await sharp({create:{width:1536,height:1536,channels:4,background:'#00000000'}}).composite(parts).webp({quality:94,alphaQuality:100}).toFile(out+'/'+name+'.webp');
 registration[name]={cell:384,sourceCell:[384,256],paddedSide:side,top,foot:374,scale:384/side};
}
await fs.writeFile(dir+'/registration.json',JSON.stringify(registration,null,2)+'\n');
// The generated locomotion source has 9/8 columns rather than the requested
// grid. Use its real illustrated boundaries, never the nominal prompt grid.
const walkSource=dir+'/sources/king-walk.png';
try{await fs.access(walkSource);}catch{await fs.copyFile(source+'exec-2687389e-e35c-4fca-a52b-034f591724e1.png',walkSource);}
const walk=await spriteComponents(walkSource),actors=walk.components.filter(q=>q.area>500);
const rows=[actors.filter(q=>q.cy<240),actors.filter(q=>q.cy>240&&q.cy<470),actors.filter(q=>q.cy>470&&q.cy<730),actors.filter(q=>q.cy>730)].map(row=>row.sort((a,b)=>a.cx-b.cx));
for(const [name,chosen]of [['king-walk',[...rows[0],...rows[1]].slice(0,12)],['harvest-walk',[...rows[2].filter(q=>q.width<300),...rows[3]].slice(0,12)]]){
 // One pair of root creatures touched in the original. Those two poses are
 // excluded; twelve complete, separated drawings remain available.
 if(chosen.length!==12)throw Error('Missing full walking poses: '+name);
 const scale=244/Math.max(...chosen.map(q=>q.height)),parts=[];
 for(const [frame,q]of chosen.entries()){
  const rgba=Buffer.from(walk.data),mask=new Uint8Array(walk.labels.length),w=walk.info.width,h=walk.info.height;
  for(let y=q.top;y<q.top+q.height;y++)for(let x=q.left;x<q.left+q.width;x++)if(walk.labels[y*w+x]===q.id)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h)mask[yy*w+xx]=1;}
  for(let i=0;i<mask.length;i++)if(!mask[i])rgba[i*4+3]=0;
  const width=Math.round(q.width*scale),height=Math.round(q.height*scale);
  parts.push({input:await sharp(rgba,{raw:walk.info}).extract({left:q.left,top:q.top,width:q.width,height:q.height}).resize(width,height).png().toBuffer(),left:frame%4*384+Math.round((384-width)/2),top:Math.floor(frame/4)*384+374-height});
 }
 await sharp({create:{width:1536,height:1152,channels:4,background:'#00000000'}}).composite(parts).webp({quality:94,alphaQuality:100}).toFile(out+'/'+name+'.webp');
 registration[name]={frames:12,cell:384,scale,source:chosen.map(q=>({left:q.left,top:q.top,width:q.width,height:q.height}))};
}
await fs.writeFile(dir+'/registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Cornfield v2: 88 registered animation cels and six scenery cutouts.');
