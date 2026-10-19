import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {NIGHTMARE_PRESSURE_PORTRAITS as crops,NIGHTMARE_PRESSURE_HEXY as sockets,NIGHTMARE_PRESSURE_PORTRAIT_TIPS as tips} from '../../src/components/arcade/adventure/actors/bosses/nightmarePressureRegistration.js';
const root='public/arcade/act-two/nightmare-sprites-v6',report=[];
for(const name of ['hexy-portraits','boss-portraits']){
 const m=await sharp(root+'/'+name+'.webp').metadata(),rows=crops[name].length/4;
 for(let row=0;row<rows;row++){
  const hashes=[];
  for(let cel=0;cel<4;cel++){
   const [left,top,width,height]=crops[name][row*4+cel],data=await sharp(root+'/'+name+'.webp').extract({left,top,width,height}).ensureAlpha().raw().toBuffer();
   hashes.push(createHash('sha256').update(data).digest('hex'));
   for(const [x,y]of [[0,0],[width-1,0],[0,height-1],[width-1,height-1]])assert.equal(data[(y*width+x)*4+3],0,name+' transparent corner');
  }
  assert.equal(new Set(hashes).size,4,name+' must contain four distinct drawn cels per expression');
 }
 report.push({name,dimensions:[m.width,m.height],expressionLoops:rows,celsPerLoop:4,distinctWithinEachLoop:true,transparentCorners:true});
}
for(const frames of Object.values(sockets))for(const q of frames)for(const value of q.tip)assert(value>0&&value<320);
for(const [x,y]of tips){assert(x>40&&x<664);assert(y>40&&y<664);}
const result={report,starSockets:'registered per cel, with more than 40 native pixels to the portrait edge',animation:'drawImage of distinct painted cels; no living-ink deformation in active renderer',note:'Pixel checks do not establish anatomy or motion quality; inspect decoded recordings.'};
await fs.writeFile('context/arcade/nightmare-sprites-v6/art-check.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
