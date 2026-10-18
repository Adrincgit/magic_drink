import fs from 'node:fs';
import sharp from 'sharp';

const dir='context/arcade/hexy-down-repair/illustrations/',out='public/arcade/sprites/ui/encore/';
const names=['ground-diagonal-up','air-diagonal-up','ground-up','air-up','ground-diagonal-down','air-diagonal-down','ground-down','air-down','air-horizontal'];
for(const name of names)if(!fs.existsSync(dir+name+'.png'))throw Error('Missing dedicated illustration '+name);
fs.mkdirSync(out,{recursive:true});const records={};
for(const name of names){
 const file=dir+name+'.png',m=await sharp(file).metadata();
 if(!m.hasAlpha||m.width<1024||m.height<1024)throw Error('Illustration must be high resolution with alpha: '+name);
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,right=0,top=info.height,bottom=0,transparent=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const a=data[(y*info.width+x)*4+3];if(a===0)transparent++;
  if(a>32){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 }
 if(transparent<info.width*info.height*.05)throw Error('Missing real transparent margins: '+name);
 // Preserve the original drawing's pixels; never enlarge gameplay cels.
 await sharp(file).webp({lossless:true}).toFile(out+name+'-v1.webp');
 records[name]={key:'hexy-encore-'+name,src:'/arcade/sprites/ui/encore/'+name+'-v1.webp?v=20261017-illustration',width:m.width,height:m.height,crop:[left,top,right-left+1,bottom-top+1]};
}
fs.writeFileSync('src/components/arcade/adventure/render/hexyEncorePortraits.js','// Dedicated full-resolution hero illustrations; independent of gameplay sheets.\nexport default '+JSON.stringify(records)+';\n');
fs.writeFileSync('context/arcade/hexy-down-repair/portrait-registration.json',JSON.stringify(records,null,2)+'\n');
console.log('Packed nine dedicated illustrations at original resolution.');
