import fs from 'node:fs';
import sharp from 'sharp';
const {assets}=JSON.parse(fs.readFileSync('context/arcade/harbor-barge/sky-layers.json','utf8'));
for(const asset of assets){
 const meta=await sharp(asset.source).metadata();
 if(meta.width!==2172||meta.height!==724)throw new Error('Unexpected panorama registration: '+asset.name);
 if(asset.transparent_background&&!meta.hasAlpha)throw new Error('Missing alpha: '+asset.name);
 await sharp(asset.source).webp({quality:94,alphaQuality:100}).toFile(asset.output);
 console.log(asset.output,fs.statSync(asset.output).size);
}
