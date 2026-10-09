import fs from 'node:fs/promises';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
const file='context/arcade/grand-harlequin/fire-show-art.json',m=JSON.parse(await fs.readFile(file,'utf8'));
for(const [key,name]of [['sprint','sprint'],['sprintMid','sprint-mid'],['sprintFinal','sprint-final'],['arrival','arrival']]){
 const spec=m.assets[key],{data,info:{width:w,height:h}}=await sharp(spec.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const figures=components(data,w,h,(d,k)=>d[k+3]>100).filter(q=>q.count>2500).sort((a,b)=>a.y+a.h/2-b.y-b.h/2);
 if(figures.length!==12)throw Error(key+' expected 12 figures, got '+figures.length);
 const ordered=Array.from({length:3},(_,r)=>figures.slice(r*4,r*4+4).sort((a,b)=>a.x-b.x)).flat(),layers=[];spec.registration=[];
 for(const [i,f]of ordered.entries()){
  const seen=new Uint8Array(w*h),queue=[f.seed];seen[f.seed]=1;
  for(let n=0;n<queue.length;n++){const j=queue[n],x=j%w,y=Math.floor(j/w);for(const k of [x?j-1:-1,x<w-1?j+1:-1,y?j-w:-1,y<h-1?j+w:-1])if(k>=0&&!seen[k]&&data[k*4+3]>8){seen[k]=1;queue.push(k);}}
  let l=w,t=h,r=0,b=0;for(const j of queue){l=Math.min(l,j%w);r=Math.max(r,j%w);t=Math.min(t,Math.floor(j/w));b=Math.max(b,Math.floor(j/w));}
  const width=r-l+1,height=b-t+1,isolated=Buffer.alloc(width*height*4),boots=[];
  for(const j of queue){const x=j%w,y=Math.floor(j/w),k=j*4;data.copy(isolated,((y-t)*width+x-l)*4,k,k+4);if(y>f.y+f.h*.84&&data[k+3]>150&&data[k]<75&&data[k+1]<75&&data[k+2]<85)boots.push(x);}
  const anchor=boots.length?(Math.min(...boots)+Math.max(...boots))/2:l+width*.5,scale=key==='arrival'?1.045:1.01;
  const rw=Math.round(width*scale),rh=Math.round(height*scale),dx=Math.round(256-(anchor-l)*scale),dy=490-rh;
  if(dx<2||dx+rw>510||dy<2)throw Error(key+' overflow '+i+' '+[dx,dy,rw,rh]);
  layers.push({input:await sharp(isolated,{raw:{width,height,channels:4}}).resize(rw,rh).png().toBuffer(),left:i%4*512+dx,top:Math.floor(i/4)*512+dy});
  spec.registration.push({crop:[l,t,width,height],anchor,scale,destination:[dx,dy]});
 }
 spec.output='public/arcade/sprites/bosses/harlequin/'+name+'.webp';
 await sharp({create:{width:2048,height:1536,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(spec.output);
}
const spec=m.assets.flameShow,layers=[],ys=[0,193,384,545,715,860,1024];spec.registration=[];
for(let i=0;i<24;i++){
 const row=Math.floor(i/4),crop={left:i%4*384,top:ys[row],width:384,height:ys[row+1]-ys[row]};
 const input=await sharp(spec.source).extract(crop).resize(376,crop.height).png().toBuffer();
 // Align contact, burning wood and heated wood at one common floor pixel.
 const base=[175,355,513,670,799,952][row]-ys[row],dy=205-base;
 layers.push({input,left:i%4*384+4,top:row*256+dy});spec.registration.push({crop,base,dy});
}
spec.output='public/arcade/sprites/effects/painted-duel/fire-show.webp';
await sharp({create:{width:1536,height:1536,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(spec.output);
await fs.writeFile(file,JSON.stringify(m,null,2)+'\n');console.log('Packed four acting atlases and 24 fire effects.');
