import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/halloween-5-1/checkpoints-6-10/',out='public/arcade/sprites/enemies/';
const report={};
function gutter(counts,expected,radius){
 const runs=[];let start=null;
 const a=Math.max(0,Math.round(expected-radius)),b=Math.min(counts.length-1,Math.round(expected+radius));
 for(let i=a;i<=b;i++){if(counts[i]===0&&start===null)start=i;if((counts[i]>0||i===b)&&start!==null){runs.push([start,i-1]);start=null;}}
 const best=runs.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0];
 return best?Math.round((best[0]+best[1])/2):Math.round(expected);
}
for(const [name,rows,parts,file] of [['skeleton',3,true,'nightmare-skeleton-parts.webp'],['recovery',1,false,'nightmare-zombie-recover.webp']]){
 const input=root+'sources/'+name+'.png',{data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const rc=Array(info.height).fill(0);
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>100)rc[y]++;
 const rowCuts=[0,...Array.from({length:rows-1},(_,i)=>gutter(rc,(i+1)*info.height/rows,info.height*.08)),info.height],cells=[];
 for(let row=0;row<rows;row++){
  const cc=Array(info.width).fill(0);
  for(let y=rowCuts[row];y<rowCuts[row+1];y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>100)cc[x]++;
  const colCuts=[0,...[1,2,3].map(i=>gutter(cc,i*info.width/4,info.width*.07)),info.width];
  for(let col=0;col<4;col++){
   let x0=info.width,y0=info.height,x1=0,y1=0;
   for(let y=rowCuts[row];y<rowCuts[row+1];y++)for(let x=colCuts[col];x<colCuts[col+1];x++)if(data[(y*info.width+x)*4+3]>60){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
   cells.push({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1});
  }
 }
 const scale=Math.min(236/Math.max(...cells.map(q=>q.width)),216/Math.max(...cells.map(q=>q.height))),layers=[],records=[];
 for(const [i,q] of cells.entries()){
  const k=parts?Math.min(236/q.width,232/q.height):scale,w=Math.round(q.width*k),h=Math.round(q.height*k),left=i%4*256+Math.round(128-w/2),top=Math.floor(i/4)*256+250-h;
  layers.push({input:await sharp(input).extract(q).resize(w,h).png().toBuffer(),left,top});records.push({x:left,y:top,w,h,source:q,scale:k});
 }
 await sharp({create:{width:1024,height:rows*256,channels:4,background:'#00000000'}}).composite(layers).webp({quality:98,alphaQuality:100}).toFile(out+file);
 report[name]=records;
}
fs.writeFileSync(root+'registration.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync('src/components/arcade/adventure/render/nightmareSkeletonAtlas.js','export const SKELETON_PARTS='+JSON.stringify(report.skeleton.map(({x,y,w,h})=>({x,y,w,h})))+';\n');
console.log('Packed skeleton parts with preserved aspect ratios and four recovery poses with shared scale.');
