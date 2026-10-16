import fs from 'node:fs/promises';
import sharp from 'sharp';
const manifest=JSON.parse(await fs.readFile('context/arcade/ember-fort/camp-prompts.json','utf8'));
const source=key=>manifest.jobs.find(q=>q.key===key).source;
const dir='public/arcade/maps/circus';
async function save(name,img){await img.webp({quality:93,alphaQuality:100}).toFile(`${dir}/${name}.webp`);}
await save('camp-ash-ground',sharp(source('ground')));
await save('camp-grand-side',sharp(source('grand')).trim());
const scenery=source('scenery'),m=await sharp(scenery).metadata(),half=Math.floor(m.width/2),split=Math.floor(m.height*.76);
for(const [i,name]of ['trunk','pines','brush','log'].entries()){
 const crop={left:i%2*half,top:i<2?0:split,width:half,height:i<2?split:m.height-split};
 const cell=await sharp(scenery).extract(crop).png().toBuffer();await save('camp-'+name,sharp(cell).trim());
}
// Both curtain states retain the same full cell, so changing frames cannot
// shift the stakes, roof or contact point.
const tent=source('tents'),t=await sharp(tent).metadata(),width=Math.floor(t.width/2);
for(const [i,name]of ['closed','open'].entries())await save('camp-tent-'+name,sharp(tent).extract({left:i*width,top:0,width,height:t.height}));
console.log('Packed eight camp assets with their original alpha.');
