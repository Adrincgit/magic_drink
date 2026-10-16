import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/halloween-5-1/revision-5/',out='public/arcade/',registration={};
async function pixels(file){return sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});}
function box(data,info,l,t,r,b){
 let x0=r,y0=b,x1=l,y1=t;
 for(let y=t;y<b;y++)for(let x=l;x<r;x++)if(data[(y*info.width+x)*4+3]>16){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 return{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1};
}
function gutter(counts,at,radius){
 const gaps=[];let start=null;
 for(let i=Math.round(at-radius);i<=Math.round(at+radius);i++){
  if(!counts[i]&&start===null)start=i;
  if(counts[i]&&start!==null){gaps.push([start,i-1]);start=null;}
 }
 const g=gaps.sort((a,b)=>Math.abs((a[0]+a[1])/2-at)-Math.abs((b[0]+b[1])/2-at))[0];
 if(!g){const candidates=Array.from({length:Math.round(radius*2)},(_,i)=>Math.round(at-radius)+i);return candidates.sort((a,b)=>counts[a]-counts[b]||Math.abs(a-at)-Math.abs(b-at))[0];}return Math.round((g[0]+g[1])/2);
}
async function atlas(name,cols,rowHints,cell,output){
 const file=root+'sources/'+name+'.png',{data,info}=await pixels(file),counts=Array(info.height).fill(0);
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80)counts[y]++;
 const rows=[0,...rowHints.map(v=>gutter(counts,v*info.height,info.height*.045)),info.height],boxes=[];
 for(let j=0;j<rows.length-1;j++){
  const cc=Array(info.width).fill(0);for(let y=rows[j];y<rows[j+1];y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80)cc[x]++;
  const cuts=[0,...Array.from({length:cols-1},(_,i)=>gutter(cc,(i+1)*info.width/cols,info.width*.035)),info.width];
  for(let i=0;i<cols;i++)boxes.push(box(data,info,cuts[i],rows[j],cuts[i+1],rows[j+1]));
 }
 const scale=name==='conversion'?210/boxes.at(-1).height:480/Math.max(...boxes.map(q=>q.width)),layers=[];
 registration[name]=[];
 for(let i=0;i<boxes.length;i++){
  const q=boxes[name==='conversion'?[0,1,2,4,5,6,7,8,9,10,10,11][i]:i===6?5:i];
  const k=name==='conversion'?scale*(.77+.23*Math.min(1,i/9)):scale,w=Math.round(q.width*k),h=Math.round(q.height*k),left=i%cols*cell+Math.round((cell-w)/2),top=(Math.floor(i/cols)+(name==='conversion'?1:0))*cell+cell-(cell===256?6:8)-h;
  if(w>cell||h>cell)throw Error('Frame does not fit: '+name+' '+i);
  if(name!=='conversion'||i!==11&&i!==0)layers.push({input:await sharp(file).extract(q).resize(w,h).png().toBuffer(),left,top});registration[name].push({source:q,left,top,w,h,scale:k});
 }
 // Exact registered end pose prevents an identity/scale pop into the existing
 // walk cycle. Both are rendered at the zombie's 148-unit size.
 if(name==='conversion'){
  layers.push({input:await sharp(out+'sprites/enemies/nightmare-zombie-walk.webp').extract({left:0,top:0,width:256,height:256}).png().toBuffer(),left:3*cell,top:3*cell});
  for(let i=0;i<5;i++)layers.push({input:await sharp(out+'sprites/enemies/red-clown-fall.webp').extract({left:(i===4?0:i)*256,top:i===4?512:0,width:256,height:256}).resize(218,218).png().toBuffer(),left:(i%4)*256+19,top:Math.floor(i/4)*256+37});
 }
 await sharp({create:{width:cols*cell,height:(rows.length-1+(name==='conversion'?1:0))*cell,channels:4,background:'#00000000'}}).composite(layers).webp({quality:98,alphaQuality:100}).toFile(out+output);
}
await atlas('conversion',4,[1/3,2/3],256,'sprites/enemies/nightmare-conversion-v5.webp');
await atlas('crypt',2,[.27,.535,.8],512,'maps/halloween/crypt-opening-v5.webp');
await sharp(root+'sources/gate.png').webp({quality:96,alphaQuality:100}).toFile(out+'maps/halloween/gate-oblique-v5.webp');
const fence=root+'sources/fence.png',{data,info}=await pixels(fence),q=box(data,info,0,0,info.width,info.height);
await sharp(fence).extract(q).resize({width:1600}).webp({quality:96,alphaQuality:100}).toFile(out+'maps/halloween/fence-bay-v5.webp');registration.fence=q;
fs.writeFileSync(root+'registration.json',JSON.stringify(registration,null,2)+'\n');
console.log(JSON.stringify(registration,null,2));
