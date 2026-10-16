import fs from 'node:fs/promises';
import sharp from 'sharp';
const file='context/arcade/grand-harlequin/anime-art.json';
const manifest=JSON.parse(await fs.readFile(file,'utf8'));
await fs.mkdir(manifest.sourceDirectory,{recursive:true});
for(const [kind,spec]of Object.entries(manifest.assets)){
 const source=manifest.sourceDirectory+'/'+spec.source;
 try{await fs.access(source);}catch{await fs.copyFile(spec.generatedSource,source);}
 const metadata=await sharp(source).metadata(),parts=[];
 const cw=kind==='grin'?384:kind==='surrounds'?512:384,ch=kind==='grin'?448:384;
 for(let row=0;row<spec.rows;row++)for(let col=0;col<spec.columns;col++){
  const left=Math.round(col*metadata.width/spec.columns),top=spec.rowEdges?.[row]??Math.round(row*metadata.height/spec.rows);
  const width=Math.round((col+1)*metadata.width/spec.columns)-left,height=(spec.rowEdges?.[row+1]??Math.round((row+1)*metadata.height/spec.rows))-top;
  // Fixed grid registration preserves the advancing waves and expression poses.
  // Leave explicit clear gutters; preserve the generator's original soft alpha.
  const w=kind==='grin'?300:cw-16,h=kind==='grin'?270:ch-16;
  const input=await sharp(source).extract({left,top,width,height}).resize(w,h,{fit:'fill'}).png().toBuffer();
  parts.push({input,left:col*cw+(kind==='grin'?42:8),top:row*ch+(kind==='grin'?76:8)});
 }
 await sharp({create:{width:cw*spec.columns,height:ch*spec.rows,channels:4,background:'#00000000'}}).composite(parts).webp({lossless:true}).toFile(spec.output);
 spec.cell={width:cw,height:ch};spec.frames=spec.columns*spec.rows;
 console.log(kind,spec.frames,spec.output);
}
await fs.writeFile(file,JSON.stringify(manifest,null,2)+'\n');
