import fs from 'node:fs/promises';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
const manifestPath='context/arcade/grand-harlequin/rotation-art.json';
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const cutins=JSON.parse(await fs.readFile('context/arcade/grand-harlequin/cutin-art.json','utf8'));
manifest.previousGrin??=manifest.assets.grin;
Object.assign(manifest.assets,cutins.assets);
await fs.mkdir(manifest.sourceDirectory,{recursive:true});
async function figures(spec){
 const path=manifest.sourceDirectory+'/'+spec.source;
 try{await fs.access(path);}catch{await fs.copyFile(spec.generatedSource,path);}
 const {data,info:{width:w,height:h}}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const all=components(data,w,h,(d,k)=>d[k+3]>100).filter(f=>f.count>2000).sort((a,b)=>(a.y+a.h/2)-(b.y+b.h/2));
 if(all.length!==spec.columns*spec.rows)throw Error('Expected '+spec.columns*spec.rows+' silhouettes in '+path+', got '+all.length);
 const ordered=Array.from({length:spec.rows},(_,r)=>all.slice(r*spec.columns,(r+1)*spec.columns).sort((a,b)=>a.x-b.x)).flat();
 // Label each opaque figure first; grow all labels together into its original
 // soft alpha. Nearby capes never steal the next sprite's fingers or glow.
 const owner=new Uint8Array(w*h),queue=[];
 for(let i=0;i<ordered.length;i++){
  const f=ordered[i],pending=[f.seed];owner[f.seed]=i+1;
  for(let n=0;n<pending.length;n++){
   const p=pending[n],x=p%w,y=Math.floor(p/w);queue.push(p);
   for(const q of [x?p-1:-1,x<w-1?p+1:-1,y?p-w:-1,y<h-1?p+w:-1])if(q>=0&&!owner[q]&&data[q*4+3]>100){owner[q]=i+1;pending.push(q);}
  }
 }
 for(let n=0;n<queue.length;n++){
  const p=queue[n],x=p%w,y=Math.floor(p/w);
  for(const q of [x?p-1:-1,x<w-1?p+1:-1,y?p-w:-1,y<h-1?p+w:-1])if(q>=0&&!owner[q]&&data[q*4+3]>8){owner[q]=owner[p];queue.push(q);}
 }
 const result=[];
 for(let i=0;i<ordered.length;i++){
  const f=ordered[i],pad=8,left=Math.max(0,f.x-pad),top=Math.max(0,f.y-pad),width=Math.min(w,f.x+f.w+pad)-left,height=Math.min(h,f.y+f.h+pad)-top;
  const raw=Buffer.alloc(width*height*4);let lo=w,hi=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const p=(top+y)*w+left+x;if(owner[p]!==i+1)continue;
   data.copy(raw,(y*width+x)*4,p*4,p*4+4);
   if(top+y>=f.y+f.h-36&&data[p*4+3]>180){lo=Math.min(lo,left+x);hi=Math.max(hi,left+x);}
  }
  result.push({image:sharp(raw,{raw:{width,height,channels:4}}),width,height,foot:f.y+f.h-top-1,anchor:(lo+hi)/2-left,crop:{left,top,width,height},bounds:f});
 }
 return result;
}
for(const name of ['grin','charge']){
const spec=manifest.assets[name],poses=await figures(spec),layers=[],registration=[],cols=spec.columns,rows=spec.rows;
const k=Math.min(350/Math.max(...poses.map(f=>f.bounds.h)),184/Math.max(...poses.map(f=>f.anchor)),184/Math.max(...poses.map(f=>f.width-f.anchor)));
for(let i=0;i<poses.length;i++){
 const f=poses[i],width=Math.round(f.width*k),height=Math.round(f.height*k),x=Math.round(192-f.anchor*k),y=Math.round(432-f.foot*k);
 if(x<0||y<0||x+width>384||y+height>448)throw Error('Grin registration overflow '+i+' '+JSON.stringify({x,y,width,height,anchor:f.anchor}));
 layers.push({input:await f.image.resize(width,height).png().toBuffer(),left:i%cols*384+x,top:Math.floor(i/cols)*448+y});
 registration.push({crop:f.crop,anchor:[f.anchor,f.foot],destination:[x,y],scale:k});
}
await sharp({create:{width:cols*384,height:rows*448,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(spec.outputs[0]);
const cast=[];
for(let i=0;i<poses.length;i++)cast.push({input:await sharp(spec.outputs[0]).extract({left:i%cols*384,top:Math.floor(i/cols)*448+50,width:384,height:398}).resize(442,458).png().toBuffer(),left:i%4*512+35,top:Math.floor(i/4)*512+51});
await sharp({create:{width:2048,height:Math.ceil(poses.length/4)*512,channels:4,background:'#00000000'}}).composite(cast).webp({quality:94,alphaQuality:100}).toFile(spec.outputs[1]);
spec.registration=registration;console.log(spec.outputs.join('\n'));
}
{
 const spec=manifest.assets.cutinFrames,frames=await figures(spec),layers=[];
 for(let i=0;i<frames.length;i++){
  const f=frames[i],width=624,height=Math.min(148,Math.round(f.height*width/f.width));
  layers.push({input:await f.image.resize(width,height).png().toBuffer(),left:i%2*640+8,top:Math.floor(i/2)*160+Math.round((160-height)/2)});
 }
 await sharp({create:{width:1280,height:640,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(spec.output);console.log(spec.output);
}
for(const name of ['hexyBeam','bossBeam']){
 const spec=manifest.assets[name],frames=await figures(spec),atlas=[];
 for(let i=0;i<frames.length;i++){
  const f=frames[i],width=1008,height=Math.round(f.height*width/f.width*(name==='bossBeam'?.84:1)),top=Math.round(128-height/2);
  if(top<0)throw Error('Beam too tall '+name+' '+i);
  atlas.push({input:await f.image.resize(width,height).png().toBuffer(),left:8,top:i*256+top});
 }
 await sharp({create:{width:1024,height:3072,channels:4,background:'#00000000'}}).composite(atlas).webp({quality:94,alphaQuality:100}).toFile(spec.output);
 spec.frameCount=frames.length;spec.frameSize=[1024,256];spec.crops=frames.map(f=>f.crop);console.log(spec.output);
}
await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
