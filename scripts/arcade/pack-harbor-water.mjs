import fs from 'node:fs';
import sharp from 'sharp';
const sources=JSON.parse(fs.readFileSync('context/arcade/harbor-barge/water-sources.json','utf8'));
const {data,info}=await sharp(sources.jet).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const bands=[[0,194],[194,370],[370,545],[545,728],[728,920]],pieces=[];
for(const [i,[top,bottom]]of bands.entries()){
 let lo=bottom,hi=top;for(let y=top;y<bottom;y++)for(let x=1480;x<1510;x++)if(data[(y*info.width+x)*4+3]>180){lo=Math.min(lo,y);hi=Math.max(hi,y);}
 const centre=Math.round((lo+hi)/2),h=bottom-top,input=await sharp(sources.jet).extract({left:0,top,width:1536,height:h}).png().toBuffer();
 pieces.push({input,left:0,top:i*224+112-(centre-top)});
}
await sharp({create:{width:1536,height:1120,channels:4,background:'#00000000'}}).composite(pieces).webp({quality:94,alphaQuality:100}).toFile('public/arcade/sprites/effects/harbor-jet.webp');
const m=await sharp(sources.details).metadata(),tiles=[];
for(let row=0;row<4;row++)for(let col=0;col<4;col++){
 const left=Math.round(col*m.width/4),top=Math.round(row*m.height/4),width=Math.round((col+1)*m.width/4)-left,height=Math.round((row+1)*m.height/4)-top;
 const input=await sharp(sources.details).extract({left,top,width,height}).resize(256,256).png().toBuffer();tiles.push({input,left:col*256,top:row*256});
}
await sharp({create:{width:1024,height:1024,channels:4,background:'#00000000'}}).composite(tiles).webp({quality:94,alphaQuality:100}).toFile('public/arcade/sprites/effects/harbor-water-details.webp');
for(const name of ['harbor-jet','harbor-water-details']){const p='public/arcade/sprites/effects/'+name+'.webp',m=await sharp(p).metadata();console.log({path:p,width:m.width,height:m.height,alpha:m.hasAlpha});}
