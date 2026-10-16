import fs from 'node:fs';
import sharp from 'sharp';
const manifest=JSON.parse(fs.readFileSync('context/arcade/drink-roster/wave2-art.json','utf8'));
for(const job of manifest.jobs){
 if(job.key.endsWith('can'))await sharp(job.source).trim({threshold:12}).resize({height:480}).webp({quality:94,alphaQuality:100}).toFile(job.output);
 else{
  const img=sharp(job.source),meta=await img.metadata(),layers=[];
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){
   const top=Math.round(job.rows[row]*meta.height/1024),bottom=Math.round(job.rows[row+1]*meta.height/1024);
   const input=await img.clone().extract({left:col*meta.width/4,top,width:meta.width/4,height:bottom-top}).resize(256,256,{fit:'contain',background:'#00000000'}).png().toBuffer();
   layers.push({input,left:col*256,top:row*256});
  }
  await sharp({create:{width:1024,height:768,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(job.output);
 }
 console.log(job.output);
}
