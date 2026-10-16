import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='context/arcade/village-5-2/revision-6',registration={};
const selected=process.env.VILLAGE_PACK?.split(',');
for(const [key,rows] of [['hexy-pumpkin',2]]){
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
  const groupSize=8;
  const group=frames.slice(Math.floor(i/groupSize)*groupSize,Math.floor(i/groupSize)*groupSize+groupSize);
  const scale=Math.min(234/Math.max(...group.map(q=>q.width)),234/Math.max(...group.map(q=>q.height))),width=Math.round(b.width*scale),height=Math.round(b.height*scale);
  const centered=key==='soul-effects';
  layers.push({input:await sharp(path).extract({left:b.left,top:b.top,width:b.width,height:b.height}).resize(width,height).png().toBuffer(),left:i%4*cell+Math.round((cell-width)/2),top:Math.floor(i/4)*cell+(centered?Math.round((cell-height)/2):250-height)});
  Object.assign(b,{scale,packed:{width,height,left:Math.round((cell-width)/2),top:centered?Math.round((cell-height)/2):250-height}});
 }
 const output=`public/arcade/sprites/enemies/village-${key}-v6.webp`;
 await sharp({create:{width:1024,height:cell*rows,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(output);
 await sharp(output).resize({width:1024}).flatten({background:'#30333e'}).png().toFile(`${root}/${key}-preview.png`);registration[key]={output,frames,ys};
}

for(const name of ['pumpkin','clouds']){
 const output=name==='pumpkin'?'public/arcade/sprites/enemies/village-pumpkin-v6.webp':'public/arcade/maps/village/clouds-v6.webp';
 await sharp(root+'/sources/'+name+'.png').webp({lossless:true}).toFile(output);registration[name]={output};
}
const source=root+'/sources/pillars.png',raw=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{width,height}=raw.info;
for(const [name,lo,hi]of [['near',0,Math.floor(width/2)],['far',Math.floor(width/2),width]]){
 let x0=hi,y0=height,x1=lo,y1=0;
 for(let y=0;y<height;y++)for(let x=lo;x<hi;x++)if(raw.data[(y*width+x)*4+3]>160){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 const box={left:Math.max(lo,x0-8),top:Math.max(0,y0-8),width:Math.min(hi,x1+9)-Math.max(lo,x0-8),height:Math.min(height,y1+9)-Math.max(0,y0-8)},output='public/arcade/maps/village/pillar-'+name+'-v6.webp';
 await sharp(source).extract(box).webp({lossless:true}).toFile(output);registration['pillar-'+name]={output,box};
}
await fs.writeFile(root+'/registration.json',JSON.stringify(registration,null,2));
console.log('Packed v6 scene artwork and sprites');
