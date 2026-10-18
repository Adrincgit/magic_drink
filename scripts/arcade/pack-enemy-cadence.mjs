import fs from 'node:fs';
import sharp from 'sharp';
const dir='context/arcade/enemy-cadence/';
const kind=process.argv[3]||'tall';
const spec={tall:['enemies/nightmare-tall','enemies/nightmare-tall-walk-v1'],pumpkin:['enemies/village-pumpkin-clean-v7','enemies/village-pumpkin-walk-v1'],witch:['enemies/village-witch-ground-v7','enemies/village-witch-walk-v1'],harvester:['bosses/harvester-combat','bosses/harvester-walk-v1']}[kind];
if(!spec)throw Error('Unknown actor: '+kind);
const name=kind+'-walk',source=process.argv[2]||dir+name+'-source.png';
fs.mkdirSync(dir,{recursive:true});
if(source!==dir+name+'-source.png')fs.copyFileSync(source,dir+name+'-source.png');
const img=sharp(dir+name+'-source.png'),meta=await img.metadata();
const bounds=async buffer=>{
 const {data,info}=await sharp(buffer).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=info.width,y0=info.height,x1=0,y1=0,faceX=0,faceN=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const i=(y*info.width+x)*4;if(data[i+3]<40)continue;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 for(let y=y0;y<y0+(y1-y0)*(kind==='tall'?.43:.55);y++)for(let x=x0;x<=x1;x++){const i=(y*info.width+x)*4,[r,g,b,a]=data.subarray(i,i+4),face=kind==='tall'?Math.min(r,g,b)>185&&Math.max(r,g,b)-Math.min(r,g,b)<55:kind==='pumpkin'?g>r+30&&b>r+30:g>r*1.2&&g>b*1.05;if(a>180&&face){faceX+=x;faceN++;}}
 return{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,faceX:faceN?faceX/faceN:(x0+x1)/2};
};
const cells=[];
for(let i=0;i<12;i++){
 const x=Math.round(i%4*meta.width/4),y=Math.round(Math.floor(i/4)*meta.height/3);
 const buffer=await sharp(dir+name+'-source.png').extract({left:x,top:y,width:Math.round((i%4+1)*meta.width/4)-x,height:Math.round((Math.floor(i/4)+1)*meta.height/3)-y}).png().toBuffer();
 cells.push({buffer,b:await bounds(buffer)});
}
const original=await sharp('public/arcade/sprites/'+spec[0]+'.webp').extract({left:0,top:0,width:256,height:256}).png().toBuffer();
const ref=await bounds(original),scale=Math.min(ref.h/Math.max(...cells.map(q=>q.b.h)),(ref.faceX-3)/Math.max(...cells.map(q=>q.b.faceX-q.b.x)),(253-ref.faceX)/Math.max(...cells.map(q=>q.b.w-q.b.faceX+q.b.x))),registration=[],pieces=[];
for(let i=0;i<12;i++){
 const q=cells[i],w=Math.round(q.b.w*scale),h=Math.round(q.b.h*scale),left=Math.round(ref.faceX-(q.b.faceX-q.b.x)*scale),top=250-h;
 if(left<2||left+w>254||top<2)throw Error('Cel exceeds its safe area: '+i);
 pieces.push({input:await sharp(q.buffer).extract({left:q.b.x,top:q.b.y,width:q.b.w,height:q.b.h}).resize(w,h).png().toBuffer(),left:i%4*256+left,top:Math.floor(i/4)*256+top});
 registration.push({frame:i,source:q.b,scale,left,top,w,h,baseline:250,faceX:ref.faceX});
}
await sharp({create:{width:1024,height:768,channels:4,background:'#00000000'}}).composite(pieces).webp({lossless:true}).toFile('public/arcade/sprites/'+spec[1]+'.webp');
fs.writeFileSync(dir+name+'-registration.json',JSON.stringify(registration,null,2)+'\n');
console.log(kind+': packed 12 full-body cels at one scale with face registration and sole baseline 250.');
