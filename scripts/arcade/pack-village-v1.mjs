import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='context/arcade/village-5-2',out='public/arcade';
await fs.mkdir(out+'/maps/village',{recursive:true});
const cell=256,registration={};
for(const key of ['villagers','witch','pumpkin','houses','decor']){
 const source=`${root}/sources/${key==='pumpkin'?'pumpkin-head':key}.png`;
 const input=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const {data,info:{width:w,height:h}}=input,scenery=['houses','decor'].includes(key),rows=scenery?2:6;
 const alpha=(x,y)=>data[(y*w+x)*4+3];
 const cuts=[0];
 for(let row=1;row<rows;row++){
  const ideal=Math.round(row*h/rows),range=Math.floor(h/rows*.16);let best=ideal,score=Infinity;
  for(let y=ideal-range;y<=ideal+range;y++){let n=0;for(let x=0;x<w;x++)if(alpha(x,y)>16)n++;const v=n+Math.abs(y-ideal)*.005;if(v<score){score=v;best=y;}}
  cuts.push(best);
 }cuts.push(h);
 if(key==='pumpkin')cuts.splice(0,cuts.length,0,216,426,624,806,1002,h);
 const frames=[];
 const columns=Array.from({length:rows},(_,row)=>{
  const xs=[0];for(let col=1;col<4;col++){
   const ideal=Math.round(col*w/4);let best=ideal,score=Infinity;
   const range=key==='decor'?.43:.28;
   if(scenery)for(let x=ideal-Math.floor(w/4*range);x<=ideal+w/4*range;x++){let n=0;for(let y=cuts[row];y<cuts[row+1];y++)if(alpha(x,y)>40)n++;const v=n+Math.abs(x-ideal)*.005;if(v<score){score=v;best=x;}}
   xs.push(best);
  }return[...xs,w];
 });
 for(let frame=0;frame<4*rows;frame++){
  const col=frame%4,row=Math.floor(frame/4),left=columns[row][col],right=columns[row][col+1];let x0=right,y0=cuts[row+1],x1=left,y1=cuts[row];
  for(let y=cuts[row];y<cuts[row+1];y++)for(let x=left;x<right;x++)if(alpha(x,y)>20){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  if(x1<=x0)throw Error('Empty '+key+frame);
  frames.push({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1});
 }
 const scale=scenery?null:Math.min(224/Math.max(...frames.slice(0,8).map(q=>q.height)),238/Math.max(...frames.map(q=>q.width)));
 const composite=[];
 for(let frame=0;frame<frames.length;frame++){
  const box=frames[frame],k=scale??Math.min(242/box.width,238/box.height),width=Math.min(248,Math.round(box.width*k)),height=Math.min(244,Math.round(box.height*k));
  const buf=await sharp(source).extract(box).resize(width,height).png().toBuffer();
  composite.push({input:buf,left:frame%4*cell+Math.round((cell-width)/2),top:Math.floor(frame/4)*cell+250-height});
 }
 const path=`${out}/${scenery?'maps/village':'sprites/enemies'}/village-${key}-v1.webp`;
 await sharp({create:{width:1024,height:rows*cell,channels:4,background:'#00000000'}}).composite(composite).webp({lossless:true}).toFile(path);
 await sharp(path).resize({width:800}).flatten({background:'#292d34'}).png().toFile(`${root}/${key}-preview.png`);
 registration[key]={cuts,columns,frames,scale,path};
}
for(const key of ['panorama','street'])await sharp(`${root}/sources/${key}.png`).webp({quality:91}).toFile(`${out}/maps/village/${key}-v1.webp`);
await fs.writeFile(`${root}/registration.json`,JSON.stringify(registration,null,2));
console.log('Packed village cels and scenery.');
