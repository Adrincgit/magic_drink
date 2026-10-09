import fs from 'node:fs/promises';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
const path='context/arcade/grand-harlequin/impact-art.json';
const manifest=JSON.parse(await fs.readFile(path,'utf8'));
const sockets=[];
for(const spec of manifest.assets){
 const {data,info:{width:w,height:h}}=await sharp(manifest.sourceDirectory+'/'+spec.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const figures=components(data,w,h,(d,k)=>d[k+3]>100).filter(f=>f.count>3000).sort((a,b)=>a.y+a.h/2-b.y-b.h/2);
 if(figures.length!==32)throw Error(spec.name+': expected 32, got '+figures.length);
 const sorted=Array.from({length:8},(_,r)=>figures.slice(r*4,r*4+4).sort((a,b)=>a.x-b.x)).flat(),layers=[];spec.registration=[];const hands={};
 for(let i=0;i<32;i++){
  const f=sorted[i],seen=new Uint8Array(w*h),queue=[f.seed];seen[f.seed]=1;
  for(let n=0;n<queue.length;n++){const j=queue[n],x=j%w,y=Math.floor(j/w);for(const k of [x?j-1:-1,x<w-1?j+1:-1,y?j-w:-1,y<h-1?j+w:-1])if(k>=0&&!seen[k]&&data[k*4+3]>8){seen[k]=1;queue.push(k);}}
  const xs=queue.map(j=>j%w),ys=queue.map(j=>Math.floor(j/w)),left=Math.max(0,Math.min(...xs)-2),top=Math.max(0,Math.min(...ys)-2),width=Math.min(w-left,Math.max(...xs)-left+3),height=Math.min(h-top,Math.max(...ys)-top+3);
  const isolated=Buffer.alloc(width*height*4);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const k=(top+y)*w+left+x;if(seen[k])data.copy(isolated,(y*width+x)*4,k*4,k*4+4);}
  // Register the boots, not the whole silhouette (a cape/extended hand shifts its bbox).
  let bootLeft=w,bootRight=0;for(let y=f.y+Math.floor(f.h*.82);y<f.y+f.h;y++)for(let x=f.x;x<f.x+f.w;x++){const k=(y*w+x)*4;if(seen[y*w+x]&&data[k+3]>180&&data[k]<90&&data[k+1]<90&&data[k+2]<95){bootLeft=Math.min(bootLeft,x);bootRight=Math.max(bootRight,x);}}
  const anchor=(bootLeft+bootRight)/2,scale=2.08/1.5*1024/w,rw=Math.round(width*scale),rh=Math.round(height*scale),dx=Math.max(4,Math.min(508-rw,Math.round(256-(anchor-left)*scale))),dy=490-rh;
  if(dx<0||dx+rw>512||dy<0)throw Error('Cell overflow '+spec.name+' '+i+' '+[dx,dy,rw,rh]);
  layers.push({input:await sharp(isolated,{raw:{width,height,channels:4}}).resize(rw,rh).png().toBuffer(),left:i%4*512+dx,top:Math.floor(i/4)*512+dy});
  spec.registration.push({crop:[left,top,width,height],anchor,scale,destination:[dx,dy]});
  if([12,20,28].includes(i)){
   const flames=components(isolated,width,height,(d,k)=>d[k+3]>150&&d[k]>220&&d[k+1]>100&&d[k+2]<100).filter(p=>p.count>35).sort((a,b)=>a.x-b.x);
   if(!flames.length)throw Error('Missing throwing flame '+i);const tip=flames[0];
   hands[{12:'vault',20:'fan',28:'ribbon'}[i]]={x:+((dx+(tip.x+tip.w/2)*scale-256)*320*1.5/512).toFixed(2),y:+((dy+(tip.y+tip.h/2)*scale-490)*320*1.5/512).toFixed(2)};
  }
 }
 spec.output='public/arcade/sprites/bosses/harlequin/'+spec.name+'.webp';
 await sharp({create:{width:2048,height:4096,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(spec.output);console.log(spec.output);
 sockets.push(hands);
}
await fs.writeFile(path,JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile('src/components/arcade/adventure/actors/bosses/harlequinFluidSockets.js','// Measured release-flame centers; logical 320px actor size, facing left.\nexport const fluidSockets='+JSON.stringify(sockets)+';\n');
