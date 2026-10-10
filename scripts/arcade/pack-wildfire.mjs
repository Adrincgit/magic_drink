import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const manifestPath='context/arcade/ember-fort/wildfire-art.json';
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
async function atlas(key,rows,dest,{size=256,feet=false}={}){
 const source=manifest.jobs[key].source,m=await sharp(source).metadata(),tiles=[];
 for(let i=0;i<4*rows;i++){
  const rowCuts=key==='breather'?[0,256,514,770,1007,1249,1536]:null;
  const left=Math.round(i%4*m.width/4),right=Math.round((i%4+1)*m.width/4),top=rowCuts?.[Math.floor(i/4)]??Math.round(Math.floor(i/4)*m.height/rows),bottom=rowCuts?.[Math.floor(i/4)+1]??Math.round((Math.floor(i/4)+1)*m.height/rows);
  let img=sharp(source).extract({left,top,width:right-left,height:bottom-top});
  if(feet){
   const {data,info}=await img.ensureAlpha().raw().toBuffer({resolveWithObject:true});let minY=info.height,maxY=0;
   for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80){minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
   const h=maxY-minY+1,w=info.width,scale=key==='walk'?.545:.93;
   const input=await sharp(source).extract({left,top:top+minY,width:w,height:h}).resize(Math.round(w*scale),Math.round(h*scale)).png().toBuffer();
   tiles.push({input,left:i%4*size+Math.floor((size-w*scale)/2),top:Math.floor(i/4)*size+size-6-Math.round(h*scale)});
  }else tiles.push({input:await img.resize(size,size,{fit:'fill'}).png().toBuffer(),left:i%4*size,top:Math.floor(i/4)*size});
 }
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 await sharp({create:{width:size*4,height:size*rows,channels:4,background:'#00000000'}}).composite(tiles).webp({quality:96,alphaQuality:100}).toFile(dest);
 manifest.jobs[key].output=dest;
}
await atlas('breather',6,'public/arcade/sprites/enemies/fire-breather.webp',{feet:true});
await atlas('walk',2,'public/arcade/sprites/enemies/fire-breather-walk.webp',{feet:true});
await atlas('flame',2,'public/arcade/sprites/effects/ember-flames.webp',{size:384});
await atlas('bush',1,'public/arcade/maps/ember-trail/bushes.webp',{size:384});
await atlas('core',2,'public/arcade/sprites/bosses/ember-fort/mechanisms.webp',{size:384});
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(Object.values(manifest.jobs).map(q=>q.output));
