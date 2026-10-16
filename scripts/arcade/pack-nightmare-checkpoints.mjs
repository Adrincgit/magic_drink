import fs from 'node:fs';
import sharp from 'sharp';
const folder='context/arcade/halloween-5-1/checkpoints-1-5/';
const {assets}=JSON.parse(fs.readFileSync(folder+'prompts.json','utf8'));
fs.mkdirSync(folder+'sources',{recursive:true});
for(const asset of assets){
 const source=folder+'sources/'+asset.name+'.png';if(!fs.existsSync(source))fs.copyFileSync(asset.source,source);
 const out='public/arcade/maps/halloween/'+asset.name+'.webp';
 await sharp(source).trim({threshold:0}).resize({height:asset.name==='branch-natural'?200:1000,withoutEnlargement:true}).webp({quality:94,alphaQuality:100}).toFile(out);
 const {data,info}=await sharp(out).ensureAlpha().raw().toBuffer({resolveWithObject:true});let zero=0,opaque=0,partial=0;for(let i=3;i<data.length;i+=4){if(data[i]===255)opaque++;else if(data[i]===0)zero++;else partial++;}
 console.log(JSON.stringify({out,width:info.width,height:info.height,zero,opaque,partial}));
}
