import fs from 'node:fs';
import sharp from 'sharp';
const manifest=JSON.parse(fs.readFileSync('context/arcade/ember-fort/fire-troops-art.json','utf8'));
for(const [key,job]of Object.entries(manifest.jobs)){
 const {data,info}=await sharp(job.source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{width,height}=info;
 const occupied=Array.from({length:height},(_,y)=>{let n=0;for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>100)n++;return n;});
 const cuts=[0];
 for(let r=1;r<job.rows;r++){
  const at=Math.round(height/job.rows*r),range=Math.floor(height/job.rows*.15);let best=at,min=Infinity;
  for(let y=at-range;y<at+range;y++){const cost=occupied[y]+Math.abs(y-at)*.001;if(cost<min){min=cost;best=y;}}
  if(occupied[best]>4)throw new Error(`${key}: no transparent row gutter at ${r}`);cuts.push(best);
 }
 cuts.push(height);const cells=[];
 for(let i=0;i<job.rows*4;i++){
  const left=Math.round(i%4*width/4),right=Math.round((i%4+1)*width/4),top=cuts[Math.floor(i/4)],bottom=cuts[Math.floor(i/4)+1];let min=bottom,max=top;
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(data[(y*width+x)*4+3]>100){min=Math.min(min,y);max=Math.max(max,y);}
  cells.push({left,top:min,width:right-left,height:max-min+1});
 }
 const size=256,scale=Math.min(244/(width/4),234/Math.max(...cells.map(q=>q.height))),tiles=[];
 for(const [i,q]of cells.entries()){
  const w=Math.round(q.width*scale),h=Math.round(q.height*scale),input=await sharp(job.source).extract(q).resize(w,h).png().toBuffer();
  tiles.push({input,left:i%4*size+Math.floor((size-w)/2),top:Math.floor(i/4)*size+(key==='torchFx'?Math.floor((size-h)/2):250-h)});
 }
 await sharp({create:{width:1024,height:256*job.rows,channels:4,background:'#00000000'}}).composite(tiles).webp({quality:96,alphaQuality:100}).toFile(job.output);
 console.log(key,{width,height,cuts,scale,corners:[data[3],data[(width-1)*4+3]],output:job.output});
}
