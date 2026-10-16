import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/barge-rebuild/sources/',file=root+'blue.png',meta=await sharp(file).metadata();
const layers=[];
for(let i=0;i<8;i++){
 let input,left=i%4*256,top=Math.floor(i/4)*256;
 if(i!==1&&i!==2)input=await sharp(root+'blue-reference.webp').extract({left,top,width:256,height:256}).png().toBuffer();
 else{
  const x=Math.round(i*meta.width/4),right=Math.round((i+1)*meta.width/4),height=Math.round(meta.height/2);
  const {data,info}=await sharp(file).extract({left:x,top:0,width:right-x,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=info.width,y0=info.height,x1=0,y1=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  const box={left:x0,top:y0,width:x1-x0+1,height:y1-y0+1},scale=Math.min(172/box.width,150/box.height),w=Math.round(box.width*scale),h=Math.round(box.height*scale);
  input=await sharp(data,{raw:info}).extract(box).resize(w,h).png().toBuffer();left+=Math.round((256-w)/2);top+=246-h;
 }
 layers.push({input,left,top});
}
await sharp({create:{width:1024,height:512,channels:4,background:'#00000000'}}).composite(layers).webp({quality:97,alphaQuality:100}).toFile('public/arcade/sprites/enemies/acrobat-air-painted.webp');
console.log('Updated only the two blue launch poses.');
