import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/halloween-5-1/revision-7/',out='public/arcade/',registration={};
function cut(counts,at,radius){let best=Math.round(at),score=Infinity;for(let i=Math.max(1,Math.floor(at-radius));i<Math.min(counts.length-1,at+radius);i++){const v=(counts[i-1]+counts[i]+counts[i+1])*100+Math.abs(i-at);if(v<score){score=v;best=i;}}return best;}
async function pack(name,cols,rows,cell,path){
 const file=root+'sources/'+(name==='spirits'?'spirits-round':name)+'.png',{data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true}),rc=Array(info.height).fill(0);
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80)rc[y]++;
 const hints=name==='injured'?[.29,.58,.79]:name==='reactions'?[244/1536,497/1536,747/1536,958/1536,1220/1536]:Array.from({length:rows-1},(_,i)=>(i+1)/rows);
 const ys=[0,...hints.map(v=>cut(rc,v*info.height,info.height/rows*.14)),info.height],boxes=[];
 for(let row=0;row<rows;row++){
  const cc=Array(info.width).fill(0);for(let y=ys[row];y<ys[row+1];y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80)cc[x]++;
  const xs=[0,...Array.from({length:cols-1},(_,i)=>cut(cc,(i+1)*info.width/cols,info.width/cols*.12)),info.width];
  for(let col=0;col<cols;col++){
   let l=info.width,t=info.height,r=-1,b=-1;for(let y=ys[row];y<ys[row+1];y++)for(let x=xs[col];x<xs[col+1];x++)if(data[(y*info.width+x)*4+3]>20){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
   if(r<l)throw Error('Empty '+name+' '+row+','+col);boxes.push({left:l,top:t,width:r-l+1,height:b-t+1});
  }
 }
 const scale=name==='crypt'?480/Math.max(...boxes.map(q=>q.width)):['reactions','injured'].includes(name)?Math.min(210/boxes[0].height,244/Math.max(...boxes.map(q=>q.width)),242/Math.max(...boxes.map(q=>q.height))):224/Math.max(...boxes.map(q=>Math.max(q.width,q.height))),layers=[];
 for(const [i,q]of boxes.entries()){
  if(name==='reactions'&&i===15){layers.push({input:await sharp(out+'sprites/enemies/nightmare-injured-v7.webp').extract({left:0,top:512,width:256,height:256}).png().toBuffer(),left:768,top:768});continue;}
  const w=Math.round(q.width*scale),h=Math.round(q.height*scale),left=i%cols*cell+Math.round((cell-w)/2),top=Math.floor(i/cols)*cell+(name==='spirits'?Math.round((cell-h)/2):Math.round(cell*250/256)-h);
  let source=sharp(file).extract(q);if(name==='limbs')source=source.flop(); // All engine actors face left in their source cels.
  layers.push({input:await source.resize(w,h).png().toBuffer(),left,top});
 }
 registration[name]={scale,boxes};await sharp({create:{width:cols*cell,height:rows*cell,channels:4,background:'#00000000'}}).composite(layers).webp({quality:98,alphaQuality:100}).toFile(out+path);
}
await pack('crypt',2,4,512,'maps/halloween/crypt-opening-v7.webp');
await pack('limbs',4,4,256,'sprites/enemies/nightmare-clothed-limbs-v7.webp');
await pack('injured',4,4,256,'sprites/enemies/nightmare-injured-v7.webp');
await pack('reactions',4,6,256,'sprites/enemies/nightmare-zombie-reactions-v7.webp');
await pack('skeleton-parts',4,3,256,'sprites/enemies/nightmare-skeleton-parts-v7.webp');
await pack('spirits',4,2,256,'sprites/enemies/nightmare-spirit-v7.webp');
await pack('fog',2,2,256,'maps/halloween/crypt-fog-v7.webp');
fs.writeFileSync(root+'registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Packed 8 crypt, 16 clothed limbs, 24 reactions, 12 skeleton parts and 8 spirit cels.');
