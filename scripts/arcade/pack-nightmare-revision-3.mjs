import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/halloween-5-1/revision-3/',out='public/arcade/sprites/enemies/',report={};
function gutter(counts,expected,radius){
 const runs=[];let start=null;const a=Math.max(0,Math.round(expected-radius)),b=Math.min(counts.length-1,Math.round(expected+radius));
 for(let i=a;i<=b;i++){if(counts[i]===0&&start===null)start=i;if((counts[i]>0||i===b)&&start!==null){runs.push([start,i-1]);start=null;}}
 const best=runs.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0];return best?Math.round((best[0]+best[1])/2):Math.round(expected);
}
for(const [name,rows,parts,file]of [['skeleton',3,true,'nightmare-skeleton-cartoon-v3'],['defeats',4,false,'nightmare-zombie-defeat-v3'],['ghost',3,false,'nightmare-clown-ghost-v3']]){
 const input=root+'sources/'+(name==='skeleton'&&fs.existsSync(root+'sources/skeleton-clean.png')?'skeleton-clean':name)+'.png';
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true}),rc=Array(info.height).fill(0);
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>100)rc[y]++;
 const cuts=[0,...Array.from({length:rows-1},(_,i)=>gutter(rc,(i+1)*info.height/rows,info.height*.085)),info.height],cells=[];
 for(let row=0;row<rows;row++){
  const cc=Array(info.width).fill(0);for(let y=cuts[row];y<cuts[row+1];y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>100)cc[x]++;
  const columns=[0,...[1,2,3].map(i=>gutter(cc,i*info.width/4,info.width*.055)),info.width];
  for(let col=0;col<4;col++){
   let left=info.width,top=info.height,right=-1,bottom=-1;
   for(let y=cuts[row];y<cuts[row+1];y++)for(let x=columns[col];x<columns[col+1];x++)if(data[(y*info.width+x)*4+3]>8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   if(right<left)throw Error('Empty atlas cell '+name+' '+row+' '+col);
   cells.push({left,top,width:right-left+1,height:bottom-top+1});
  }
 }
 if(name==='skeleton'){
  const file=root+'sources/forearm.png',{data:raw,info:meta}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});let left=meta.width,top=meta.height,right=0,bottom=0;
  for(let y=0;y<meta.height;y++)for(let x=0;x<meta.width;x++)if(raw[(y*meta.width+x)*4+3]>8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  cells[5]={left,top,width:right-left+1,height:bottom-top+1,input:file};
 }
 const scale=Math.min(236/Math.max(...cells.map(q=>q.width)),224/Math.max(...cells.map(q=>q.height))),layers=[];report[name]=[];
 for(const [i,q]of cells.entries()){
  const k=parts?Math.min(236/q.width,232/q.height):scale,w=Math.round(q.width*k),h=Math.round(q.height*k),x=i%4*256+Math.round((256-w)/2),y=Math.floor(i/4)*256+250-h;
  const {left,top,width,height}=q;layers.push({input:await sharp(q.input||input).extract({left,top,width,height}).resize(w,h).png().toBuffer(),left:x,top:y});report[name].push({x,y,w,h,scale:k,source:q});
 }
 await sharp({create:{width:1024,height:rows*256,channels:4,background:'#00000000'}}).composite(layers).webp({quality:98,alphaQuality:100}).toFile(out+file+'.webp');
}
fs.writeFileSync(root+'registration.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync('src/components/arcade/adventure/render/nightmareSkeletonCartoonAtlas.js','export const SKELETON_CARTOON_PARTS='+JSON.stringify(report.skeleton.map(({x,y,w,h})=>({x,y,w,h})))+';\n');
console.log('Packed cartoon skeleton, 16 defeat poses and 12 spectral clown poses; alpha and shared animation scale preserved.');
