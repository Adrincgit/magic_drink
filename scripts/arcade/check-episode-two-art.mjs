import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const root='public/arcade/act-two/episode-two-v1/',results=[];
for(const [name,count]of [['harlequin',16],['couple',16],['effects',16],['harlequin-walk',12],['count-walk',12],['rigging',8],['minions',24]]){
 const {data,info}=await sharp(root+name+'.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(info.width,2048);assert.equal(info.height,count/4*512);
 for(let frame=0;frame<count;frame++){
  const ox=frame%4*512,oy=Math.floor(frame/4)*512;let ink=0,edge=0;
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){const a=data[((y+oy)*info.width+x+ox)*4+3];if(a>32)ink++;if((x<2||y<2||x>509||y>509)&&a>32)edge++;}
  assert(ink>100,'Empty cel '+name+':'+frame);assert.equal(edge,0,'Clipped cel '+name+':'+frame);results.push({name,frame,ink,edge});
 }
}
for(const name of ['hexy-double','harlequin-portrait']){
 const meta=await sharp(root+name+'.webp').metadata();assert(meta.width>=1024&&meta.height>=1536);assert(meta.hasAlpha);
}
const castle=await sharp(root+'castle.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(castle.data[3],0,'Castle corner is opaque');
await fs.writeFile('context/arcade/episode-two-v1/atlas-check.json',JSON.stringify({cells:results.length,results},null,2)+'\n');console.log('104 complete transparent cels and two independent HD illustrations verified.');
