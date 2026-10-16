import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='context/arcade/village-5-2/revision-2',registration={};
// Find actual transparent gutters rather than assuming the generated grid is exact.
for(const key of ['children','elders','neighbors','fire','plazas']){
 const source=`${root}/sources/${key}.png`,{data,info:{width:w,height:h}}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const rows=key==='plazas'?2:key==='fire'?4:6,alpha=(x,y)=>data[(y*w+x)*4+3];
 const cuts=[0];
 for(let row=1;row<rows;row++){
  const ideal=Math.round(row*h/rows),radius=Math.floor(h/rows*.2);let best=ideal,score=Infinity;
  for(let y=ideal-radius;y<=ideal+radius;y++){let n=0;for(let x=0;x<w;x++)if(alpha(x,y)>20)n++;const v=n+Math.abs(y-ideal)*.005;if(v<score){score=v;best=y;}}
  cuts.push(best);
 }cuts.push(h);
 const columns=Array.from({length:rows},(_,row)=>{
  const xs=[0];for(let col=1;col<4;col++){
   const ideal=Math.round(col*w/4),radius=Math.floor(w/4*.3);let best=ideal,score=Infinity;
   for(let x=ideal-radius;x<=ideal+radius;x++){let n=0;for(let y=cuts[row];y<cuts[row+1];y++)if(alpha(x,y)>20)n++;const v=n+Math.abs(x-ideal)*.005;if(v<score){score=v;best=x;}}
   xs.push(best);
  }return [...xs,w];
 });
 const frames=[];
 for(let i=0;i<rows*4;i++){
  const row=Math.floor(i/4),col=i%4,left=columns[row][col],right=columns[row][col+1];let x0=right,y0=cuts[row+1],x1=left,y1=cuts[row];
  for(let y=cuts[row];y<cuts[row+1];y++)for(let x=left;x<right;x++)if(alpha(x,y)>20){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  if(x1<=x0)throw Error(`Empty frame ${key}:${i}`);frames.push({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1});
 }
 const composite=[];
 for(let i=0;i<frames.length;i++){
  const box=frames[i],base=Math.floor(i/12)*12,walk=frames.slice(base,base+8),group=key==='fire'?frames.slice(i<8?0:i<12?8:12,i<8?8:i<12?12:16):frames.slice(base,base+12);
  const scale=key==='plazas'?Math.min(242/box.width,238/box.height):key==='fire'?Math.min(224/Math.max(...group.map(q=>q.width)),218/Math.max(...group.map(q=>q.height))):Math.min(224/Math.max(...walk.map(q=>q.height)),240/Math.max(...group.map(q=>q.width)),242/Math.max(...group.map(q=>q.height)));
  const width=Math.round(box.width*scale),height=Math.round(box.height*scale),fx=key==='fire';
  composite.push({input:await sharp(source).extract(box).resize(width,height).png().toBuffer(),left:i%4*256+(fx&&i<8?238-width:Math.round((256-width)/2)),top:Math.floor(i/4)*256+(fx?Math.round((256-height)/2):250-height)});
 }
 const path=`public/arcade/${key==='plazas'?'maps/village':'sprites/enemies'}/village-${key}-v2.webp`;
 await sharp({create:{width:1024,height:rows*256,channels:4,background:'#00000000'}}).composite(composite).webp({lossless:true}).toFile(path);
 await sharp(path).resize({width:800}).flatten({background:'#292d34'}).png().toFile(`${root}/${key}-preview.png`);
 registration[key]={path,cuts,columns,frames};
}
for(const key of ['town-bank','orchard-bank'])await sharp(`${root}/sources/${key}.png`).webp({quality:91,alphaQuality:100}).toFile(`public/arcade/maps/village/${key}-v2.webp`);
await fs.writeFile(`${root}/registration.json`,JSON.stringify(registration,null,2));
console.log('Packed revision 2: six new villagers, animated fire, plazas and two grounded parallax banks.');
