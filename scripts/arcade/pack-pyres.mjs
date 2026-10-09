import fs from 'node:fs/promises';
import sharp from 'sharp';
const path='context/arcade/grand-harlequin/impact-art.json',m=JSON.parse(await fs.readFile(path,'utf8')),source=m.sourceDirectory+'/'+m.pyres.source,layers=[];
const {width:w,height:h}=await sharp(source).metadata();m.pyres.registration=[];
for(let i=0;i<8;i++){
 const box={left:Math.floor(i%4*w/4),top:Math.floor(i/4)*Math.floor(h/2),width:Math.floor(w/4),height:Math.floor(h/2)};
 const raw=await sharp(source).extract(box).ensureAlpha().raw().toBuffer();
 let l=box.width,r=0,t=box.height,b=0;
 for(let y=0;y<box.height;y++)for(let x=0;x<box.width;x++)if(raw[(y*box.width+x)*4+3]>60){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
 const crop={left:box.left+l,top:box.top+t,width:r-l+1,height:b-t+1};
 const input=await sharp(source).extract(crop).resize(180,500,{fit:'fill'}).png().toBuffer();layers.push({input,left:i%4*192+6,top:Math.floor(i/4)*512+6});m.pyres.registration.push(crop);
}
m.pyres.output='public/arcade/sprites/bosses/harlequin/pyres.webp';
await sharp({create:{width:768,height:1024,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(m.pyres.output);
await fs.writeFile(path,JSON.stringify(m,null,2)+'\n');
