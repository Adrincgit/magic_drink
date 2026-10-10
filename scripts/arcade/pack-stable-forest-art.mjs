import fs from 'node:fs';
import sharp from 'sharp';
const manifest=JSON.parse(fs.readFileSync('context/arcade/ember-fort/stable-forest-art.json','utf8'));
for(const job of manifest.jobs){
 if(job.name==='hollow'){
  await sharp(job.source).trim({threshold:20}).resize({width:960}).webp({quality:96,alphaQuality:100}).toFile(job.outputs[0]);continue;
 }
 if(job.name==='flatWindows'){
  await sharp(job.source).resize(1024,512).webp({quality:96,alphaQuality:100}).toFile(job.outputs[0]);continue;
 }
 const {data,info}=await sharp(job.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const crops=[];
 for(let row=0;row<2;row++){
  const from=Math.round(info.height*row/2),to=Math.round(info.height*(row+1)/2);let top=to,bottom=from;
  for(let y=from;y<to;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>96){top=Math.min(top,y);bottom=Math.max(bottom,y);}
  crops.push({left:0,top,width:info.width,height:bottom-top+1});
 }
 const height=Math.max(...crops.map(q=>q.height))+4;
 for(let i=0;i<2;i++){
  const input=await sharp(job.source).extract(crops[i]).png().toBuffer();
  await sharp({create:{width:info.width,height,channels:4,background:'#00000000'}}).composite([{input,left:0,top:height-crops[i].height-4}]).webp({quality:95,alphaQuality:100}).toFile(job.outputs[i]);
 }
}
console.log('Packed flat windows, two registered undergrowth strips and the hollow.');
