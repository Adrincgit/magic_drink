import fs from 'node:fs';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
const dir='context/arcade/grand-harlequin/',src=JSON.parse(fs.readFileSync(dir+'sources.json','utf8'));
const boss='public/arcade/sprites/bosses/harlequin/',maps='public/arcade/maps/grand-ring/';
for(const p of [boss,maps])fs.mkdirSync(p,{recursive:true});
const report=[];
async function save(input,path){await sharp(input).webp({quality:94,alphaQuality:100}).toFile(path);const m=await sharp(path).metadata();report.push({path,width:m.width,height:m.height,alpha:m.hasAlpha,bytes:fs.statSync(path).size});}
await save(src.background,maps+'background.webp');await save(src.arch,maps+'arch.webp');
for(const key of ['poses','final']){
 const {data,info}=await sharp(src[key]).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const shapes=components(data,info.width,info.height,(d,k)=>d[k+3]>70).filter(q=>q.count>2000);
 if(shapes.length!==8)throw Error('Expected eight poses: '+key);
 const sorted=[...shapes.filter(q=>q.y<300).sort((a,b)=>a.x-b.x),...shapes.filter(q=>q.y>=300).sort((a,b)=>a.x-b.x)];
 const anchors=[220,636,1180,1580,260,724,1135,1585],frames=[];
 for(const [i,q]of sorted.entries()){
  const scale=.91,left=Math.max(0,q.x-1),top=Math.max(0,q.y-1),width=Math.min(info.width-left,q.w+2),height=Math.min(info.height-top,q.h+2);
  const w=Math.round(width*scale),h=Math.round(height*scale);
  const input=await sharp(src[key]).extract({left,top,width,height}).resize(w,h).png().toBuffer();
  frames.push({input,left:(i%4)*512+Math.round(256-(anchors[i]-left)*scale),top:Math.floor(i/4)*512+490-h});
 }
 await save(await sharp({create:{width:2048,height:1024,channels:4,background:'#00000000'}}).composite(frames).png().toBuffer(),boss+key+'.webp');
}
const m=await sharp(src.effects).metadata(),frames=[];
for(let row=0;row<3;row++)for(let col=0;col<4;col++){
 const left=Math.round(col*m.width/4),top=Math.round(row*m.height/3),width=Math.round((col+1)*m.width/4)-left,height=Math.round((row+1)*m.height/3)-top;
 frames.push({input:await sharp(src.effects).extract({left,top,width,height}).resize(256,256,{fit:'contain',background:'#00000000'}).png().toBuffer(),left:col*256,top:row*256});
}
await save(await sharp({create:{width:1024,height:768,channels:4,background:'#00000000'}}).composite(frames).png().toBuffer(),boss+'effects.webp');
fs.writeFileSync(dir+'assets.json',JSON.stringify(report,null,2)+'\n');console.log(report);
