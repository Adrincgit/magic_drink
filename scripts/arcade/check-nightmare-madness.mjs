import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const root='public/arcade/act-two/nightmare-madness-v2/',report=[];
for(const [name,rows]of [['phase-two',4],['phase-three',4],['phase-two-walk',3],['phase-three-walk',3],['candy-props',2]]){
 const {data,info}=await sharp(root+name+'.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(info.width,2048);assert.equal(info.height,rows*512);
 for(let frame=0;frame<rows*4;frame++){
  let pixels=0,border=0;const ox=frame%4*512,oy=Math.floor(frame/4)*512;
  for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(data[((oy+y)*info.width+ox+x)*4+3]>32){pixels++;if(x<3||x>=509||y<3||y>=509)border++;}
  assert(pixels>2000,name+' empty frame '+frame);assert.equal(border,0,name+' clipped cel '+frame);report.push({name,frame,pixels,border});
 }
}
for(const name of ['madness-portrait','charge-portrait']){const m=await sharp(root+name+'.webp').metadata();assert(m.width>=1024&&m.height>=1536&&m.hasAlpha,name+' must be an independent HD cutout');}
const room=await sharp(root+'candy-warehouse.webp').metadata();assert(room.width>=1536&&room.height>=1024);
await fs.writeFile('context/arcade/nightmare-madness-v2/atlas-check.json',JSON.stringify({cels:report.length,report},null,2)+'\n');console.log(report.length+' complete cels, two HD portraits and painted warehouse verified.');
