import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const manifest=JSON.parse(await fs.readFile('context/arcade/ember-fort/siege-prompts.json','utf8'));
const source=key=>manifest.jobs.find(q=>q.key===key).source;
async function save(p,image){await fs.mkdir(path.dirname(p),{recursive:true});await image.webp({quality:94,alphaQuality:100}).toFile(p);}
await save('public/arcade/sprites/pickups/aqua-berry.webp',sharp(source('aquaCan')).trim().resize({height:480}));
await save('public/arcade/sprites/pickups/vital-heart.webp',sharp(source('vitalHeart')).trim().resize({width:256}));
await save('public/arcade/sprites/effects/aqua.webp',sharp(source('aquaFX')));
await save('public/arcade/maps/circus/camp-panorama.webp',sharp(source('campBackdrop')));
await save('public/arcade/sprites/bosses/ember-fort/collapse.webp',sharp(source('fortCollapse')));
await save('public/arcade/sprites/bosses/ember-fort/wall.webp',sharp(source('fortWall')));
const input=source('campTents'),meta=await sharp(input).metadata(),cw=Math.floor(meta.width/2),ch=Math.floor(meta.height/2);
for(const [i,name]of ['side-open','side-closed','camp-red','camp-purple'].entries()){
 const cell=await sharp(input).extract({left:i%2*cw,top:Math.floor(i/2)*ch,width:cw,height:ch}).png().toBuffer();
 await save('public/arcade/sprites/props/'+name+'.webp',sharp(cell).trim());
}
console.log('Packed Aqua Berry, Vital Heart, camp and fortress artwork.');
