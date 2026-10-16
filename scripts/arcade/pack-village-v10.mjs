import fs from 'node:fs/promises';
import sharp from 'sharp';
const root='context/arcade/village-5-2/revision-10',registration={};
const overrides=JSON.parse(await fs.readFile(root+'/anatomy-fix/overrides.json','utf8'));
async function replacement(name,index,b){
 const edit=overrides[name]?.find(q=>q.frame===index);if(!edit)return b;
 const source=root+'/'+edit.source,{data,info:{width:w,height:h}}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=w,y0=h,x1=0,y1=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>100){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 const path=root+'/anatomy-fix/registered/'+name+'-'+index+'.png';await fs.mkdir(root+'/anatomy-fix/registered',{recursive:true});
 // Restore the original cell bounds and foot baseline after the anatomical edit.
 await sharp(source).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize(b.width-6,b.height-6,{fit:'fill'}).extend({top:3,bottom:3,left:3,right:3,background:'#00000000'}).png().toFile(path);
 return{path,left:0,top:0,width:b.width,height:b.height,anatomySource:source,original:b};
}
async function measure(path,rows){
 const {data,info:{width:w,height:h}}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true}),alpha=(x,y)=>data[(y*w+x)*4+3],ys=[0],out=[];
 for(let row=1;row<rows;row++){const ideal=h*row/rows;let best=Math.round(ideal),score=Infinity;for(let y=Math.floor(ideal-h/rows*.22);y<ideal+h/rows*.22;y++){let n=0;for(let x=0;x<w;x++)if(alpha(x,y)>120)n++;const value=n+Math.abs(y-ideal)*.03;if(value<score){score=value;best=y;}}ys.push(best);}ys.push(h);
 for(let row=0;row<rows;row++){
  const xs=[0];for(let col=1;col<4;col++){const ideal=w*col/4;let best=Math.round(ideal),score=Infinity;for(let x=Math.floor(ideal-w/4*.14);x<ideal+w/4*.14;x++){let n=0;for(let y=ys[row];y<ys[row+1];y++)if(alpha(x,y)>120)n++;const value=n+Math.abs(x-ideal)*.03;if(value<score){score=value;best=x;}}xs.push(best);}xs.push(w);
  for(let col=0;col<4;col++){
   const left=xs[col],right=xs[col+1];let x0=right,x1=left,y0=ys[row+1],y1=ys[row];
   for(let y=ys[row];y<ys[row+1];y++)for(let x=left;x<right;x++)if(alpha(x,y)>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
   out.push({path,left:Math.max(left,x0-3),top:Math.max(ys[row],y0-3),width:Math.min(right-1,x1+3)-Math.max(left,x0-3)+1,height:Math.min(ys[row+1]-1,y1+3)-Math.max(ys[row],y0-3)+1});
  }
 }return out;
}
async function pack(name,frames,groupSize=8){
 const wall=name==='collapse',cell=wall?512:384,layers=[],packed=[];
 for(const [i,b] of frames.entries()){
  const group=frames.slice(Math.floor(i/groupSize)*groupSize,Math.floor(i/groupSize)*groupSize+groupSize);
  // Extra transparent headroom holds the raised arms at the RUN body's scale.
  // Fitting every frame to a 256 square would shrink a person when reaching up.
  const scale=wall?Math.min(488/Math.max(...frames.slice(0,4).map(q=>q.width)),488/Math.max(...frames.slice(0,4).map(q=>q.height))):Math.min(236/group[0].height,364/Math.max(...group.map(q=>q.width)),366/Math.max(...group.map(q=>q.height)));
  const w=Math.round(b.width*scale),h=Math.round(b.height*scale),left=Math.round((cell-w)/2),top=Math.round(cell*250/256)-h;
  const source=await replacement(name,i,b);
  layers.push({input:await sharp(source.path).extract({left:source.left,top:source.top,width:source.width,height:source.height}).resize(w,h).png().toBuffer(),left:i%4*cell+left,top:Math.floor(i/4)*cell+top});packed.push({...source,scale,packed:{left,top,width:w,height:h}});
 }
 const output='public/arcade/sprites/enemies/village-'+name+'-v10.webp';await sharp({create:{width:cell*4,height:cell*Math.ceil(frames.length/4),channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(output);
 await sharp(output).flatten({background:'#30333e'}).png().toFile(root+'/'+name+'-preview.png');registration[name]={output,cell,frames:packed};
}
for(const name of ['adults','children','elders','neighbors'])await pack('climb-'+name,await measure(root+'/sources/climb-'+name+'.png',4));
await pack('warning',await measure(root+'/sources/warning.png',2),4);
await pack('collapse',await measure(root+'/sources/collapse.png',2),4);
await fs.writeFile(root+'/registration.json',JSON.stringify(registration,null,2)+'\n');
const {data,info}=await sharp(registration.collapse.output).ensureAlpha().raw().toBuffer({resolveWithObject:true}),points=[];
for(let i=0;i<=16;i++){const t=i/16,x=Math.round(256+(t-.5)*245/320*512),ys=[];for(let dx=-3;dx<=3;dx++){let top=499;for(let y=0;y<500;y++)if(data[(y*info.width+x+dx)*4+3]>160){top=y;break;}ys.push(top);}ys.sort((a,b)=>a-b);points.push([t,Math.round((500-ys[3])*320/512)]);}
const height=Math.max(...points.map(q=>q[1]));await fs.writeFile('src/components/arcade/adventure/world/villageBlockadeArt.js','// Measured from collapse art by pack-village-v10.mjs.\nexport const VILLAGE_BLOCKADE_ART='+JSON.stringify({height,profile:points.map(([t,y])=>[t,height-y])})+';\n');
console.log('Packed 80 v10 cels and registered wall surface; technical crop/scale/assembly only.');
