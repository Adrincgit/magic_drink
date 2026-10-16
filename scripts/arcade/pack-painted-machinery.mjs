import fs from 'node:fs';
import sharp from 'sharp';
const source='context/arcade/painted-machinery/sources/';
const jobs=[
 {name:'fort',cols:4,rows:2,out:'public/arcade/sprites/bosses/ember-fort/deploy-painted.webp',width:384,height:384,padding:8},
 {name:'barge',file:'barge-refined.png',cols:2,rows:2,out:'public/arcade/sprites/bosses/barge/integrated-painted.webp',width:768,height:512,padding:14},
 {name:'tent',cols:4,rows:2,out:'public/arcade/maps/circus/camp-wind-painted.webp',width:512,height:384,padding:6},
 {name:'acrobat',cols:4,rows:4,out:'public/arcade/sprites/enemies/acrobat-run-painted.webp',width:256,height:256,padding:10},
 {name:'acrobat-air',cols:4,rows:2,out:'public/arcade/sprites/enemies/acrobat-air-painted.webp',width:256,height:256,padding:10},
];
const report=[];
for(const job of jobs){
 const file=source+(job.file||job.name+'.png'),meta=await sharp(file).metadata(),cells=[];
 let rowCuts=Array.from({length:job.rows+1},(_,i)=>Math.round(i*meta.height/job.rows));
 if(job.name.startsWith('acrobat')){
  const raw=await sharp(file).ensureAlpha().raw().toBuffer(),counts=[];
  for(let y=0;y<meta.height;y++){let n=0;for(let x=0;x<meta.width;x++)if(raw[(y*meta.width+x)*4+3]>120)n++;counts.push(n);}
  for(let row=1;row<job.rows;row++){
   const center=meta.height*row/job.rows,low=Math.round(center-70),high=Math.round(center+70);let start=low,best=[low,low];
   for(let y=low;y<=high+1;y++){if(y<=high&&counts[y]<12)continue;if(y-start>best[1]-best[0])best=[start,y];start=y+1;}
   rowCuts[row]=Math.round((best[0]+best[1])/2);
  }
 }
 for(let frame=0;frame<job.cols*job.rows;frame++){
  const col=frame%job.cols,row=Math.floor(frame/job.cols),left=Math.round(col*meta.width/job.cols),top=rowCuts[row],right=Math.round((col+1)*meta.width/job.cols),bottom=rowCuts[row+1];
  const crop=await sharp(file).extract({left,top,width:right-left,height:bottom-top}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=crop.info.width,y0=crop.info.height,x1=0,y1=0;
  for(let y=0;y<crop.info.height;y++)for(let x=0;x<crop.info.width;x++)if(crop.data[(y*crop.info.width+x)*4+3]>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  cells.push({crop,box:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1},frame});
 }
 // One uniform scale across the sequence; only register cell placement.
 const largestW=Math.max(...cells.map(c=>c.box.width)),largestH=Math.max(...cells.map(c=>c.box.height)),scale=Math.min((job.name.startsWith('acrobat')?172:job.width-job.padding*2)/largestW,(job.name.startsWith('acrobat')?150:job.height-job.padding*2)/largestH);
 const layers=[];
 for(const q of cells){
  const w=Math.round(q.box.width*scale),h=Math.round(q.box.height*scale),input=await sharp(q.crop.data,{raw:q.crop.info}).extract(q.box).resize(w,h).png().toBuffer();
  let offset=Math.round((job.width-w)/2);
  if(job.name==='acrobat'){
   let sum=0,n=0;
   for(let y=q.box.top;y<q.box.top+q.box.height*.65;y++)for(let x=q.box.left;x<q.box.left+q.box.width*.65;x++){const i=(y*q.crop.info.width+x)*4,[r,g,b,a]=q.crop.data.subarray(i,i+4);if(a>180&&r>140&&g<100&&b<100&&r>g*1.7){sum+=x;n++;}}
   if(n)offset=Math.round(68-(sum/n-q.box.left)*scale);
  }
  layers.push({input,left:q.frame%job.cols*job.width+offset,top:Math.floor(q.frame/job.cols)*job.height+job.height-job.padding-h});
 }
 fs.mkdirSync(new URL('.',new URL('file:///'+process.cwd().replaceAll('\\','/')+'/'+job.out)),{recursive:true});
 await sharp({create:{width:job.width*job.cols,height:job.height*job.rows,channels:4,background:'#00000000'}}).composite(layers).webp({quality:95,alphaQuality:100}).toFile(job.out);
 report.push({...job,scale,rowCuts,bounds:cells.map(q=>q.box)});console.log(job.name,job.out);
}
fs.writeFileSync('context/arcade/painted-machinery/atlas-registration.json',JSON.stringify(report,null,2)+'\n');
