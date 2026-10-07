import fs from 'node:fs';
import sharp from 'sharp';

const [mountains,valley,near]=process.argv.slice(2);
if(!mountains||!valley||!near)throw new Error('Pass the three generated PNG paths.');
const folder='public/arcade/maps/riverwoods/';
fs.mkdirSync(folder,{recursive:true});
for(const [name,input]of [['mountains',mountains],['valley',valley]]){
 await sharp(input).webp({quality:90,alphaQuality:100}).toFile(folder+name+'.webp');
}
const {width,height}=await sharp(near).metadata(),cell=Math.floor(width/4),frames=[];
for(let i=0;i<4;i++)frames.push({input:await sharp(near).extract({left:i*cell,top:0,width:cell,height}).resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer(),left:i*512,top:0});
await sharp({create:{width:2048,height:512,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(frames).webp({quality:90,alphaQuality:100}).toFile(folder+'near.webp');
for(const name of ['mountains','valley','near']){const path=folder+name+'.webp';console.log({path,bytes:fs.statSync(path).size,...await sharp(path).metadata()});}
