import fs from 'node:fs/promises';
import sharp from 'sharp';
const root='context/arcade/village-5-2/revision-9',registration={};
async function measure(path,rows){
 const {data,info:{width:w,height:h}}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true}),alpha=(x,y)=>data[(y*w+x)*4+3],ys=[0],out=[];
 for(let row=1;row<rows;row++){const ideal=h*row/rows;let best=Math.round(ideal),score=Infinity;for(let y=Math.floor(ideal-h/rows*.22);y<ideal+h/rows*.22;y++){let n=0;for(let x=0;x<w;x++)if(alpha(x,y)>120)n++;const value=n+Math.abs(y-ideal)*.03;if(value<score){score=value;best=y;}}ys.push(best);}ys.push(h);
 for(let row=0;row<rows;row++){
  const xs=[0];for(let col=1;col<4;col++){const ideal=w*col/4;let best=Math.round(ideal),score=Infinity;for(let x=Math.floor(ideal-w/4*.14);x<ideal+w/4*.14;x++){let n=0;for(let y=ys[row];y<ys[row+1];y++)if(alpha(x,y)>120)n++;const value=n+Math.abs(x-ideal)*.03;if(value<score){score=value;best=x;}}xs.push(best);}xs.push(w);
  for(let col=0;col<4;col++){
  const left=xs[col],right=xs[col+1];let x0=right,x1=left,y0=ys[row+1],y1=ys[row];
  for(let y=ys[row];y<ys[row+1];y++)for(let x=left;x<right;x++)if(alpha(x,y)>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  out.push({path,left:Math.max(left,x0-3),top:Math.max(ys[row],y0-3),width:Math.min(right-1,x1+3)-Math.max(left,x0-3)+1,height:Math.min(ys[row+1]-1,y1+3)-Math.max(ys[row],y0-3)+1});
 }}return out;
}
async function pack(name,frames,actor=false){
 const layers=[],packed=[];
 for(const [i,b] of frames.entries()){
  const group=actor?frames.slice(Math.floor(i/4)*4,Math.floor(i/4)*4+4):frames.slice(0,12),target=actor&&i<8?172:236;
  const scale=Math.min(236/Math.max(...group.map(q=>q.width)),target/Math.max(...group.map(q=>q.height))),w=Math.round(b.width*scale),h=Math.round(b.height*scale),left=Math.round((256-w)/2),top=250-h;
  layers.push({input:await sharp(b.path).extract({left:b.left,top:b.top,width:b.width,height:b.height}).resize(w,h).png().toBuffer(),left:i%4*256+left,top:Math.floor(i/4)*256+top});packed.push({...b,scale,packed:{left,top,width:w,height:h}});
 }
 const output='public/arcade/sprites/enemies/village-'+name+'-v9.webp';await sharp({create:{width:1024,height:Math.ceil(frames.length/4)*256,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(output);
 await sharp(output).flatten({background:'#30333e'}).png().toFile(root+'/'+name+'-preview.png');registration[name]={output,cell:256,frames:packed};
}
await pack('hiding',await measure(root+'/sources/hiding.png',3),true);
await pack('orbit-pumpkin',await measure(root+'/sources/orbit-pumpkin.png',4));
await fs.writeFile(root+'/registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Packed 12 shelter/actor and 16 pumpkin frames; technical alpha crops, registration and WebP compression only.');
