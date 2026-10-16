import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='context/arcade/popcorn-panic',source=root+'/sources/fx.png';
await sharp(root+'/sources/can.png').trim({threshold:12}).resize({height:480}).webp({quality:95,alphaQuality:100}).toFile('public/arcade/sprites/pickups/popcorn-panic.webp');
const {data,info:{width:w,height:h}}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),alpha=(x,y)=>data[(y*w+x)*4+3];
const cuts=[0];for(let row=1;row<4;row++){const ideal=Math.round(h*row/4),radius=Math.round(h/4*.25);let best=ideal,score=Infinity;for(let y=ideal-radius;y<=ideal+radius;y++){let n=0;for(let x=0;x<w;x++)if(alpha(x,y)>20)n++;const v=n+Math.abs(y-ideal)*.006;if(v<score){score=v;best=y;}}cuts.push(best);}cuts.push(h);
const frames=[];
for(let row=0;row<4;row++){
 const columns=[0];for(let col=1;col<4;col++){const ideal=Math.round(w*col/4),radius=Math.round(w/4*.32);let best=ideal,score=Infinity;for(let x=ideal-radius;x<=ideal+radius;x++){let n=0;for(let y=cuts[row];y<cuts[row+1];y++)if(alpha(x,y)>20)n++;const v=n+Math.abs(x-ideal)*.006;if(v<score){score=v;best=x;}}columns.push(best);}columns.push(w);
 for(let col=0;col<4;col++){let x0=columns[col+1],y0=cuts[row+1],x1=columns[col],y1=cuts[row];for(let y=cuts[row];y<cuts[row+1];y++)for(let x=columns[col];x<columns[col+1];x++)if(alpha(x,y)>20){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}frames.push({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1});}
}
const composite=[];
for(let i=0;i<16;i++){
 const group=frames.slice(i<8?0:i<12?8:12,i<8?8:i<12?12:16),scale=Math.min(224/Math.max(...group.map(q=>q.width)),224/Math.max(...group.map(q=>q.height))),b=frames[i],width=Math.round(b.width*scale),height=Math.round(b.height*scale);
 composite.push({input:await sharp(source).extract(b).resize(width,height).png().toBuffer(),left:i%4*256+(i<8?16:Math.round((256-width)/2)),top:Math.floor(i/4)*256+Math.round((256-height)/2)});
}
const out='public/arcade/sprites/effects/popcorn-panic.webp';
await sharp({create:{width:1024,height:1024,channels:4,background:'#00000000'}}).composite(composite).webp({lossless:true}).toFile(out);
await sharp(out).resize(1000).flatten({background:'#292d34'}).png().toFile(root+'/fx-preview.png');
await fs.writeFile(root+'/registration.json',JSON.stringify({cuts,frames,anchor:[16,128],coneWidth:224},null,2));
console.log('Packed Popcorn Panic can and 16 effect frames.');
