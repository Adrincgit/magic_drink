import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/halloween-5-1/revision-4/',input=root+'sources/skeleton.png';
const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
function cut(counts,expected,radius){
 const runs=[];let start=null;const a=Math.round(expected-radius),b=Math.round(expected+radius);
 for(let i=a;i<=b;i++){if(!counts[i]&&start===null)start=i;if((counts[i]||i===b)&&start!==null){runs.push([start,i-1]);start=null;}}
 const q=runs.sort((a,b)=>Math.abs((a[0]+a[1])/2-expected)-Math.abs((b[0]+b[1])/2-expected))[0];return q?Math.round((q[0]+q[1])/2):Math.round(expected);
}
const rc=Array(info.height).fill(0);for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80)rc[y]++;
const rows=[0,...Array.from({length:5},(_,i)=>cut(rc,(i+1)*info.height/6,info.height/6*.23)),info.height],cells=[];
for(let row=0;row<6;row++){
 const cc=Array(info.width).fill(0);for(let y=rows[row];y<rows[row+1];y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80)cc[x]++;
 const cols=[0,...[1,2,3].map(i=>cut(cc,i*info.width/4,info.width*.04)),info.width];
 for(let col=0;col<4;col++){
  let left=info.width,top=info.height,right=-1,bottom=-1;
  for(let y=rows[row];y<rows[row+1];y++)for(let x=cols[col];x<cols[col+1];x++)if(data[(y*info.width+x)*4+3]>8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right<left)throw Error('Empty pose '+row+','+col);
  let footLeft=right,footRight=left;for(let y=bottom-16;y<=bottom;y++)for(let x=left;x<=right;x++)if(data[(y*info.width+x)*4+3]>100){footLeft=Math.min(footLeft,x);footRight=Math.max(footRight,x);}
  cells.push({left,top,width:right-left+1,height:bottom-top+1,anchor:row<5?(footLeft+footRight)/2:(left+right)/2});
 }
}
const radius=Math.max(...cells.map(q=>Math.max(q.anchor-q.left,q.left+q.width-q.anchor))),scale=Math.min(118/radius,224/Math.max(...cells.map(q=>q.height))),layers=[],registration=[];
for(const [i,q]of cells.entries()){
 const {left,top,width,height}=q,w=Math.round(width*scale),h=Math.round(height*scale),x=i%4*256+Math.round(128-(q.anchor-left)*scale),y=Math.floor(i/4)*256+250-h;
 layers.push({input:await sharp(input).extract({left,top,width,height}).resize(w,h).png().toBuffer(),left:x,top:y});registration.push({x,y,w,h,scale,source:q});
}
await sharp({create:{width:1024,height:1536,channels:4,background:'#00000000'}}).composite(layers).webp({quality:98,alphaQuality:100}).toFile('public/arcade/sprites/enemies/nightmare-skeleton-frames-v4.webp');
await sharp(root+'sources/mist.png').resize({width:1600}).webp({quality:95,alphaQuality:100}).toFile('public/arcade/maps/halloween/mist-v4.webp');
fs.writeFileSync(root+'registration.json',JSON.stringify({skeleton:registration},null,2)+'\n');
console.log('Packed 24 complete skeleton poses and transparent mist.');
