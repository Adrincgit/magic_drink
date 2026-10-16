import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='context/arcade/village-5-2/revision-5',registration={};
const selected=process.env.VILLAGE_PACK?.split(',');
for(const [key,rows] of [['witch-absorb',6],['witch-cast',4],['soul-pumpkin',6],['resistance',6],['soul-effects',4]]){
 if(selected&&!selected.includes(key))continue;
 const path=`${root}/sources/${key}.png`,{data,info:{width:w,height:h}}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const a=(x,y)=>data[(y*w+x)*4+3],ys=[0];
 for(let row=1;row<rows;row++){
  const ideal=h*row/rows;let best=Math.round(ideal),score=Infinity;
  for(let y=Math.floor(ideal-h/rows*.42);y<ideal+h/rows*.42;y++){let count=0;for(let x=0;x<w;x++)if(a(x,y)>160)count++;const value=count+Math.abs(y-ideal)*.02;if(value<score){score=value;best=y;}}
  ys.push(best);
 }ys.push(h);
 const frames=[];
 for(let row=0;row<rows;row++){
  const xs=[0];for(let col=1;col<4;col++){const ideal=w*col/4;let best=Math.round(ideal),score=Infinity;for(let x=Math.floor(ideal-w/4*.15);x<ideal+w/4*.15;x++){let count=0;for(let y=ys[row];y<ys[row+1];y++)if(a(x,y)>160)count++;const value=count+Math.abs(x-ideal)*.02;if(value<score){score=value;best=x;}}xs.push(best);}xs.push(w);
  for(let col=0;col<4;col++){
   let x0=xs[col+1],x1=xs[col],y0=ys[row+1],y1=ys[row];
   for(let y=ys[row];y<ys[row+1];y++)for(let x=xs[col];x<xs[col+1];x++)if(a(x,y)>160){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
   x0=Math.max(xs[col],x0-8);x1=Math.min(xs[col+1]-1,x1+8);y0=Math.max(ys[row],y0-8);y1=Math.min(ys[row+1]-1,y1+8);
   frames.push({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1,row,col});
  }
 }
 const cell=256,layers=[];
 for(const [i,b] of frames.entries()){
  const groupSize=key==='witch-absorb'?12:key==='witch-cast'?8:key==='resistance'?(i<16?8:4):key==='soul-effects'?4:24;
  const group=frames.slice(Math.floor(i/groupSize)*groupSize,Math.floor(i/groupSize)*groupSize+groupSize);
  const scale=Math.min(234/Math.max(...group.map(q=>q.width)),234/Math.max(...group.map(q=>q.height))),width=Math.round(b.width*scale),height=Math.round(b.height*scale);
  const centered=key==='soul-effects';
  layers.push({input:await sharp(path).extract({left:b.left,top:b.top,width:b.width,height:b.height}).resize(width,height).png().toBuffer(),left:i%4*cell+Math.round((cell-width)/2),top:Math.floor(i/4)*cell+(centered?Math.round((cell-height)/2):250-height)});
  Object.assign(b,{scale,packed:{width,height,left:Math.round((cell-width)/2),top:centered?Math.round((cell-height)/2):250-height}});
 }
 const output=`public/arcade/sprites/enemies/village-${key}-v5.webp`;
 await sharp({create:{width:1024,height:cell*rows,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(output);
 await sharp(output).resize({width:1024}).flatten({background:'#30333e'}).png().toFile(`${root}/${key}-preview.png`);registration[key]={output,frames,ys};
}
for(const name of ['berm','gate','country-road','road-entry']){
 if(selected&&!selected.includes(name))continue;
 const output=`public/arcade/maps/village/${name}-v5.webp`;await sharp(`${root}/sources/${name}.png`).webp({quality:94,alphaQuality:100}).toFile(output);registration[name]={output};
}
let previous={};try{previous=JSON.parse(await fs.readFile(root+'/registration.json','utf8'));}catch{}
await fs.writeFile(root+'/registration.json',JSON.stringify({...previous,...registration},null,2));
console.log('Packed '+Object.keys(registration).join(', '));
