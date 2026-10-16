import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/halloween-5-1/revision/', out='public/arcade/';
const configs={
 flee:{rows:3,path:'sprites/enemies/red-clown-flee.webp',height:216},
 zombieWalk:{rows:2,path:'sprites/enemies/nightmare-zombie-walk.webp',height:216},
 crawler:{rows:2,path:'sprites/enemies/nightmare-crawler.webp',height:142},
 skeleton:{rows:3,path:'sprites/enemies/nightmare-bones.webp',parts:true},
 hexyFear:{rows:3,path:'sprites/hexy/fear.webp',cell:320,height:245},
 graves:{rows:3,cuts:[0,365,805,1086],path:'maps/halloween/graves.webp',props:true},
 wind:{rows:2,path:'maps/halloween/wind.webp',height:170},
 bellBoss:{rows:3,path:'sprites/enemies/nightmare-bell.webp',height:226},
};
const report={};
// Generated grids are approximate. Find the transparent gutters rather than
// cutting a hand, bell hat or bone at an assumed equal-cell boundary.
function gutter(sum,expected,radius){
 const runs=[];let start=null;const a=Math.max(0,Math.round(expected-radius)),b=Math.min(sum.length-1,Math.round(expected+radius));
 for(let i=a;i<=b;i++){if(sum[i]===0&&start===null)start=i;if((sum[i]>0||i===b)&&start!==null){runs.push([start,i-1]);start=null;}}
 const best=runs.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0];return best?Math.round((best[0]+best[1])/2):Math.round(expected);
}
for(const[name,q]of Object.entries(configs)){
 const file=root+'sources/'+name+'.png',meta=await sharp(file).metadata(),cells=[];
 const raw=await sharp(file).ensureAlpha().raw().toBuffer(),rowCounts=Array(meta.height).fill(0);
 for(let y=0;y<meta.height;y++)for(let x=0;x<meta.width;x++)if(raw[(y*meta.width+x)*4+3]>100)rowCounts[y]++;
 const rows=[0,...Array.from({length:q.rows-1},(_,i)=>gutter(rowCounts,(i+1)*meta.height/q.rows,meta.height*.08)),meta.height],columns=[];
 for(let row=0;row<q.rows;row++){
  const counts=Array(meta.width).fill(0);for(let y=rows[row];y<rows[row+1];y++)for(let x=0;x<meta.width;x++)if(raw[(y*meta.width+x)*4+3]>100)counts[x]++;
  columns.push([0,...[1,2,3].map(i=>gutter(counts,i*meta.width/4,meta.width*.07)),meta.width]);
 }
 for(let i=0;i<q.rows*4;i++){
  const row=Math.floor(i/4),left=columns[row][i%4],top=rows[row];
  const width=columns[row][i%4+1]-left,height=rows[row+1]-top;
  const {data,info}=await sharp(file).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=width,y0=height,x1=0,y1=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>60){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  cells.push({data,info,box:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}});
 }
 const cell=q.cell||256,baseline=cell===320?300:250,layers=[],records=[];
 const groupScale=group=>Math.min((cell-20)/Math.max(...group.map(c=>c.box.width)),(q.height||232)/Math.max(...group.map(c=>c.box.height)));
 const scale=groupScale(cells),propScales=q.props?[groupScale(cells.slice(0,4)),groupScale(cells.slice(4,8))]:null;
 for(const[i,c]of cells.entries()){
  const k=q.parts?groupScale([c]):q.props?propScales[i<4?0:i<8?1:i===8?0:1]:scale;
  const w=Math.round(c.box.width*k),h=Math.round(c.box.height*k),left=Math.round(cell/2-w/2),top=baseline-h;
  const input=await sharp(c.data,{raw:c.info}).extract(c.box).resize(w,h).png().toBuffer();
  layers.push({input,left:i%4*cell+left,top:Math.floor(i/4)*cell+top});records.push({frame:i,left,top,w,h,source:c.box,scale:k});
 }
 await sharp({create:{width:cell*4,height:cell*q.rows,channels:4,background:'#00000000'}}).composite(layers).webp({quality:98,alphaQuality:100}).toFile(out+q.path);
 report[name]=records;
}
fs.writeFileSync(root+'registration.json',JSON.stringify(report,null,2)+'\n');
const parts=report.skeleton.map(({frame,left,top,w,h})=>({x:frame%4*256+left,y:Math.floor(frame/4)*256+top,w,h}));
fs.writeFileSync('src/components/arcade/adventure/render/nightmarePartsAtlas.js','export const BONE_PARTS='+JSON.stringify(parts)+';\n');
await sharp(root+'sources/forest.png').webp({quality:94}).toFile(out+'maps/halloween/forest.webp');
console.log('Packed eight transparent sheets and the forest panorama using measured gutters.');
