import fs from 'node:fs';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
// Native-size parts, never enlarged from tiny full-machine animation cells.
const source='context/arcade/machine-and-grip/',out='public/arcade/sprites/bosses/organ/';
fs.mkdirSync(out,{recursive:true});
for(const file of ['body','parts']){
 const path=source+'organ-'+file+'-source.webp';
 const {data,info}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const parts=components(data,info.width,info.height,(d,k)=>d[k+3]>128).filter(q=>q.count>2000);
 if(parts.length!==(file==='body'?1:4))throw Error('Unexpected organ components: '+file);
 for(const q of parts){
  const name=file==='body'?'body':q.y<info.height/2?(q.x<info.width/2?'wheel':'pipes'):(q.x<info.width/2?'cover':'horn');
  const left=Math.max(0,q.x-3),top=Math.max(0,q.y-3),width=Math.min(info.width-left,q.w+6),height=Math.min(info.height-top,q.h+6);
  await sharp(path).extract({left,top,width,height}).webp({quality:96,alphaQuality:100}).toFile(out+name+'.webp');
  console.log(name,width,height);
 }
}
// The circus armor has its own selected source; the old kit's star panel
// is superseded without retaining another published sprite or PNG history.
await sharp('context/arcade/riverwoods-polish/organ-cover-source.webp')
 .trim({threshold:1}).webp({quality:96,alphaQuality:100}).toFile(out+'cover.webp');
