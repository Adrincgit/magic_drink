import fs from 'node:fs';
import sharp from 'sharp';

// Technical atlas packing only. All painted parts come from image_gen.
const root='context/arcade/juggler-gait/',output='public/arcade/sprites/enemies/';
const footX=[128,133.5,139,144.5,150,155.5,161,153,141,129,121,122.5];
const lift=[0,0,0,0,0,0,0,8,14,11,6,0],scale=.36,layers=[],registration=[];
const file=root+'sources/legs.png',meta=await sharp(file).metadata();
for(let frame=0;frame<12;frame++){
 const width=meta.width/4,height=meta.height/3;
 const {data,info}=await sharp(file).extract({left:frame%4*width,top:Math.floor(frame/4)*height,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=width,y0=height,x1=0,y1=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>160){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 // Register the ankle cuff, rather than the outline or a changing toe curl.
 let cuffX=0,n=0;
 for(let y=y1-85;y<y1-25;y++)for(let x=x0;x<=x1;x++){
  const k=(y*width+x)*4,[r,g,b,a]=data.subarray(k,k+4);
  if(a>180&&r>190&&g>160&&b>110){cuffX+=x;n++;}
 }
 if(!n)throw new Error('Missing cuff in leg '+frame);
 cuffX/=n;
 const w=Math.round((x1-x0+1)*scale),h=Math.round((y1-y0+1)*scale);
 const left=Math.round(footX[frame]-(cuffX-x0)*scale),top=250-lift[frame]-h;
 const input=await sharp(data,{raw:info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize(w,h).png().toBuffer();
 layers.push({input,left:frame%4*256+left,top:Math.floor(frame/4)*256+top});
 registration.push({frame,left,top,w,h,footX:footX[frame],lift:lift[frame],cuffX,scale});
}
await sharp({create:{width:1024,height:768,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(output+'juggler-leg-cycle.webp');
const body=root+'sources/torso.png',{data,info}=await sharp(body).ensureAlpha().raw().toBuffer({resolveWithObject:true});
let x0=info.width,y0=info.height,x1=0,y1=0,noseX=0,n=0;
for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
 const k=(y*info.width+x)*4,[r,g,b,a]=data.subarray(k,k+4);
 if(a>160){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 if(a>180&&x<info.width*.43&&y>info.height*.30&&y<info.height*.40&&r>150&&g<90&&b<80){noseX+=x;n++;}
}
const bodyScale=178/(y1-y0+1),w=Math.round((x1-x0+1)*bodyScale),h=178,left=Math.round(100-(noseX/n-x0)*bodyScale),top=40;
const torso=await sharp(data,{raw:info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize(w,h).png().toBuffer();
await sharp({create:{width:256,height:256,channels:4,background:'#00000000'}}).composite([{input:torso,left,top}]).webp({lossless:true}).toFile(output+'juggler-walk-torso.webp');
fs.writeFileSync(root+'registration.json',JSON.stringify({legs:registration,body:{left,top,w,h,bodyScale,noseX:100},footX,lift,farOffsetX:-16,phaseOffset:6},null,2)+'\n');
console.log('Packed painted leg cels and one registered torso; limb ownership is fixed at render time.');
