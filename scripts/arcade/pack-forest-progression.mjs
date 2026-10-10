import fs from 'node:fs';
import sharp from 'sharp';
const manifest=JSON.parse(fs.readFileSync('context/arcade/ember-fort/forest-progression-art.json','utf8'));
for(const job of manifest.jobs){
 const meta=await sharp(job.source).metadata();
 if(job.name==='forest-panorama-pair'){
  const height=Math.floor(meta.height/2);
  for(let row=0;row<2;row++)await sharp(job.source).extract({left:0,top:row*height,width:meta.width,height}).webp({quality:95}).toFile(job.outputs[row]);
 }else if(job.name==='branch-tree'){
  await sharp(job.source).resize(1024,1024).webp({quality:96,alphaQuality:100}).toFile(job.outputs[0]);
 }else{
  // Register the painted root, not each frame's changing alpha bounds. The
  // atlas has unequal source row spacing; every destination shares one pivot.
  const rows=[[0,343,332],[344,354,672],[730,264,964],[1020,meta.height-1020,1214]];
  const pivots=[[138,459,750,1068],[85,404,720,1035],[69,390,704,1022],[74,393,707,1027]];
  const layers=[],scale=1.6;
  for(let i=0;i<16;i++){
   const row=Math.floor(i/4),col=i%4,[top,height,rootY]=rows[row];
   const left=Math.round(col*meta.width/4),right=Math.round((col+1)*meta.width/4);
   const input=await sharp(job.source).extract({left,top,width:right-left,height}).resize(Math.round((right-left)*scale),Math.round(height*scale)).png().toBuffer();
   layers.push({input,left:col*768+Math.round(250-(pivots[row][col]-left)*scale),top:row*640+Math.round(600-(rootY-top)*scale)});
  }
  await sharp({create:{width:3072,height:2560,channels:4,background:'#00000000'}}).composite(layers).webp({quality:96,alphaQuality:100}).toFile(job.outputs[0]);
 }
 console.log(job.name,job.outputs);
}
