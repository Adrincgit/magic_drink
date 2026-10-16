import fs from 'node:fs/promises';
import sharp from 'sharp';
const {jobs}=JSON.parse(await fs.readFile('context/arcade/ribbon-coaster-umbrella/art.json','utf8'));
for(const job of jobs){
 if(job.key==='ribbon-can'||job.key==='coaster-icon'){
  await sharp(job.source).trim({threshold:12}).resize({height:job.key==='ribbon-can'?480:384}).webp({quality:92}).toFile(job.output);continue;
 }
 const {width,height}=await sharp(job.source).metadata();
 if(job.key==='umbrella-clown'){
  // The generated drawings have unequal row padding. Register each boot baseline
  // and torso to one anchor using translation and one shared scale (never stretch poses).
  const rows=[[38,309],[351,616],[655,918],[932,1215]];
  const columns=[[32,324,631,950,1250],[32,344,625,974,1250],[32,335,640,949,1250],[26,336,672,957,1250]];
  const torso=[221,532,837,1150,235,541,850,1153,243,542,841,1155,244,551,850,1112];
  const parts=[];
  for(let f=0;f<16;f++){
   const row=Math.floor(f/4),col=f%4,left=columns[row][col],top=rows[row][0],w=columns[row][col+1]-left,h=rows[row][1]-top;
   const rectangle=await sharp(job.source).extract({left,top,width:w,height:h}).png().toBuffer();
   const cropped=await sharp(rectangle).trim({threshold:12}).png().toBuffer({resolveWithObject:true});
   const raw=await sharp(cropped.data).ensureAlpha().raw().toBuffer({resolveWithObject:true});let bottom=0;
   for(let y=0;y<raw.info.height;y++)for(let x=0;x<raw.info.width;x++)if(raw.data[(y*raw.info.width+x)*4+3]>100)bottom=y;
   const scaled=await sharp(cropped.data).resize({width:Math.round(raw.info.width*.8)}).png().toBuffer({resolveWithObject:true});
   const anchor=torso[f]-left+(cropped.info.trimOffsetLeft||0);
   const px=Math.max(0,Math.min(256-scaled.info.width,Math.round(174-anchor*.8))),py=250-Math.round(bottom*.8);
   if(px+scaled.info.width>256||py<0||py+scaled.info.height>256)throw new Error('Umbrella frame outside its cell: '+f);
   parts.push({input:scaled.data,left:col*256+px,top:row*256+py});
  }
  await sharp({create:{width:1024,height:1024,channels:4,background:'#00000000'}}).composite(parts).webp({quality:94}).toFile(job.output);continue;
 }
 // Keep all four platforms registered to the same top surface; crop the sheet's empty vertical margins together.
 const parts=[];
 for(let i=0;i<4;i++){
  const left=Math.round(i*width/4),right=Math.round((i+1)*width/4);
  const input=await sharp(job.source).extract({left,top:Math.round(height*.33),width:right-left,height:Math.round(height*.38)}).resize(256,130,{fit:'fill'}).png().toBuffer();
  parts.push({input,left:i*256,top:0});
 }
 await sharp({create:{width:1024,height:130,channels:4,background:'#00000000'}}).composite(parts).webp({quality:94}).toFile(job.output);
}
