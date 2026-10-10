import fs from 'node:fs';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
const record=JSON.parse(fs.readFileSync('context/arcade/harbor-barge/upgrade-art.json','utf8'));
const source=key=>record.jobs.find(q=>q.key===key).source;
const report=[];
async function save(buffer,path){await sharp(buffer).webp({quality:96,alphaQuality:100}).toFile(path);report.push({path,...await sharp(path).metadata()});}
async function cells(key,cols,rows){
 const file=source(key),m=await sharp(file).metadata(),out=[];
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const left=Math.round(col*m.width/cols),top=Math.round(row*m.height/rows),width=Math.round((col+1)*m.width/cols)-left,height=Math.round((row+1)*m.height/rows)-top;
  out.push(await sharp(file).extract({left,top,width,height}).png().toBuffer());
 }return out;
}
async function actors(key,rows,path,size,baseline,standing){
 const frames=await cells(key,4,rows),parts=[];
 for(const frame of frames){const raw=await sharp(frame).ensureAlpha().raw().toBuffer({resolveWithObject:true});const shape=components(raw.data,raw.info.width,raw.info.height,(d,k)=>d[k+3]>100).sort((a,b)=>b.count-a.count)[0];if(!shape)throw Error('Empty actor');parts.push(shape);}
 const scale=standing===undefined?Math.min(232/Math.max(...parts.map(q=>q.w)),232/Math.max(...parts.map(q=>q.h))):240/parts[standing].h;
 const packed=[];
 for(let i=0;i<frames.length;i++){
  const q=parts[i],raw=await sharp(frames[i]).ensureAlpha().raw().toBuffer({resolveWithObject:true});let anchor=q.x+q.w/2;
  if(key==='impact'||i===standing){let left=Infinity,right=-Infinity;
   for(let y=q.y+q.h-18;y<q.y+q.h;y++)for(let x=q.x;x<q.x+q.w;x++){const k=(y*raw.info.width+x)*4;if(raw.data[k+3]>100&&raw.data[k]<100&&raw.data[k+1]<100&&raw.data[k+2]<135){left=Math.min(left,x);right=Math.max(right,x);}}
   if(Number.isFinite(left))anchor=(left+right)/2;
  }
  const width=Math.round(raw.info.width*scale),height=Math.round(raw.info.height*scale),input=await sharp(frames[i]).resize(width,height).png().toBuffer();
  const left=Math.round(size/2-anchor*scale),top=Math.round(baseline-(q.y+q.h)*scale);
  // Keep each pose inside its cell, including wide airborne silhouettes.
  const trimmed=await sharp(input).extract({left:Math.max(0,-left),top:Math.max(0,-top),width:Math.min(width, size-left)-Math.max(0,-left),height:Math.min(height,size-top)-Math.max(0,-top)}).png().toBuffer();
  packed.push({input:trimmed,left:i%4*size+Math.max(0,left),top:Math.floor(i/4)*size+Math.max(0,top)});
 }
 await save(await sharp({create:{width:4*size,height:rows*size,channels:4,background:'#00000000'}}).composite(packed).png().toBuffer(),path);
}
await actors('impact',3,'public/arcade/sprites/hexy/element-hits.webp',320,300,3);
await actors('knockdown-clean',2,'public/arcade/sprites/hexy/knockdown.webp',320,300,7);
await actors('crew-clean',4,'public/arcade/sprites/bosses/barge/crew.webp',256,250);
async function strip(frames,path,size=256){
 const packed=[];
 for(const [i,input]of frames.entries())packed.push({input:await sharp(input).resize(size-12,size-12,{fit:'contain',background:'#00000000'}).png().toBuffer(),left:i*size+6,top:6});
 await save(await sharp({create:{width:frames.length*size,height:size,channels:4,background:'#00000000'}}).composite(packed).png().toBuffer(),path);
}
await strip(await cells('drum',2,2),'public/arcade/sprites/bosses/barge/drum-states.webp');
const machine=source('machinery'),m=await sharp(machine).metadata();
async function band(start,end,columns){
 const out=[];for(const col of columns){const left=Math.round(col*m.width/4),width=Math.round((col+1)*m.width/4)-left;out.push(await sharp(machine).extract({left,top:start,width,height:end-start}).png().toBuffer());}return out;
}
await strip(await band(0,408,[0,1,2,3]),'public/arcade/sprites/bosses/barge/tank.webp');
await strip(await band(410,706,[0,1]),'public/arcade/sprites/bosses/barge/hose.webp');
await strip(await band(410,706,[2,3]),'public/arcade/sprites/bosses/barge/nozzle.webp');
await strip(await band(706,m.height,[0,1,2,3]),'public/arcade/sprites/effects/barge-sonic.webp');
fs.writeFileSync('context/arcade/harbor-barge/upgrade-assets.json',JSON.stringify(report.map(({path,width,height,hasAlpha})=>({path,width,height,hasAlpha})),null,2)+'\n');
console.log(report.map(({path,width,height})=>({path,width,height})));
