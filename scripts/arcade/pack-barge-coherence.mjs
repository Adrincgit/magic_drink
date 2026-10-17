import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='context/arcade/barge-coherence/',base='C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646/';
await fs.copyFile(base+'exec-96eecc8b-e780-4dc0-9750-ba5d479dc3b9.png',dir+'phase-two-source.png');
await fs.copyFile(base+'exec-37c32adf-0e5f-4e53-823c-4b06428d68f3.png',dir+'effects-source.png');
await sharp(dir+'phase-two-source.png').resize(1536,1024).webp({quality:94,alphaQuality:100}).toFile('public/arcade/sprites/bosses/barge/phase-two-v2.webp');
const {width,height}=await sharp(dir+'effects-source.png').metadata(),layers=[];
for(let i=0;i<8;i++){
 const x=Math.floor(i%4*width/4),y=Math.floor(Math.floor(i/4)*height/2),right=Math.floor((i%4+1)*width/4),bottom=Math.floor((Math.floor(i/4)+1)*height/2);
 layers.push({input:await sharp(dir+'effects-source.png').extract({left:x,top:y,width:right-x,height:bottom-y}).resize(256,256).png().toBuffer(),left:i%4*256,top:Math.floor(i/4)*256});
}
await sharp({create:{width:1024,height:512,channels:4,background:'#0000'}}).composite(layers).webp({lossless:true}).toFile('public/arcade/sprites/effects/barge-impact-v2.webp');
console.log('Packed aligned hull and eight painted impact/pressure frames.');
