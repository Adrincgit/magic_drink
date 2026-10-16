import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='context/arcade/village-5-2/revision-4',registration={};
for(const spec of ['run-adults','run-children','run-elders','run-neighbors','adults','children','elders','neighbors','witch-flight','candy-spell','journey'].map(key=>({key,root,source:key,rows:key.startsWith('run-')||key==='candy-spell'?4:key==='journey'?3:6,cell:key==='journey'?512:256,output:'public/arcade/'+(key==='journey'?'maps/village/':'sprites/enemies/')+'village-'+key+'-v4.webp'}))){
 const {root,key,rows,cell,source,output}=spec,path=`${root}/sources/${source}.png`,{data,info:{width:w,height:h}}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true}),alpha=(x,y)=>data[(y*w+x)*4+3];
 const ys=[0];for(let r=1;r<rows;r++){const ideal=Math.round(h*r/rows);let best=ideal,score=Infinity;for(let y=Math.floor(ideal-h/rows*.25);y<ideal+h/rows*.25;y++){let n=0;for(let x=0;x<w;x++)if(alpha(x,y)>28)n++;const v=n+Math.abs(y-ideal)*.01;if(v<score){score=v;best=y;}}ys.push(best);}ys.push(h);
 const frames=[];for(let row=0;row<rows;row++){
  const xs=[0];for(let col=1;col<4;col++){const ideal=Math.round(w*col/4);let best=ideal,score=Infinity;for(let x=Math.floor(ideal-w/4*.22);x<ideal+w/4*.22;x++){let n=0;for(let y=ys[row];y<ys[row+1];y++)if(alpha(x,y)>28)n++;const v=n+Math.abs(x-ideal)*.01;if(v<score){score=v;best=x;}}xs.push(best);}xs.push(w);
  for(let col=0;col<4;col++){let x0=xs[col+1],x1=xs[col],y0=ys[row+1],y1=ys[row];for(let y=ys[row];y<ys[row+1];y++)for(let x=xs[col];x<xs[col+1];x++)if(alpha(x,y)>28){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}frames.push({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1});}
 }
 const layers=[];for(const [i,b]of frames.entries()){
  const group=key.startsWith('run-')?frames.slice(Math.floor(i/8)*8,Math.floor(i/8)*8+8):['adults','children','elders','neighbors'].includes(key)?frames.slice(Math.floor(i/12)*12,Math.floor(i/12)*12+12):key==='witch-flight'?frames:key==='journey'?(i<4?[b]:frames.slice(4)):frames.slice(Math.floor(i/4)*4,Math.floor(i/4)*4+4);
  const scale=Math.min((cell-20)/Math.max(...group.map(q=>q.width)),(cell-20)/Math.max(...group.map(q=>q.height))),width=Math.round(b.width*scale),height=Math.round(b.height*scale);
  layers.push({input:await sharp(path).extract(b).resize(width,height).png().toBuffer(),left:i%4*cell+Math.round((cell-width)/2),top:Math.floor(i/4)*cell+(key==='candy-spell'&&(i<4||i>=12)?Math.round((cell-height)/2):Math.round(cell*250/256)-height)});
 }
 await sharp({create:{width:cell*4,height:cell*rows,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(output);
 await sharp(output).resize({width:1000}).flatten({background:'#36333d'}).png().toFile(`${root}/${key}-preview.png`);registration[key]={output,frames,ys};
}
await sharp(root+'/sources/night-sky.png').webp({quality:93}).toFile('public/arcade/maps/village/night-sky-v4.webp');
await sharp(root+'/sources/road-entry.png').webp({quality:93}).toFile('public/arcade/maps/village/road-entry-v4.webp');
await fs.writeFile(root+'/registration.json',JSON.stringify(registration,null,2));
console.log('Packed 212 painted animation and environment cells plus night sky.');
