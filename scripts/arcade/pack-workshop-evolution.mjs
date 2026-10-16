import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646/';
const files={volt:'exec-3a30e830-fdae-48d6-a450-89773bfe4252.png',ribbon:'exec-34ca8406-adbd-49f8-817e-fbe3c4b32a4a.png',hexy:'exec-e5911af3-7451-4c36-85d0-859d2c1ada1f.png',mods:'exec-d34271c0-8696-480e-b290-c983c43e3695.png'};
async function grid(key,cols,rows,output){
 const m=await sharp(source+files[key]).metadata(),layers=[];
 for(let i=0;i<cols*rows;i++){const x=Math.round(i%cols*m.width/cols),y=Math.round(Math.floor(i/cols)*m.height/rows),right=Math.round((i%cols+1)*m.width/cols),bottom=Math.round((Math.floor(i/cols)+1)*m.height/rows);layers.push({input:await sharp(source+files[key]).extract({left:x,top:y,width:right-x,height:bottom-y}).resize(320,320).png().toBuffer(),left:i%cols*320,top:Math.floor(i/cols)*320});}
 await sharp({create:{width:320*cols,height:320*rows,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94}).toFile(output);
}
await grid('volt',4,3,'public/arcade/sprites/effects/volt-beam-v2.webp');
await grid('ribbon',4,2,'public/arcade/sprites/effects/ribbon-satin.webp');
const icons=['comet-dive','double-dash','sky-guard','reserve-sleeve','swift-step','skills-emblem'];
for(const [i,id]of icons.entries())await sharp(source+files.mods).extract({left:i%3*512,top:Math.floor(i/3)*512,width:512,height:512}).resize(320,320).webp({quality:93}).toFile('public/arcade/sprites/ui/'+id+'.webp');
const rects=[[0,0,384,512],[384,0,368,512],[775,0,383,512],[1158,0,378,512],[0,512,450,512],[450,512,317,512],[767,512,368,512],[1151,512,385,512]];
const hips=[219,608,987,1352,222,619,986,1350],tips=[[72,102],[452,165],[899,63],[1505,250],[423,726],[710,883],[1104,546],[1502,714]],scale=.63,layers=[],atlas=[];
for(let i=0;i<8;i++){
 const [left,top,width,height]=rects[i],floor=i<4?487:964,w=Math.round(width*scale),h=Math.round(height*scale),dx=Math.round(160-(hips[i]-left)*scale),dy=Math.round(300-(floor-top)*scale);
 let img=await sharp(source+files.hexy).extract({left,top,width,height}).resize(w,h).png().toBuffer();
 // Normalise the feet to the existing 320px character atlas registration.
 const cropLeft=Math.max(0,-dx),cropTop=Math.max(0,-dy),cropW=Math.min(w-cropLeft,320-Math.max(0,dx)),cropH=Math.min(h-cropTop,320-Math.max(0,dy));
 img=await sharp(img).extract({left:cropLeft,top:cropTop,width:cropW,height:cropH}).png().toBuffer();
 layers.push({input:img,left:i%4*320+Math.max(0,dx),top:Math.floor(i/4)*320+Math.max(0,dy)});
 atlas.push({tip:[Math.round(160+(tips[i][0]-hips[i])*scale),Math.round(300+(tips[i][1]-floor)*scale)]});
}
await sharp({create:{width:1280,height:640,channels:4,background:'#00000000'}}).composite(layers).webp({quality:95}).toFile('public/arcade/sprites/hexy/ribbon-swing.webp');
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyRibbonAtlas.js','// Wand tips registered with the boot baseline at y=300.\nexport default '+JSON.stringify(atlas)+';\n');
await fs.mkdir('context/arcade/workshop-evolution',{recursive:true});
await fs.writeFile('context/arcade/workshop-evolution/assets.json',JSON.stringify({mode:'built-in imagegen',sources:Object.fromEntries(Object.entries(files).map(([k,v])=>[k,source+v])),outputs:['public/arcade/sprites/effects/volt-beam-v2.webp','public/arcade/sprites/effects/ribbon-satin.webp','public/arcade/sprites/hexy/ribbon-swing.webp',...icons.map(id=>'public/arcade/sprites/ui/'+id+'.webp')]},null,2));
console.log('Packed VFX, eight registered wand-swing poses and six charms.');
