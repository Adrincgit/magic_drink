import fs from 'node:fs/promises';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
const path='context/arcade/grand-harlequin/fire-acting-art.json';
const manifest=JSON.parse(await fs.readFile(path,'utf8'));
async function pack(spec,cols,rows,size,scale,anchors,output){
 const source=manifest.sourceDirectory+'/'+spec.source;
 const {data,info:{width:w,height:h}}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const figures=components(data,w,h,(d,k)=>d[k+3]>128).filter(f=>f.count>5000).sort((a,b)=>(a.y+a.h/2)-(b.y+b.h/2));
 if(figures.length!==cols*rows)throw Error('Wrong figure count '+source+': '+figures.length);
 const groups=Array.from({length:rows},(_,r)=>figures.slice(r*cols,(r+1)*cols).sort((a,b)=>a.x-b.x));
 const layers=[],registration=[];
 for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){
  const f=groups[r][col],pad=5,left=Math.max(0,f.x-pad),top=Math.max(0,f.y-pad),width=Math.min(w,f.x+f.w+pad)-left,height=Math.min(h,f.y+f.h+pad)-top;
  let lo=w,hi=0;for(let y=f.y+f.h-12;y<f.y+f.h;y++)for(let x=f.x;x<f.x+f.w;x++)if(data[(y*w+x)*4+3]>180){lo=Math.min(lo,x);hi=Math.max(hi,x);}
  const anchor=anchors?.[r*cols+col]??(lo+hi)/2,foot=f.y+f.h-1;
  const rw=Math.round(width*scale),rh=Math.round(height*scale),dx=Math.round(size.w/2-(anchor-left)*scale),dy=Math.round(size.foot-(foot-top)*scale);
  if(dx<0||dy<0||dx+rw>size.w||dy+rh>size.h)throw Error('Outside cell '+output+' '+r+','+col+': '+[dx,dy,rw,rh]);
  // Some limbs interleave the nominal rows/columns. A bounding rectangle alone
  // can capture the neighbour's glove: isolate this connected silhouette first.
  const seen=new Uint8Array(w*h),queue=[f.seed];seen[f.seed]=1;
  for(let n=0;n<queue.length;n++){const j=queue[n],x=j%w,y=Math.floor(j/w);for(const k of [x?j-1:-1,x<w-1?j+1:-1,y?j-w:-1,y<h-1?j+w:-1])if(k>=0&&!seen[k]&&data[k*4+3]>8){seen[k]=1;queue.push(k);}}
  const isolated=Buffer.alloc(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(top+y)*w+left+x;if(seen[i])data.copy(isolated,(y*width+x)*4,i*4,i*4+4);}
  const input=await sharp(isolated,{raw:{width,height,channels:4}}).resize(rw,rh).png().toBuffer();
  layers.push({input,left:col*size.w+dx,top:r*size.h+dy});registration.push({row:r,col,crop:{left,top,width,height},anchor:[anchor,foot],destination:[dx,dy],scale});
 }
 await sharp({create:{width:cols*size.w,height:rows*size.h,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(output);
 spec.output=output;spec.registration=registration;console.log(output);return registration;
}
const anchors=[118,377,634,888,107,384,655,920,103,390,644,918,134,388,642,912,120,393,657,909,109,391,639,904];
for(const [key,name]of [['boss','motion'],['mid','motion-mid'],['final','motion-final']])await pack(manifest[key],4,6,{w:512,h:512,foot:490},1.5,anchors,'public/arcade/sprites/bosses/harlequin/'+name+'.webp');
await pack(manifest.actions,4,5,{w:512,h:512,foot:490},1.4,[126,390,647,898,115,365,651,899,111,397,647,901,139,378,644,891,145,410,653,901],'public/arcade/sprites/bosses/harlequin/fire-actions.webp');
await pack(manifest.actionsMid,4,5,{w:512,h:512,foot:490},1.4,[126,390,647,898,115,365,651,899,111,397,647,901,139,378,644,891,145,410,653,901],'public/arcade/sprites/bosses/harlequin/fire-actions-mid.webp');
await pack(manifest.hexy,3,4,{w:384,h:448,foot:432},1,null,'public/arcade/sprites/ui/hexy-clash-full.webp');
// Identical drawings for gameplay and portraits, with separate frame geometry.
for(const [name,input]of [['hexy','public/arcade/sprites/ui/hexy-clash-full.webp'],['harlequin','public/arcade/sprites/bosses/harlequin/clash-full.webp']]){
 const cell=name==='hexy'?320:512,foot=name==='hexy'?300:490,k=name==='hexy'?.78:1.15,layers=[],tips=[];
 for(let row=0;row<4;row++)for(let col=0;col<3;col++){
  const crop={left:col*384,top:row*448,width:384,height:448};
  // Crop transparent head margin before resizing so no cell bleeds into the next.
  crop.top+=50;crop.height-=50;
  const width=Math.round(crop.width*k),height=Math.round(crop.height*k),x=Math.round(cell/2-192*k),y=Math.round(foot-382*k);
  const buffer=await sharp(input).extract(crop).resize(width,height).png().toBuffer(),i=row*3+col;
  if(y<0||y+height>cell||x<0||x+width>cell)throw Error('Casting registration overflow');
  layers.push({input:buffer,left:i%4*cell+x,top:Math.floor(i/4)*cell+y});
  if(name==='hexy'){
   const {data,info}=await sharp(buffer).raw().toBuffer({resolveWithObject:true});
   const gold=components(data,info.width,info.height,(d,j)=>d[j+3]>180&&d[j]>210&&d[j+1]>150&&d[j+2]<100).filter(f=>f.count>30).sort((a,b)=>(b.x+b.w/2)-(a.x+a.w/2));
   if(!gold.length)throw Error('Missing wand star');const star=gold[0];tips.push({tip:[+(x+star.x+star.w/2).toFixed(2),+(y+star.y+star.h/2).toFixed(2)]});
  }
 }
 const output='public/arcade/sprites/'+(name==='hexy'?'hexy/super-cast':'bosses/harlequin/super-cast')+'.webp';
 await sharp({create:{width:cell*4,height:cell*3,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(output);console.log(output);
 if(name==='hexy')await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexySuperCastAtlas.js','// Measured star centers from the shared cinematic drawings.\nexport default '+JSON.stringify(tips)+';\n');
}
await fs.writeFile(path,JSON.stringify(manifest,null,2)+'\n');
