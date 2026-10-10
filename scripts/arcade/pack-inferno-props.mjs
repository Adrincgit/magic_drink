import fs from 'node:fs';
import sharp from 'sharp';
const file='context/arcade/ember-fort/inferno-props-art.json',manifest=JSON.parse(fs.readFileSync(file,'utf8'));
for(const [key,job]of Object.entries(manifest.jobs)){
 const trees=key==='clean-trees',cols=trees?3:4,rows=trees?2:1,{data,info}=await sharp(job.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});job.outputs=[];
 for(let i=0;i<cols*rows;i++){
  const l=Math.round(i%cols*info.width/cols),r=Math.round((i%cols+1)*info.width/cols),t=Math.round(Math.floor(i/cols)*info.height/rows),b=Math.round((Math.floor(i/cols)+1)*info.height/rows);let minX=r,maxX=l,minY=b,maxY=t;
  for(let y=t;y<b;y++)for(let x=l;x<r;x++)if(data[(y*info.width+x)*4+3]>100){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  if(trees&&(minX<=l+3||maxX>=r-3))throw Error('Tree crosses a cell edge: '+i);
  const box={left:minX,top:minY,width:maxX-minX+1,height:maxY-minY+1},size=trees?650:300;
  const input=await sharp(job.source).extract(box).resize({height:size}).png().toBuffer(),m=await sharp(input).metadata(),output=`public/arcade/maps/ember-trail/${trees?'tree-clean':'outcrop'}-${i}.webp`;
  await sharp({create:{width:m.width+24,height:size+24,channels:4,background:'#00000000'}}).composite([{input,left:12,top:12}]).webp({quality:96,alphaQuality:100}).toFile(output);job.outputs.push(output);console.log(key,i,box);
 }
}
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
