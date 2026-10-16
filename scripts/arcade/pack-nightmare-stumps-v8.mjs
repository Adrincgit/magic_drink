import fs from 'node:fs';
import sharp from 'sharp';

const root='context/arcade/halloween-5-1/revision-8/';
const out='public/arcade/sprites/enemies/';
const registration={};
async function pack(name,rows,filename){
 const file=root+'sources/'+name+'.png';
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const boxes=[];
 for(let row=0;row<rows;row++)for(let col=0;col<4;col++){
  let l=info.width,t=info.height,r=-1,b=-1;
  for(let y=Math.round(row*info.height/rows);y<Math.round((row+1)*info.height/rows);y++)for(let x=Math.round(col*info.width/4);x<Math.round((col+1)*info.width/4);x++){
   if(data[(y*info.width+x)*4+3]>20){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}
  }
  if(r<l)throw Error('Empty sprite '+name+' '+row+','+col);
  boxes.push({left:l,top:t,width:r-l+1,height:b-t+1});
 }
 const scale=Math.min(210/boxes[0].height,244/Math.max(...boxes.map(q=>q.width)),242/Math.max(...boxes.map(q=>q.height)));
 const unchanged=new Set([0,1,8,9,16,17,18,19]);
 const layers=[];
 for(const [i,q]of boxes.entries()){
  const cellX=i%4*256,cellY=Math.floor(i/4)*256;
  if(name==='reactions'&&unchanged.has(i)){
   // Keep every intact pose exactly as before; only injured cels need the edit.
   layers.push({input:await sharp(out+'nightmare-zombie-reactions-v7.webp').extract({left:cellX,top:cellY,width:256,height:256}).png().toBuffer(),left:cellX,top:cellY});continue;
  }
  if(name==='reactions'&&i===15){
   // Finish the fall on the exact first crawling cel, including its exposed bone.
   layers.push({input:await sharp(out+'nightmare-injured-v8.webp').extract({left:0,top:512,width:256,height:256}).png().toBuffer(),left:cellX,top:cellY});continue;
  }
  const width=Math.round(q.width*scale),height=Math.round(q.height*scale);
  layers.push({input:await sharp(file).extract(q).resize(width,height).png().toBuffer(),left:cellX+Math.round((256-width)/2),top:cellY+250-height});
 }
 await sharp({create:{width:1024,height:rows*256,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true,alphaQuality:100}).toFile(out+filename);
 await sharp(out+filename).flatten({background:'#292d34'}).png().toFile(root+name+'-packed.png');
 registration[name]={scale,boxes,unchanged:name==='reactions'?[...unchanged]:[]};
}
await pack('injured',4,'nightmare-injured-v8.webp');
await pack('reactions',6,'nightmare-zombie-reactions-v8.webp');
fs.writeFileSync(root+'registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Packed visible stump bones; detached clothed limb atlas untouched.');
