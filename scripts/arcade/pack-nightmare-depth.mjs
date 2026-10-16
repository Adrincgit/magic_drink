import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/halloween-5-1/depth-rework/',out='public/arcade/';
const specs={
 walkFixed:{rows:2,path:'sprites/enemies/nightmare-zombie-walk.webp',height:216},
 zombie:{rows:4,path:'sprites/enemies/nightmare-injured.webp',height:216},
 actions:{rows:3,path:'sprites/enemies/nightmare-actions.webp',height:216},
 fleeFall:{rows:3,path:'sprites/enemies/red-clown-fall.webp',height:216},
 effects:{rows:3,path:'sprites/enemies/nightmare-fx.webp',height:226,individual:true},
 skulls:{rows:1,path:'sprites/enemies/nightmare-skulls.webp',height:224,individual:true},
 bell:{rows:3,path:'sprites/enemies/nightmare-bell.webp',height:226},
};
// Posed characters do not share horizontal row baselines. These bounds were
// measured against connected alpha silhouettes, including loose shoes.
const measured={
 actions:[[6,78,305,287],[327,24,412,312],[747,67,373,303],[1176,43,354,340],[11,382,378,314],[399,403,283,294],[695,499,414,207],[1107,540,422,163],[19,698,303,299],[344,758,400,238],[757,778,327,220],[1114,810,393,188]],
 fleeFall:[[20,55,307,326],[332,102,366,253],[727,141,307,244],[1073,169,364,212],[12,507,347,182],[366,500,356,190],[762,433,298,265],[1174,394,260,294],[17,854,348,190],[405,770,284,280],[737,738,320,315],[1109,687,309,375]],
 bell:[[0,0,336,349],[336,0,410,358],[746,0,355,363],[1101,0,347,363],[0,349,335,343],[335,357,420,333],[755,364,343,319],[1098,363,350,309],[0,694,362,392],[362,689,378,397],[740,680,352,406],[1092,673,356,413]],
};
function gutter(sum,at,radius){
 const runs=[];let first=null;for(let i=Math.max(0,Math.round(at-radius));i<Math.min(sum.length,at+radius);i++){
  if(sum[i]===0&&first===null)first=i;if(sum[i]!==0&&first!==null){runs.push([first,i]);first=null;}
 }
 const run=runs.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0];return run?Math.round((run[0]+run[1])/2):Math.round(at);
}
function boxOf(data,width,height){let left=width,top=height,right=0,bottom=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>60){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}return{left,top,width:right-left+1,height:bottom-top+1};}
const report={};
for(const[name,q]of Object.entries(specs)){
 const path=root+'sources/'+name+'.png',meta=await sharp(path).metadata(),raw=await sharp(path).ensureAlpha().raw().toBuffer(),counts=Array(meta.height).fill(0);
 for(let y=0;y<meta.height;y++)for(let x=0;x<meta.width;x++)if(raw[(y*meta.width+x)*4+3]>100)counts[y]++;
 const rows=[0,...Array.from({length:q.rows-1},(_,i)=>gutter(counts,(i+1)*meta.height/q.rows,meta.height*.085)),meta.height],cells=[];
 for(let r=0;r<q.rows;r++){
  const col=Array(meta.width).fill(0);for(let y=rows[r];y<rows[r+1];y++)for(let x=0;x<meta.width;x++)if(raw[(y*meta.width+x)*4+3]>100)col[x]++;
  const columns=[0,...[1,2,3].map(i=>gutter(col,i*meta.width/4,meta.width*.065)),meta.width];
  for(let j=0;j<4;j++){const m=measured[name]?.[r*4+j],cut=m?{left:m[0],top:m[1],width:m[2],height:m[3]}:{left:columns[j],top:rows[r],width:columns[j+1]-columns[j],height:rows[r+1]-rows[r]}, {data,info}=await sharp(path).extract(cut).ensureAlpha().raw().toBuffer({resolveWithObject:true});cells.push({data,info,cut,box:boxOf(data,info.width,info.height)});}
 }
 const scale=Math.min(236/Math.max(...cells.map(c=>c.box.width)),q.height/Math.max(...cells.map(c=>c.box.height))),layers=[],records=[];
 for(const[i,c]of cells.entries()){
  const k=q.individual?Math.min(234/c.box.width,q.height/c.box.height):scale,w=Math.round(c.box.width*k),h=Math.round(c.box.height*k),left=Math.round(128-w/2),top=250-h;
  const input=await sharp(c.data,{raw:c.info}).extract(c.box).resize(w,h).png().toBuffer();layers.push({input,left:i%4*256+left,top:Math.floor(i/4)*256+top});records.push({frame:i,x:i%4*256+left,y:Math.floor(i/4)*256+top,w,h,cut:c.cut,box:c.box,scale:k});
 }
 await sharp({create:{width:1024,height:q.rows*256,channels:4,background:'#00000000'}}).composite(layers).webp({quality:98,alphaQuality:100}).toFile(out+q.path);report[name]=records;
}
// Scenic objects are used at their native aspect ratios, never squashed into
// character cells. Measured cuts reflect the taller first row of this atlas.
const scenicCuts=[
 [0,0,435,675],[435,0,313,675],[748,0,416,675],[1164,0,372,675],
 [0,680,378,344],[378,680,501,344],[879,680,278,344],[1157,680,379,344],
];
for(const[i,[left,top,width,height]]of scenicCuts.entries()){
 const {data,info}=await sharp(root+'sources/scenery.png').extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true}),box=boxOf(data,width,height);
 await sharp(data,{raw:info}).extract(box).webp({quality:98,alphaQuality:100}).toFile(out+'maps/halloween/depth-'+i+'.webp');
}
for(const[name,target]of [['gate','side-gate'],['branchTree','branch-trunk'],['bluff','bluff']]){
 const {data,info}=await sharp(root+'sources/'+name+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true}),box=boxOf(data,info.width,info.height);
 await sharp(data,{raw:info}).extract(box).webp({quality:98,alphaQuality:100}).toFile(out+'maps/halloween/'+target+'.webp');report[name]=box;
}
fs.writeFileSync(root+'registration.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync('src/components/arcade/adventure/render/nightmareDepthAtlas.js','export const NIGHTMARE_DEPTH_ATLAS='+JSON.stringify(Object.fromEntries(Object.entries(report).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.map(({x,y,w,h})=>({x,y,w,h}))])))+';\n');
console.log('Packed seven actor sheets, eight depth cutouts, a side gate and branch trunk.');
