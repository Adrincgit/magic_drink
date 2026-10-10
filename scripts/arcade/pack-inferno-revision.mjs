import fs from 'node:fs';
import sharp from 'sharp';
const file='context/arcade/ember-fort/inferno-art.json',manifest=JSON.parse(fs.readFileSync(file,'utf8'));
const names={motion:'sprites/enemies/ember-motion',wagon:'sprites/enemies/fire-wagon-small-crew',jet:'sprites/effects/ember-jet',balloon:'sprites/enemies/ember-balloon',captured:'sprites/effects/ember-captured',torchwalk:'sprites/enemies/ember-torchwalk'};
for(const [key,job]of Object.entries(manifest.jobs)){
 const {data,info}=await sharp(job.source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{width,height}=info;
 if(key==='floor'){
  job.outputs=[];for(let row=0;row<2;row++){const top=Math.round(height*row/2),bottom=Math.round(height*(row+1)/2),out=`public/arcade/maps/ember-trail/path-${row}.webp`;await sharp(job.source).extract({left:0,top,width,height:bottom-top}).webp({quality:96,alphaQuality:100}).toFile(out);job.outputs.push(out);}continue;
 }
 const rows=job.rows,cols=4,cuts=[0];
 for(let row=1;row<rows;row++){let best=Math.round(height*row/rows),cost=Infinity;for(let y=best-Math.floor(height/rows*.12);y<height*row/rows+height/rows*.12;y++){let n=0;for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>120)n++;n+=Math.abs(y-height*row/rows)*.001;if(n<cost){cost=n;best=y;}}cuts.push(best);}cuts.push(height);
 const cells=[];for(let i=0;i<rows*cols;i++){
  const l=Math.round(i%cols*width/cols),r=Math.round((i%cols+1)*width/cols),t=cuts[Math.floor(i/cols)],b=cuts[Math.floor(i/cols)+1];let minX=r,maxX=l,minY=b,maxY=t;
  for(let y=t;y<b;y++)for(let x=l;x<r;x++)if(data[(y*width+x)*4+3]>120){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  cells.push({left:minX,top:minY,width:maxX-minX+1,height:maxY-minY+1,cell:{left:l,top:t,width:r-l,height:b-t}});
 }
 if(key==='trees'){
  job.outputs=[];for(const [i,q]of cells.entries()){const {cell,...box}=q,out=`public/arcade/maps/ember-trail/tree-variety-${i}.webp`;const input=await sharp(job.source).extract(box).resize({height:650,fit:'inside'}).toBuffer(),meta=await sharp(input).metadata();await sharp({create:{width:meta.width+32,height:682,channels:4,background:'#00000000'}}).composite([{input,left:16,top:16}]).webp({quality:96,alphaQuality:100}).toFile(out);job.outputs.push(out);}continue;
 }
 const wide=key==='jet',size=256,scale=Math.min((wide?494:240)/Math.max(...cells.map(q=>q.width)),234/Math.max(...cells.map(q=>q.height))),tiles=[];
 for(const [i,q]of cells.entries()){
  const box=wide?q.cell:{left:q.cell.left,top:q.top,width:q.cell.width,height:q.height},w=Math.round(box.width*(wide?512/(width/4):scale)),h=Math.round(box.height*(wide?256/(height/rows):scale));
  const input=await sharp(job.source).extract(box).resize(w,h).png().toBuffer();
  tiles.push({input,left:i%4*(wide?512:size)+(wide?0:Math.floor((size-w)/2)),top:Math.floor(i/4)*size+(wide?Math.max(0,Math.floor((size-h)/2)):key==='captured'?Math.floor((size-h)/2):250-h)});
 }
 job.output='public/arcade/'+names[key]+'.webp';
 await sharp({create:{width:wide?2048:1024,height:256*rows,channels:4,background:'#00000000'}}).composite(tiles).webp({quality:96,alphaQuality:100}).toFile(job.output);
 console.log(key,job.output,cuts);
}
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
