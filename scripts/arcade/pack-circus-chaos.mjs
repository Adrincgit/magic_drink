import fs from 'node:fs/promises';
import sharp from 'sharp';
const file='context/arcade/grand-harlequin/chaos-art.json';
const spec=JSON.parse(await fs.readFile(file,'utf8'));
const {data,info}=await sharp(spec.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const cells=[];
for(let i=0;i<24;i++){
 const row=Math.floor(i/4),left=i%4*256,top=spec.rows[row],bottom=spec.rows[row+1];
 let l=256,t=bottom-top,r=0,b=0;
 for(let y=top;y<bottom;y++)for(let x=left;x<left+256;x++)if(data[(y*info.width+x)*4+3]>8){l=Math.min(l,x-left);r=Math.max(r,x-left);t=Math.min(t,y-top);b=Math.max(b,y-top);}
 cells.push({left:left+l,top:top+t,width:r-l+1,height:b-t+1,offsetTop:t,row});
}
const layers=[];spec.registration=[];
spec.drawingOrder=[0,1,2,3,4,5,6,7,8,9,12,10,13,11,14,15,16,17,18,19,20,21,22,23];
for(let group=0;group<3;group++){
 const frames=spec.drawingOrder.slice(group*8,group*8+8).map(i=>cells[i]),scale=Math.min(352/Math.max(...frames.map(q=>q.width)),330/Math.max(...frames.map(q=>q.height)));
 for(let n=0;n<8;n++){
  const i=group*8+n,q=frames[n],rw=Math.round(q.width*scale),rh=Math.round(q.height*scale),dx=Math.round((384-rw)/2);
  // Register falling cloth at its centre. Grounded cloth uses the same scale
  // through disintegration; ash never grows to fill its cell.
  const baseline=group===1?(q.row===2?703:918):group===2?(q.row===4?1199:1514):0;
  const dy=group===0?Math.round((384-rh)/2):Math.round(350-(baseline-q.top)*scale);
  if(dy<0||dy+rh>384)throw Error('Frame overflow '+i);
  layers.push({input:await sharp(spec.source).extract({left:q.left,top:q.top,width:q.width,height:q.height}).resize(rw,rh).png().toBuffer(),left:i%4*384+dx,top:Math.floor(i/4)*384+dy});
  spec.registration.push({frame:i,sourceFrame:spec.drawingOrder[i],crop:q,scale,destination:[dx,dy,rw,rh]});
 }
}
await sharp({create:{width:1536,height:2304,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(spec.output);
await fs.writeFile(file,JSON.stringify(spec,null,2)+'\n');
console.log('Packed 8 falling-cloth, 8 disintegration and 8 fire-aura drawings.');
