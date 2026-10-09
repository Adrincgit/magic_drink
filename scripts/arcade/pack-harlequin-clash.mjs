import fs from 'node:fs';
import sharp from 'sharp';
const dir='context/arcade/grand-harlequin/',spec=JSON.parse(fs.readFileSync(dir+'clash-art.json','utf8')),out='public/arcade/sprites/bosses/harlequin/';
const report=[];
async function save(input,name){const path=out+name+'.webp';await sharp(input).webp({quality:94,alphaQuality:100}).toFile(path);const m=await sharp(path).metadata();report.push({path,width:m.width,height:m.height,alpha:m.hasAlpha});}
await save(await sharp(spec.assets.mid.source).resize(2048,1024).png().toBuffer(),'mid');
await save(await sharp(spec.assets.portrait.source).resize({height:1200}).png().toBuffer(),'ultimate-portrait');
const src=spec.assets.ultimate.source,{data,info}=await sharp(src).ensureAlpha().raw().toBuffer({resolveWithObject:true}),frames=[];
for(let i=0;i<8;i++){
 const left=Math.round(i%4*info.width/4),top=Math.round(Math.floor(i/4)*info.height/2),width=Math.round((i%4+1)*info.width/4)-left,height=Math.round((Math.floor(i/4)+1)*info.height/2)-top;
 let bottom=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[((top+y)*info.width+left+x)*4+3]>80)bottom=Math.max(bottom,y);
 const scale=.95,w=Math.round(width*scale),h=Math.round((bottom+1)*scale);
 frames.push({input:await sharp(src).extract({left,top,width,height:bottom+1}).resize(w,h).png().toBuffer(),left:(i%4)*512+Math.round((512-w)/2),top:Math.floor(i/4)*512+490-h});
}
await save(await sharp({create:{width:2048,height:1024,channels:4,background:'#00000000'}}).composite(frames).png().toBuffer(),'ultimate');
const fx=spec.assets.effects.source,m=await sharp(fx).metadata(),effects=[],beams=[];
for(let row=0;row<3;row++)for(let col=0;col<4;col++){
 const left=Math.round(col*m.width/4),top=Math.round(row*m.height/3),width=Math.round((col+1)*m.width/4)-left,height=Math.round((row+1)*m.height/3)-top;
 const cell=await sharp(fx).extract({left,top,width,height}).png().toBuffer();
 effects.push({input:await sharp(cell).resize(256,256).png().toBuffer(),left:col*256,top:row*256});
 if(row===0)beams.push({input:await sharp(cell).trim({threshold:12}).resize(1024,256,{fit:'fill'}).png().toBuffer(),left:0,top:col*256});
}
await save(await sharp({create:{width:1024,height:768,channels:4,background:'#00000000'}}).composite(effects).png().toBuffer(),'ultimate-effects');
await save(await sharp({create:{width:1024,height:1024,channels:4,background:'#00000000'}}).composite(beams).png().toBuffer(),'ultimate-beam');
fs.writeFileSync(dir+'clash-assets.json',JSON.stringify(report,null,2)+'\n');console.log(report);
