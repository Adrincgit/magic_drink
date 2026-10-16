import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {registerActTwoActors} from './register-act-two-actors.mjs';
const source='C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646';
const saved='context/arcade/act-2-expansion/sources',out='public/arcade/act-two';
await fs.mkdir(saved,{recursive:true});await fs.mkdir(out,{recursive:true});
const files={garden:'b2956e09-d7d9-43d9-97dc-d678b419c23b',corn:'d7c9458c-3826-4c4a-b8da-8df363560dca',mansion:'5d70257c-3398-4945-b6b1-76b6a3d9b8c3',ring:'3fb5d8f1-3db3-46ce-b9d3-248ba3c1adc2',straw:'c5982692-8fb8-4845-8949-c44a43df1378',count:'19467ec3-9468-4803-ad21-44f55e905666',harlequin:'f9ff8406-4354-4324-8595-3ce8fa187530',props:'d21fa504-0d0c-4ac9-a321-1c358dbb46b0',enemies:'9177ae16-a7d5-4519-87bf-ae947109e1f2',effects:'c8fa720f-f797-43af-a7ad-af473740ab4e'};
const registrations={};
function bounds(data,w,h,threshold=40){let x0=w,y0=h,x1=0,y1=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>threshold){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}return{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1};}
for(const [name,id]of Object.entries(files)){
 const src=path.join(saved,name+'.png');await fs.copyFile(path.join(source,'exec-'+id+'.png'),src);
 const meta=await sharp(src).metadata();
 if(['garden','corn','mansion','ring'].includes(name)){await sharp(src).webp({quality:90}).toFile(path.join(out,name+'-v1.webp'));continue;}
 const rows=name==='enemies'?6:name==='props'?3:4,boxes=[];
 for(let i=0;i<rows*4;i++){
  const x0=Math.round(i%4*meta.width/4),y0=Math.round(Math.floor(i/4)*meta.height/rows),x1=Math.round((i%4+1)*meta.width/4),y1=Math.round((Math.floor(i/4)+1)*meta.height/rows);
  const raw=await sharp(src).extract({left:x0,top:y0,width:x1-x0,height:y1-y0}).ensureAlpha().raw().toBuffer();
  boxes.push({cell:{left:x0,top:y0,width:x1-x0,height:y1-y0},bounds:bounds(raw,x1-x0,y1-y0)});
 }
 if(name==='props'){
  // Different illustrations have different widths; authored crop regions preserve complete objects.
  const xr=[[0,.252,.515,.753,1],[0,.309,.568,.75,1],[0,.307,.566,.799,1]],yr=[0,.36,.695,1];
  for(let i=0;i<12;i++){const row=Math.floor(i/4),col=i%4,cell={left:Math.round(xr[row][col]*meta.width),top:Math.round(yr[row]*meta.height),width:Math.round(xr[row][col+1]*meta.width)-Math.round(xr[row][col]*meta.width),height:Math.round(yr[row+1]*meta.height)-Math.round(yr[row]*meta.height)};const raw=await sharp(src).extract(cell).ensureAlpha().raw().toBuffer();const b=bounds(raw,cell.width,cell.height);await sharp(src).extract({left:cell.left+b.left,top:cell.top+b.top,width:b.width,height:b.height}).webp({quality:94,alphaQuality:100}).toFile(path.join(out,'prop-'+i+'-v1.webp'));}
 }else{
  const cell=320,maxWidth=Math.max(...boxes.map(q=>q.bounds.width)),maxHeight=Math.max(...boxes.map(q=>q.bounds.height)),scale=Math.min(298/maxWidth,298/maxHeight),parts=[];
  for(let i=0;i<boxes.length;i++){
   const q=boxes[i],b=q.bounds,w=Math.round(b.width*scale),h=Math.round(b.height*scale),left=Math.round((cell-w)/2),top=312-h;
   const input=await sharp(src).extract({left:q.cell.left+b.left,top:q.cell.top+b.top,width:b.width,height:b.height}).resize(w,h).png().toBuffer();parts.push({input,left:i%4*cell+left,top:Math.floor(i/4)*cell+top});
   q.packed={left,top,width:w,height:h};
  }
  await sharp({create:{width:cell*4,height:cell*rows,channels:4,background:'#00000000'}}).composite(parts).webp({quality:94,alphaQuality:100}).toFile(path.join(out,name+'-v1.webp'));
  registrations[name]={source:meta.width+'x'+meta.height,scale,cell,boxes};
 }
}
await fs.writeFile('context/arcade/act-2-expansion/registration.json',JSON.stringify(registrations,null,2)+'\n');
await registerActTwoActors();
console.log('Saved four panoramas, five registered animation atlases, twelve props and original sources.');
