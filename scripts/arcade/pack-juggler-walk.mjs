import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/tent-motion/',file=root+'sources/juggler-fluid.png',meta=await sharp(file).metadata(),cells=[];
for(let i=0;i<12;i++){
 const left=Math.round(i%4*meta.width/4),top=Math.round(Math.floor(i/4)*meta.height/3),width=Math.round((i%4+1)*meta.width/4)-left,height=Math.round((Math.floor(i/4)+1)*meta.height/3)-top;
 const {data,info}=await sharp(file).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=width,y0=height,x1=0,y1=0,noseSum=0,noseN=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const k=(y*width+x)*4,[r,g,b,a]=data.subarray(k,k+4);
  if(a>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  if(a>180&&x<width*.5&&y<height*.6&&r>150&&g<75&&b<75){noseSum+=x;noseN++;}
 }
 if(!noseN)throw new Error('Missing nose in cel '+i);
 cells.push({data,info,box:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1},noseX:noseSum/noseN});
}
const scale=Math.min(196/Math.max(...cells.map(c=>c.box.width)),210/Math.max(...cells.map(c=>c.box.height))),layers=[],registration=[];
for(const [frame,c]of cells.entries()){
 const w=Math.round(c.box.width*scale),h=Math.round(c.box.height*scale),x=Math.round(100-(c.noseX-c.box.left)*scale),y=250-h;
 if(x<3||x+w>253)throw new Error('Cel crosses its gutter: '+frame);
 const input=await sharp(c.data,{raw:c.info}).extract(c.box).resize(w,h).png().toBuffer();layers.push({input,left:frame%4*256+x,top:Math.floor(frame/4)*256+y});registration.push({frame,x,y,w,h,scale,noseX:100,baseline:250});
}
await sharp({create:{width:1024,height:768,channels:4,background:'#00000000'}}).composite(layers).webp({quality:97,alphaQuality:100}).toFile('public/arcade/sprites/enemies/juggler-walk-fluid.webp');
fs.writeFileSync(root+'juggler-fluid-registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Packed twelve registered walking cels.');
