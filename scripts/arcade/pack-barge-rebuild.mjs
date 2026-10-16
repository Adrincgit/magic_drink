import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/barge-rebuild/',source=root+'sources/';
fs.mkdirSync(source,{recursive:true});
for(const name of ['barge','damage']){
 if(!fs.existsSync(source+name+'.png'))continue;
 await sharp(source+name+'.png').resize(1536,1024).webp({quality:97,alphaQuality:100}).toFile('public/arcade/sprites/bosses/barge/pressure-'+name+'.webp');
}
const report=[];
for(const name of ['launcher']){
 const file=source+name+'.png',meta=await sharp(file).metadata(),cells=[];
 // The generator's transparent gutters are offset from nominal quarters.
 // Cut within those gutters so no adjacent wheel pixels leak into a cell.
 const cuts=name==='launcher'?[0,561,1108,1628,meta.width]:[0,1,2,3,4].map(i=>Math.round(i*meta.width/4));
 for(let i=0;i<4;i++){
  const left=cuts[i],right=cuts[i+1];
  const {data,info}=await sharp(file).extract({left,top:0,width:right-left,height:meta.height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=info.width,y0=info.height,x1=0,y1=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  cells.push({data,info,box:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}});
 }
 const cell=384,scale=name==='launcher'?Math.min(290/Math.max(...cells.map(c=>c.box.width)),285/Math.max(...cells.map(c=>c.box.height))):Math.min(338/Math.max(...cells.map(c=>c.box.width)),235/Math.max(...cells.map(c=>c.box.height)));
 const layers=[];
 for(const [i,c]of cells.entries()){
  const width=Math.round(c.box.width*scale),height=Math.round(c.box.height*scale),input=await sharp(c.data,{raw:c.info}).extract(c.box).resize(width,height).png().toBuffer();
  layers.push({input,left:i*cell+Math.round((cell-width)/2),top:name==='launcher'?372-height:Math.round((cell-height)/2)});
 }
 const out='public/arcade/sprites/enemies/'+(name==='clown'?'cannon-flight':'cannon-launcher')+'-painted.webp';
 await sharp({create:{width:cell*4,height:cell,channels:4,background:'#00000000'}}).composite(layers).webp({quality:97,alphaQuality:100}).toFile(out);
 report.push({name,out,cell,scale,boxes:cells.map(c=>c.box)});
}
fs.writeFileSync(root+'registration.json',JSON.stringify(report,null,2)+'\n');
console.log('Registered pressure barge and cannon actor assets.');
