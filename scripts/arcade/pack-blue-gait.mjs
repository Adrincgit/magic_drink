import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/blue-gait/',file=root+'sources/run-painted.png';
const meta=await sharp(file).metadata(),cells=[];
for(let i=0;i<8;i++){
 const left=Math.round(i%4*meta.width/4),top=Math.round(Math.floor(i/4)*meta.height/2);
 const width=Math.round((i%4+1)*meta.width/4)-left,height=Math.round((Math.floor(i/4)+1)*meta.height/2)-top;
 const {data,info}=await sharp(file).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=width,y0=height,x1=0,y1=0,noseX=0,noseCount=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const k=(y*width+x)*4,[r,g,b,a]=data.subarray(k,k+4);
  if(a>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  if(a>180&&x<width*.43&&y<height*.6&&r>140&&g<90&&b<90&&r>g*1.7){noseX+=x;noseCount++;}
 }
 if(!noseCount)throw new Error('Missing red nose in cel '+i);
 cells.push({data,info,box:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1},noseX:noseX/noseCount});
}
const scale=Math.min(172/Math.max(...cells.map(c=>c.box.width)),150/Math.max(...cells.map(c=>c.box.height))),layers=[],registration=[];
for(const [frame,c]of cells.entries()){
 const w=Math.round(c.box.width*scale),h=Math.round(c.box.height*scale),x=Math.round(68-(c.noseX-c.box.left)*scale),y=250-h;
 if(x<4||x+w>252)throw new Error('Run cel crosses its gutter: '+frame);
 const input=await sharp(c.data,{raw:c.info}).extract(c.box).resize(w,h).png().toBuffer();
 layers.push({input,left:frame%4*256+x,top:Math.floor(frame/4)*256+y});
 registration.push({frame,x,y,w,h,noseX:68,soleY:250,scale});
}
await sharp({create:{width:1024,height:512,channels:4,background:'#00000000'}}).composite(layers).webp({quality:97,alphaQuality:100}).toFile('public/arcade/sprites/enemies/acrobat-run-fluid.webp');
fs.writeFileSync(root+'run-registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Packed eight distinct run cels at one scale, registered noses and soles.');
