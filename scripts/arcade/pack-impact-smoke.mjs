import fs from 'node:fs/promises';
import sharp from 'sharp';
const path='context/arcade/grand-harlequin/impact-art.json',m=JSON.parse(await fs.readFile(path,'utf8')),source=m.sourceDirectory+'/'+m.smoke.source;
const {width:w,height:h}=await sharp(source).metadata(),layers=[];m.smoke.registration=[];
for(let i=0;i<8;i++){
 const crop={left:Math.floor(i%4*w/4)+8,top:Math.floor(i/4)*Math.floor(h/2)+8,width:Math.floor(w/4)-16,height:Math.floor(h/2)-16};
 layers.push({input:await sharp(source).extract(crop).resize(244,244).png().toBuffer(),left:i%4*256+6,top:Math.floor(i/4)*256+6});m.smoke.registration.push(crop);
}
await sharp({create:{width:1024,height:512,channels:4,background:'#00000000'}}).composite(layers).webp({quality:93,alphaQuality:100}).toFile(m.smoke.output);
await fs.writeFile(path,JSON.stringify(m,null,2)+'\n');
