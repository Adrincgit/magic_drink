import sharp from 'sharp';
import fs from 'node:fs';
const source='C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646/exec-37da833c-7322-48fd-8cae-f504c8e4fcde.png';
const output='public/arcade/maps/ember-trail/grass-floor.webp';
await sharp(source).resize({width:1200}).extract({left:0,top:100,width:1200,height:200}).webp({quality:92}).toFile(output);
const panoramaSource='C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646/exec-c5183036-173e-431d-8aa7-c882c39a50af.png';
const meta=await sharp(panoramaSource).metadata(),height=meta.height/2;
const panoramas=[];
for(const [i,name]of ['healthy','burned'].entries()){
 const path='public/arcade/maps/ember-trail/vista-'+name+'.webp';
 await sharp(panoramaSource).extract({left:0,top:i*height,width:meta.width,height}).webp({quality:92}).toFile(path);panoramas.push(path);
}
fs.writeFileSync('context/arcade/ember-fort/vista-art.json',JSON.stringify({source,output,operation:'Uniform resize to 1200 wide, crop middle 200px; no vertical stretch.',reference:'public/arcade/maps/ember-trail/canopy-healthy.webp',purpose:'Lush grass and a small earthen footpath at the beginning, blending gradually into dry and charred ground.',panoramaSource,panoramas,panoramaOperation:'Two equal panels, native resolution, preserve aspect ratio. Smaller distant trees; filled canopy avoids a cropped-trunk skyline.'},null,2)+'\n');
console.log([output,...panoramas]);
