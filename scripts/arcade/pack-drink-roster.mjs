import fs from 'node:fs';
import sharp from 'sharp';
const manifest=JSON.parse(fs.readFileSync('context/arcade/drink-roster/art.json','utf8'));
const names={jelly:'jelly-cherry',prism:'prism-peach',echo:'echo-melon'};
for(const job of manifest.jobs){
 const [flavor,type]=job.key.split('-');
 const target=`public/arcade/sprites/${type==='can'?'pickups':'effects'}/${names[flavor]}.webp`;
 let pipeline=sharp(job.source);
 if(type==='can')pipeline=pipeline.trim({threshold:12}).resize({height:480});
 await pipeline.webp({quality:94,alphaQuality:100}).toFile(target);
 job.output=target;
}
fs.writeFileSync('context/arcade/drink-roster/art.json',JSON.stringify(manifest,null,2)+'\n');
