import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/tent-motion/',registration=[];
for(const [name,out,maxW,maxH,nose]of [
 ['meadow','public/arcade/sprites/props/outpost-wind-painted.webp',226,232,null],
 ['juggler','public/arcade/sprites/enemies/juggler-walk-painted.webp',196,210,100],
]){
 const file=root+'sources/'+name+'.png',meta=await sharp(file).metadata(),cells=[];
 for(let i=0;i<8;i++){
  const sourceFrame=name==='meadow'?[0,1,2,1,4,5,6,5][i]:i;
  const left=Math.round(sourceFrame%4*meta.width/4),top=Math.round(Math.floor(sourceFrame/4)*meta.height/2),width=Math.round((sourceFrame%4+1)*meta.width/4)-left,height=Math.round((Math.floor(sourceFrame/4)+1)*meta.height/2)-top;
  const {data,info}=await sharp(file).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=width,y0=height,x1=0,y1=0,noseSum=0,noseN=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const k=(y*width+x)*4,[r,g,b,a]=data.subarray(k,k+4);
   if(a>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
   if(nose!==null&&a>180&&x<width*.5&&y<height*.55&&r>150&&g<75&&b<75){noseSum+=x;noseN++;}
  }
  cells.push({data,info,sourceFrame,box:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1},noseX:noseN?noseSum/noseN:null});
 }
 const scale=Math.min(maxW/Math.max(...cells.map(c=>c.box.width)),maxH/Math.max(...cells.map(c=>c.box.height))),layers=[];
 for(const [frame,c]of cells.entries()){
  const w=Math.round(c.box.width*scale),h=Math.round(c.box.height*scale),x=nose===null?Math.round((256-w)/2):Math.round(nose-(c.noseX-c.box.left)*scale),y=250-h;
  if(x<3||x+w>253)throw new Error('Cel crosses its gutter: '+name+' '+frame);
  const input=await sharp(c.data,{raw:c.info}).extract(c.box).resize(w,h).png().toBuffer();layers.push({input,left:frame%4*256+x,top:Math.floor(frame/4)*256+y});
  registration.push({name,frame,sourceFrame:c.sourceFrame,x,y,w,h,scale,baseline:250});
 }
 await sharp({create:{width:1024,height:512,channels:4,background:'#00000000'}}).composite(layers).webp({quality:97,alphaQuality:100}).toFile(out);console.log(name,out);
}
// This repair keeps the existing rectangular cell geometry. Only encoding is
// changed; opaque doorway darkness is part of the generated tent artwork.
const camp=await sharp(root+'sources/camp.png').metadata();
if(camp.width!==2048||camp.height!==768)throw new Error('Camp source changed its registered cell geometry');
await sharp(root+'sources/camp.png').webp({quality:97,alphaQuality:100}).toFile('public/arcade/maps/circus/camp-wind-interior.webp');
fs.writeFileSync(root+'registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Camp doorway repair encoded with original cell positions.');
