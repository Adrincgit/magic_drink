import fs from 'node:fs/promises';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
const file='context/arcade/grand-harlequin/inferno-art.json',m=JSON.parse(await fs.readFile(file,'utf8'));
for(const [key,name]of [['normal','inferno'],['mid','inferno-mid'],['final','inferno-final']]){
 const spec=m.assets[key],{data,info:{width:w,height:h}}=await sharp(spec.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const figures=components(data,w,h,(d,k)=>d[k+3]>100).filter(q=>q.count>2500).sort((a,b)=>a.y+a.h/2-b.y-b.h/2);
 if(figures.length!==24)throw Error(key+' expected 24 figures, got '+figures.length);
 const ordered=Array.from({length:6},(_,r)=>figures.slice(r*4,r*4+4).sort((a,b)=>a.x-b.x)).flat(),layers=[];
 // Standing body is registered once; raised fists never resize the body.
 const scale=310/ordered[0].h;spec.registration=[];
 for(const [i,f]of ordered.entries()){
  const seen=new Uint8Array(w*h),queue=[f.seed];seen[f.seed]=1;
  for(let n=0;n<queue.length;n++){const j=queue[n],x=j%w,y=Math.floor(j/w);for(const k of [x?j-1:-1,x<w-1?j+1:-1,y?j-w:-1,y<h-1?j+w:-1])if(k>=0&&!seen[k]&&data[k*4+3]>8){seen[k]=1;queue.push(k);}}
  let l=w,t=h,r=0,b=0;for(const j of queue){l=Math.min(l,j%w);r=Math.max(r,j%w);t=Math.min(t,Math.floor(j/w));b=Math.max(b,Math.floor(j/w));}
  const width=r-l+1,height=b-t+1,isolated=Buffer.alloc(width*height*4),boots=[];
  for(const j of queue){const x=j%w,y=Math.floor(j/w),k=j*4;data.copy(isolated,((y-t)*width+x-l)*4,k,k+4);if(y>f.y+f.h*.82&&data[k+3]>150&&data[k]<70&&data[k+1]<70&&data[k+2]<85)boots.push(x);}
  const anchor=boots.length?(Math.min(...boots)+Math.max(...boots))/2:l+width*.5;
  const rw=Math.round(width*scale),rh=Math.round(height*scale),dx=Math.round(256-(anchor-l)*scale),dy=490-rh;
  if(dx<2||dx+rw>510||dy<2)throw Error(key+' overflow '+i+' '+[dx,dy,rw,rh]);
  layers.push({input:await sharp(isolated,{raw:{width,height,channels:4}}).resize(rw,rh).png().toBuffer(),left:i%4*512+dx,top:Math.floor(i/4)*512+dy});
  spec.registration.push({crop:[l,t,width,height],anchor,scale,destination:[dx,dy]});
 }
 spec.output='public/arcade/sprites/bosses/harlequin/'+name+'.webp';
 await sharp({create:{width:2048,height:3072,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(spec.output);
}
const spec=m.assets.scene,{data,info:{width:w,height:h}}=await sharp(spec.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const layers=[];spec.registration=[];
// Native rows are not equal in height. Keep each fire's foot on the same line.
const ys=spec.rows||[0,Math.round(h*.32),Math.round(h*.535),Math.round(h*.758),h];
for(let i=0;i<16;i++){
 const row=Math.floor(i/4),left=Math.round(i%4*w/4),right=Math.round((i%4+1)*w/4),top=ys[row],bottom=ys[row+1];
 const cropped=await sharp(spec.source).extract({left,top,width:right-left,height:bottom-top}).png().toBuffer();
 const input=sharp(cropped).trim({threshold:8});
 const {data:raw,info}=await input.ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const ratio=Math.min(352/info.width,340/info.height),rw=Math.round(info.width*ratio),rh=Math.round(info.height*ratio),dx=Math.round((384-rw)/2),dy=350-rh;
 layers.push({input:await sharp(raw,{raw:info}).resize(rw,rh).png().toBuffer(),left:i%4*384+dx,top:row*384+dy});
 spec.registration.push({source:[left,top,right-left,bottom-top],destination:[dx,dy,rw,rh]});
}
spec.output='public/arcade/sprites/effects/painted-duel/inferno-scene.webp';
await sharp({create:{width:1536,height:1536,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(spec.output);
await fs.writeFile(file,JSON.stringify(m,null,2)+'\n');console.log('Packed 72 action drawings and 16 scene cells.');
