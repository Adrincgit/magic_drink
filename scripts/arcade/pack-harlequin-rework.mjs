import fs from 'node:fs';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
const dir='context/arcade/grand-harlequin/',spec=JSON.parse(fs.readFileSync(dir+'rework-art.json','utf8').replace(/^\uFEFF/,''));
const boss='public/arcade/sprites/bosses/harlequin/',report=[];
async function save(input,path){await sharp(input).webp({quality:94,alphaQuality:100}).toFile(path);const m=await sharp(path).metadata();report.push({path,width:m.width,height:m.height,alpha:m.hasAlpha});}
const anchors=[128,374,642,900,140,385,650,900,140,385,650,900,130,385,645,900,132,378,650,900,138,384,651,905];
for(const [name,out,cell,scale]of [['motion','motion',512,1.66],['motionMid','motion-mid',512,1.66],['motionFinal','motion-final',512,1.66],['bossFall','clash-fall',512,.9],['hexyFall','hexy-fall',320,.58]]){
 const q=spec[name],{data,info}=await sharp(q.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const boxes=components(data,info.width,info.height,(d,k)=>d[k+3]>70).filter(q=>q.count>1500);
 if(boxes.length!==q.cols*q.rows)throw Error(name+': wrong component count '+boxes.length);
 boxes.sort((a,b)=>Math.floor((a.y+a.h/2)/(info.height/q.rows))-Math.floor((b.y+b.h/2)/(info.height/q.rows))||a.x-b.x);
 const frames=[];
 for(const [i,b]of boxes.entries()){
  const left=Math.max(0,b.x-1),top=Math.max(0,b.y-1),width=Math.min(info.width-left,b.w+2),height=Math.min(info.height-top,b.h+2);
  const w=Math.round(width*scale),h=Math.round(height*scale),anchor=name.startsWith('motion')?anchors[i]:left+width/2;
  const dx=Math.max(0,Math.min(cell-w,Math.round(cell/2-(anchor-left)*scale)));
  if(w>cell||h>cell-12)throw Error(name+': frame does not fit '+i);
  frames.push({input:await sharp(q.source).extract({left,top,width,height}).resize(w,h).png().toBuffer(),left:i%q.cols*cell+dx,top:Math.floor(i/q.cols)*cell+(cell===320?300:490)-h});
 }
 const path=name==='hexyFall'?'public/arcade/sprites/hexy/clash-fall.webp':boss+out+'.webp';
 await save(await sharp({create:{width:q.cols*cell,height:q.rows*cell,channels:4,background:'#00000000'}}).composite(frames).png().toBuffer(),path);
}
for(const [name,path,cell]of [['hexyPortrait','public/arcade/sprites/ui/hexy-clash-portraits.webp',512],['bossPortrait',boss+'clash-portraits.webp',512],['clashFX',boss+'clash-effects.webp',256]]){
 const q=spec[name],m=await sharp(q.source).metadata(),frames=[];
 for(let row=0;row<q.rows;row++)for(let col=0;col<q.cols;col++){
  const left=Math.round(col*m.width/q.cols),top=q.rowBounds?.[row]??Math.round(row*m.height/q.rows),width=Math.round((col+1)*m.width/q.cols)-left,height=(q.rowBounds?.[row+1]??Math.round((row+1)*m.height/q.rows))-top;
  // VFX rows have unequal native spacing; preserve their full silhouette
  // and aspect ratio, leaving a clear gutter around every output cell.
  const resize=name==='clashFX'?{width:232,height:232,fit:'contain',background:'#00000000'}:{width:cell,height:cell};
  frames.push({input:await sharp(q.source).extract({left,top,width,height}).resize(resize).png().toBuffer(),left:col*cell+(name==='clashFX'?12:0),top:row*cell+(name==='clashFX'?12:0)});
 }
 await save(await sharp({create:{width:q.cols*cell,height:q.rows*cell,channels:4,background:'#00000000'}}).composite(frames).png().toBuffer(),path);
}
fs.writeFileSync(dir+'rework-art.json',JSON.stringify(spec,null,2)+'\n');fs.writeFileSync(dir+'rework-assets.json',JSON.stringify(report,null,2)+'\n');console.log(report);
