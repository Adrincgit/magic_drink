import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='context/arcade/village-5-2/revision-7',registration={};
// Atlas assembly only: each accepted character sheet already contains its
// complete painted gait. Preserve the generated pixels and alpha.
for(const [group,a,b] of [['adults','baker','mother'],['children','boy','girl'],['elders','grandfather','grandmother'],['neighbors','blacksmith','braids']]){
 await sharp({create:{width:1774,height:1774,channels:4,background:'#00000000'}}).composite([{input:`${root}/sources/gait-${a}.png`,left:0,top:0},{input:`${root}/sources/gait-${b}.png`,left:0,top:887}]).png().toFile(`${root}/sources/run-${group}-final.png`);
}
for(const [key,rows] of [['pumpkin-clean',6],['witch-ground',6],['witch-air',6],['spell-fx',6],['pumpkin-finish',2],...['adults','children','elders','neighbors'].map(n=>['run-'+n,4])]){
 const path=`${root}/sources/${key}${key.startsWith('run-')?'-final':''}.png`,{data,info:{width:w,height:h}}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const a=(x,y)=>data[(y*w+x)*4+3],ys=[0];
 for(let row=1;row<rows;row++){const ideal=h*row/rows;let best=Math.round(ideal),score=Infinity;for(let y=Math.floor(ideal-h/rows*.28);y<ideal+h/rows*.28;y++){let count=0;for(let x=0;x<w;x++)if(a(x,y)>100)count++;const value=count+Math.abs(y-ideal)*.02;if(value<score){score=value;best=y;}}ys.push(best);}ys.push(h);
 const frames=[];
 for(let row=0;row<rows;row++){
  const xs=[0];for(let col=1;col<4;col++){const ideal=w*col/4;let best=Math.round(ideal),score=Infinity;for(let x=Math.floor(ideal-w/4*.17);x<ideal+w/4*.17;x++){let count=0;for(let y=ys[row];y<ys[row+1];y++)if(a(x,y)>100)count++;const value=count+Math.abs(x-ideal)*.02;if(value<score){score=value;best=x;}}xs.push(best);}xs.push(w);
  for(let col=0;col<4;col++){let x0=xs[col+1],x1=xs[col],y0=ys[row+1],y1=ys[row];for(let y=ys[row];y<ys[row+1];y++)for(let x=xs[col];x<xs[col+1];x++)if(a(x,y)>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}x0=Math.max(xs[col],x0-5);x1=Math.min(xs[col+1]-1,x1+5);y0=Math.max(ys[row],y0-5);y1=Math.min(ys[row+1]-1,y1+5);frames.push({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1});}
 }
 const layers=[];
 for(const [i,b] of frames.entries()){
  const group=key.startsWith('run-')?frames.slice(Math.floor(i/8)*8,Math.floor(i/8)*8+8):key==='pumpkin-finish'?frames.slice(Math.floor(i/4)*4,Math.floor(i/4)*4+4):frames;
  const scale=Math.min(234/Math.max(...group.map(q=>q.width)),234/Math.max(...group.map(q=>q.height))),width=Math.round(b.width*scale),height=Math.round(b.height*scale);
  const center=key==='spell-fx'||key==='pumpkin-finish'&&i>=4,left=Math.round((256-width)/2),top=center?Math.round((256-height)/2):250-height;
  layers.push({input:await sharp(path).extract(b).resize(width,height).png().toBuffer(),left:i%4*256+left,top:Math.floor(i/4)*256+top});Object.assign(b,{scale,packed:{width,height,left,top}});
 }
 const output=`public/arcade/sprites/enemies/village-${key}-v7.webp`;
 await sharp({create:{width:1024,height:256*rows,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(output);
 await sharp(output).flatten({background:'#30333e'}).png().toFile(`${root}/${key}-preview.png`);registration[key]={output,frames,ys};
}
await fs.writeFile(root+'/registration.json',JSON.stringify(registration,null,2));
console.log('Packed v7: clean bodies, separate spell effects, full run sheets and pumpkin finish.');
