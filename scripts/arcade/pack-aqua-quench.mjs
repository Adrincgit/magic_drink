import fs from 'node:fs/promises';
import sharp from 'sharp';
const manifest=JSON.parse(await fs.readFile('context/arcade/ember-fort/aqua-quench.json','utf8'));
const input=sharp(manifest.source),meta=await input.metadata(),width=Math.floor(meta.width/4);
// Each painted row has different padding. Register contact points during packing,
// so changing animation cells never moves a splash off the ground.
const rows=[[0,324],[324,716],[716,944],[944,1280]],layers=[];
for(let row=0;row<4;row++)for(let frame=0;frame<4;frame++){
 const [top,bottom]=rows[row].map(y=>Math.round(y*meta.height/1280));
 const cell=await input.clone().extract({left:Math.round(frame*meta.width/4),top,width,height:bottom-top}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=width,right=0,up=cell.info.height,down=0;
 for(let y=0;y<cell.info.height;y++)for(let x=0;x<width;x++)if(cell.data[(y*width+x)*4+3]>20){left=Math.min(left,x);right=Math.max(right,x);up=Math.min(up,y);down=Math.max(down,y);}
 const art=sharp(cell.data,{raw:cell.info}).extract({left,top:up,width:right-left+1,height:down-up+1});
 const sized=await art.resize(row===0?{width:224,height:172,fit:'inside'}:row===1?{width:224,height:224,fit:'inside'}:row===2?{width:224,height:64,fit:'inside'}:{width:100,height:160,fit:'inside'}).png().toBuffer({resolveWithObject:true});
 const anchor=row<2?228:128,spriteTop=row<2?anchor-sized.info.height:anchor-Math.round(sized.info.height/2);
 layers.push({input:sized.data,left:frame*256+Math.round((256-sized.info.width)/2),top:row*256+spriteTop});
}
await sharp({create:{width:1024,height:1024,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(manifest.output);
console.log(manifest.output);
