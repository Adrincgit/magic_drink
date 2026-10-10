import fs from 'node:fs';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
const dir='context/arcade/harbor-barge/',sources=JSON.parse(fs.readFileSync(dir+'aquatic-sources.json','utf8')),report=[];
async function save(buffer,path){await sharp(buffer).webp({quality:95,alphaQuality:100}).toFile(path);const m=await sharp(path).metadata();report.push({path,width:m.width,height:m.height,alpha:m.hasAlpha,bytes:fs.statSync(path).size});}
async function actors(source,columns,rows,path){
 const raw=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const parts=components(raw.data,raw.info.width,raw.info.height,(d,k)=>d[k+3]>80).filter(q=>q.count>10000);
 if(parts.length!==columns*rows)throw Error('Expected '+columns*rows+' connected actors, got '+parts.length+' in '+source);
 const sorted=[];for(let r=0;r<rows;r++)sorted.push(...parts.filter(q=>Math.floor((q.y+q.h/2)/raw.info.height*rows)===r).sort((a,b)=>a.x-b.x));
 if(sorted.length!==parts.length)throw Error('Missing row');
 const scale=Math.min(236/Math.max(...parts.map(q=>q.w)),236/Math.max(...parts.map(q=>q.h))),frames=[];
 for(const [i,q]of sorted.entries()){
  const w=Math.round(q.w*scale),h=Math.round(q.h*scale);
  const input=await sharp(source).extract({left:q.x,top:q.y,width:q.w,height:q.h}).resize(w,h).png().toBuffer();
  frames.push({input,left:i%columns*256+Math.round((256-w)/2),top:Math.floor(i/columns)*256+250-h});
 }
 await save(await sharp({create:{width:columns*256,height:rows*256,channels:4,background:'#00000000'}}).composite(frames).png().toBuffer(),path);
}
await actors(sources.diver,6,4,'public/arcade/sprites/enemies/river-diver-aquatic.webp');
await actors(sources.boat,6,1,'public/arcade/sprites/enemies/river-boat-actions.webp');
const m=await sharp(sources.effects).metadata(),bands=[[.055,.285],[.335,.495],[.54,.727],[.73,1]],frames=[];
for(let row=0;row<4;row++)for(let col=0;col<4;col++){
 const left=Math.round(col*m.width/4),top=Math.round(bands[row][0]*m.height),w=Math.round((col+1)*m.width/4)-left,h=Math.round(bands[row][1]*m.height)-top;
 const input=await sharp(sources.effects).extract({left,top,width:w,height:h}).resize(240,240,{fit:'contain',background:'#00000000'}).png().toBuffer();
 frames.push({input,left:col*256+8,top:row*256+8});
}
await save(await sharp({create:{width:1024,height:1024,channels:4,background:'#00000000'}}).composite(frames).png().toBuffer(),'public/arcade/sprites/effects/harbor-aquatic.webp');
await save(sources.ground,'public/arcade/maps/harbor/ground-v2.webp');
fs.writeFileSync(dir+'aquatic-assets.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
