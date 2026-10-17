import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
const dir='context/arcade/global-feedback/electric-filled-v2/';
const {data,info,labels,components}=await spriteComponents(dir+'source.png');
const frames=[],registration=[];
for(let frame=0;frame<4;frame++){
 const chosen=components.filter(q=>q.area>16&&Math.min(3,Math.floor(q.cx/info.width*4))===frame);
 const ids=new Set(chosen.map(q=>q.id)),left=Math.min(...chosen.map(q=>q.left)),top=Math.min(...chosen.map(q=>q.top));
 const right=Math.max(...chosen.map(q=>q.left+q.width)),bottom=Math.max(...chosen.map(q=>q.top+q.height));
 const width=right-left,height=bottom-top,pixels=Buffer.alloc(width*height*4);
 for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
  const i=y*info.width+x;if(!ids.has(labels[i]))continue;
  const o=((y-top)*width+x-left)*4;data.copy(pixels,o,i*4,i*4+4);if(pixels[o+3]>240)pixels[o+3]=255;
 }
 const scale=240/Math.max(width,height),w=Math.round(width*scale),h=Math.round(height*scale);
 const input=await sharp(pixels,{raw:{width,height,channels:4}}).resize(w,h).png().toBuffer();
 frames.push({input,left:frame*256+Math.round((256-w)/2),top:Math.round((256-h)/2)});
 registration.push({frame,source:{left,top,width,height},size:{w,h}});
}
await sharp({create:{width:1024,height:256,channels:4,background:'#00000000'}}).composite(frames).webp({lossless:true}).toFile('public/arcade/sprites/feedback/electric-fill-v2.webp');
await fs.writeFile(dir+'registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Packed four opaque electric energy cels.');
