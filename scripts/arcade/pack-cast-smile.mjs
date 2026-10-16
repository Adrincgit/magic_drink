import fs from 'node:fs/promises';
import sharp from 'sharp';
const spec=JSON.parse(await fs.readFile('context/arcade/grand-harlequin/cast-smile-art.json','utf8'));
try{await fs.access(spec.source);}catch{await fs.copyFile(spec.generatedSource,spec.source);}
const edited=await sharp(spec.source).resize(1152,448).ensureAlpha().raw().toBuffer();
const original=await sharp(spec.reference).ensureAlpha().raw().toBuffer();
// Integrate only the generated mouth correction. Original head orientation,
// hands, body, cape and fire registration remain pixel-identical in all cels.
const patch=spec.mouthPatch;
for(let y=0;y<patch.height;y++)for(let x=0;x<patch.width;x++){
 const alpha=Math.min(1,Math.min(x,y,patch.width-1-x,patch.height-1-y)/2);
 const k=((patch.top+y)*1152+patch.left+x)*4;
 for(let c=0;c<3;c++)original[k+c]=Math.round(original[k+c]*(1-alpha)+edited[k+c]*alpha);
}
await sharp(original,{raw:{width:1152,height:448,channels:4}}).webp({lossless:true}).toFile(spec.outputs[0]);
const layers=[];
for(let i=0;i<3;i++)layers.push({input:await sharp(spec.outputs[0]).extract({left:i*384,top:50,width:384,height:398}).resize(442,458).png().toBuffer(),left:i*512+35,top:51});
await sharp({create:{width:2048,height:512,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(spec.outputs[1]);
console.log(spec.outputs.join('\n'));
