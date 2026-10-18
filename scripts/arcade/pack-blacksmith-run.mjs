import fs from 'node:fs/promises';
import sharp from 'sharp';

const dir='context/arcade/blacksmith-run/',config=JSON.parse(await fs.readFile(dir+'selection.json','utf8'));
async function bounds(buffer){
 const {data,info}=await sharp(buffer).ensureAlpha().raw().toBuffer({resolveWithObject:true});let x0=info.width,y0=info.height,x1=0,y1=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 let headX=0,weight=0;
 for(let y=y0;y<y0+(y1-y0)*.23;y++)for(let x=x0;x<=x1;x++){
  const i=(y*info.width+x)*4,[r,g,b,a]=data.subarray(i,i+4);if(a>160&&r>g*1.15&&g>b*1.1&&g<160){headX+=x;weight++;}
 }
 return{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,headX:weight?headX/weight:x0+(x1-x0)*.25};
}
const sources=await Promise.all(config.sources.map(async source=>{const path=dir+'sources/'+source.file;return{...source,path,meta:await sharp(path).metadata()};})),frames=[];
for(const f of config.frames){
 const source=sources[f.source],{width,height}=source.meta,col=f.frame%source.cols,row=Math.floor(f.frame/source.cols);
 const rect={left:Math.round(col*width/source.cols),top:Math.round(row*height/source.rows),width:Math.round((col+1)*width/source.cols)-Math.round(col*width/source.cols),height:Math.round((row+1)*height/source.rows)-Math.round(row*height/source.rows)};
 const buffer=await sharp(source.path).extract(rect).png().toBuffer();frames.push({...f,source,rect,buffer,b:await bounds(buffer)});
}
const reference=await sharp(dir+'before.webp').extract({left:0,top:0,width:256,height:256}).png().toBuffer(),ref=await bounds(reference),layers=[],registration=[];
for(const [i,f]of frames.entries()){
 const scale=f.source.scale,w=Math.round(f.b.w*scale),h=Math.round(f.b.h*scale),headX=config.faceRight?256-ref.headX:ref.headX,left=Math.round(headX-(f.b.headX-f.b.x)*scale),top=250-h-(f.lift||0);
 if(left<3||left+w>253||top<3||top+h>251)throw Error('Cel exceeds safe area: '+i+' '+JSON.stringify({left,top,w,h}));
 layers.push({input:await sharp(f.buffer).extract({left:f.b.x,top:f.b.y,width:f.b.w,height:f.b.h}).resize(w,h).png().toBuffer(),left:i%4*256+left,top:Math.floor(i/4)*256+top});
 registration.push({frame:i,file:f.source.file,sourceFrame:f.frame,source:f.rect,bounds:f.b,scale,left,top,w,h,lift:f.lift||0});
}
if(frames.length!==12)throw Error('Expected twelve complete drawings');
await sharp({create:{width:1024,height:768,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile('public/arcade/sprites/enemies/village-blacksmith-run-v9.webp');
await fs.writeFile(dir+'registration.json',JSON.stringify(registration,null,2)+'\n');console.log('Packed twelve blacksmith poses with face registration and ground contacts.');
