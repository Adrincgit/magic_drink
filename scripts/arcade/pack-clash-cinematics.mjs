import fs from 'node:fs/promises';
import sharp from 'sharp';
const manifest=JSON.parse(await fs.readFile('context/arcade/grand-harlequin/cinematic-art.json','utf8'));
// The generator's gutters are not an exact grid. Locate the twelve complete
// silhouettes first, then divide at the gaps, never through a hat or a shoe.
for(const spec of [manifest.hexy,manifest.boss]){
 const {data,info:{width:w,height:h}}=await sharp(spec.source).raw().toBuffer({resolveWithObject:true});
 const seen=new Uint8Array(w*h),figures=[];
 for(let i=0;i<w*h;i++){
  if(seen[i]||data[i*4+3]<128)continue;
  const queue=[i];seen[i]=1;let x0=w,y0=h,x1=0,y1=0;
  for(let n=0;n<queue.length;n++){
   const j=queue[n],x=j%w,y=Math.floor(j/w);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);
   for(const k of [x>0?j-1:-1,x<w-1?j+1:-1,y>0?j-w:-1,y<h-1?j+w:-1])if(k>=0&&!seen[k]&&data[k*4+3]>=128){seen[k]=1;queue.push(k);}
  }
  if(queue.length>10000)figures.push({x0,y0,x1,y1});
 }
 if(figures.length!==12)throw Error('Expected twelve distinct full figures: '+spec.source);
 figures.sort((a,b)=>(a.y0+a.y1)-(b.y0+b.y1));
 const rows=Array.from({length:4},(_,r)=>figures.slice(r*3,r*3+3).sort((a,b)=>a.x0-b.x0));
 const yCuts=[0,...rows.slice(0,3).map((row,i)=>Math.round((Math.max(...row.map(f=>f.y1))+Math.min(...rows[i+1].map(f=>f.y0)))/2)),h],layers=[],registration=[];
 for(let r=0;r<4;r++){
  const row=rows[r],xCuts=[0,...row.slice(0,2).map((f,i)=>Math.round((f.x1+row[i+1].x0)/2)),w];
  for(let col=0;col<3;col++){
   const f=row[col],left=Math.max(xCuts[col],f.x0-6),top=Math.max(yCuts[r],f.y0-6),width=Math.min(xCuts[col+1],f.x1+7)-left,height=Math.min(yCuts[r+1],f.y1+7)-top;
   let footLeft=w,footRight=0;
   for(let y=f.y1-12;y<=f.y1;y++)for(let x=f.x0;x<=f.x1;x++)if(data[(y*w+x)*4+3]>180){footLeft=Math.min(footLeft,x);footRight=Math.max(footRight,x);}
   const anchor=(footLeft+footRight)/2,dx=Math.round(192-(anchor-left)),dy=432-(f.y1-top);
   const input=await sharp(spec.source).extract({left,top,width,height}).png().toBuffer();
   if(dx<0||dy<0||dx+width>384||dy+height>448)throw Error('Figure exceeds cell gutter');
   layers.push({input,left:col*384+dx,top:r*448+dy});registration.push({row:r,col,crop:{left,top,width,height},anchor:[anchor,f.y1],destination:[dx,dy]});
  }
 }
 await sharp({create:{width:1152,height:1792,channels:4,background:'#00000000'}}).composite(layers).webp({quality:95,alphaQuality:100}).toFile(spec.output);
 spec.registration=registration;console.log(spec.output);
}
await fs.writeFile('context/arcade/grand-harlequin/cinematic-art.json',JSON.stringify(manifest,null,2)+'\n');
