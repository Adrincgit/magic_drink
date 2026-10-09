import fs from 'node:fs/promises';
import sharp from 'sharp';

// Mechanical atlas packing only. All drawings and alpha originate in image_gen.
const manifestPath='context/arcade/grand-harlequin/painted-effects-art.json';
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const output='public/arcade/sprites/effects/painted-duel';
await fs.mkdir(output,{recursive:true});
const specs={
 duelHeads:{cols:4,rows:9,count:32,w:256,h:224,name:'heads'},
 duelParticles:{cols:4,rows:6,count:24,w:128,h:128,name:'particles'},
 tapButton:{cols:4,rows:2,count:8,w:256,h:320,name:'tap',outCols:8},
 pyreLife:{cols:4,rows:4,count:16,w:256,h:416,name:'pyres'},
 duelDust:{cols:4,rows:2,count:8,w:256,h:320,name:'dust'},
 fireProjectiles:{cols:4,rows:6,count:24,w:256,h:128,name:'fire'},
};
for(const [key,s]of Object.entries(specs)){
 const source=manifest.assets[key].source,{width,height}=await sharp(source).metadata(),layers=[],outCols=s.outCols||4;
 const registration=[];
 for(let i=0;i<s.count;i++){
  const col=i%s.cols,row=Math.floor(i/s.cols);
  // The native rows are deliberately measured, not assumed to be equal.
  const ys=key==='pyreLife'?[0,365,764,1145,1536]:key==='duelHeads'?[0,194,379,553,722,920,1134,1332,1554,1774]:key==='fireProjectiles'?[0,189,354,519,674,843,1024]:null;
  const top=ys?ys[row]:Math.floor(row*height/s.rows),bottom=ys?ys[row+1]:Math.floor((row+1)*height/s.rows);
  const left=Math.floor(col*width/s.cols),right=Math.floor((col+1)*width/s.cols);
  const crop={left,top,width:right-left,height:bottom-top};let input,dx=0,dy=0;
  if(key==='pyreLife'){
   // Share a foot line. Detached extinguishing flames keep their height.
   const baseline=[345,743,1126,1509][row];dy=380-(baseline-top);
   input=await sharp(source).extract(crop).png().toBuffer();
  }else{
   let cell=sharp(source).extract(crop);
   // Match the painted base across both rows without centring each silhouette.
   const shift=row===1?(key==='tapButton'?37:key==='duelDust'?44:0):0;
   if(shift)cell=sharp(await cell.png().toBuffer()).extract({left:0,top:0,width:crop.width,height:crop.height-shift}).extend({top:shift,bottom:0,left:0,right:0,background:'#00000000'});
   input=await sharp(await cell.png().toBuffer()).resize(s.w-8,s.h-8,{fit:'inside'}).png().toBuffer();
   const m=await sharp(input).metadata();dx=Math.round((s.w-m.width)/2);dy=Math.round((s.h-m.height)/2);
  }
  layers.push({input,left:i%outCols*s.w+dx,top:Math.floor(i/outCols)*s.h+dy});registration.push({crop,dx,dy});
 }
 const target=output+'/'+s.name+'.webp';
 await sharp({create:{width:s.w*outCols,height:s.h*Math.ceil(s.count/outCols),channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(target);
 Object.assign(manifest.assets[key],{output:target,layout:{columns:outCols,frames:s.count,cell:[s.w,s.h]},registration});
}
// Trim outer empty margins, retaining the genuinely transparent meter window.
const source=manifest.assets.duelMeter.source,target=output+'/meter.webp';
await sharp(source).extract({left:28,top:195,width:1992,height:322}).resize(996,161).webp({quality:95,alphaQuality:100}).toFile(target);
manifest.assets.duelMeter.output=target;
await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('Packed seven transparent painted effect assets.');
