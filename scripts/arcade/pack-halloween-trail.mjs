import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/halloween-5-1/',map='public/arcade/maps/halloween/',enemies='public/arcade/sprites/enemies/';
fs.mkdirSync(map,{recursive:true});
for(const name of ['background','ground'])await sharp(root+'sources/'+name+'.png').webp({quality:94,alphaQuality:100}).toFile(map+name+'.webp');
// Generated prop rows have different heights. Equal-third cuts included tree
// roots in grave cels, so isolate the actual rows before registering each group.
const propFile=root+'sources/props.png',pm=await sharp(propFile).metadata(),propRows=[0,420,740,pm.height],propLayers=[];
for(let frame=0;frame<12;frame++){
 const row=Math.floor(frame/4),width=pm.width/4,height=propRows[row+1]-propRows[row];
 const {data,info}=await sharp(propFile).extract({left:frame%4*width,top:propRows[row],width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=width,y0=height,x1=0,y1=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 const grouped=frame>=4&&frame<=9,box=grouped?{left:0,top:0,width,height}:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1};
 const scale=grouped?250/width:Math.min(230/box.width,230/box.height),w=Math.round(box.width*scale),h=Math.round(box.height*scale);
 const left=grouped?3:Math.round(128-w/2),top=grouped?Math.round(250-(row===1?307:324)*scale):250-h;
 const input=await sharp(data,{raw:info}).extract(box).resize(w,h).png().toBuffer();propLayers.push({input,left:frame%4*256+left,top:Math.floor(frame/4)*256+top});
}
await sharp({create:{width:1024,height:768,channels:4,background:'#00000000'}}).composite(propLayers).webp({quality:96,alphaQuality:100}).toFile(map+'props.webp');
const registration={};
for(const name of ['zombie','ghost','tall']){
 const f=root+'sources/'+name+'.png',meta=await sharp(f).metadata(),cells=[];
 for(let frame=0;frame<12;frame++){
  const row=Math.floor(frame/4),rows=name==='ghost'?[0,322,603,meta.height]:[0,Math.round(meta.height/3),Math.round(meta.height*2/3),meta.height];
  const left=Math.round(frame%4*meta.width/4),top=rows[row],width=Math.round((frame%4+1)*meta.width/4)-left,height=rows[row+1]-top;
  const {data,info}=await sharp(f).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=width,y0=height,x1=0,y1=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  cells.push({data,info,width,box:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}});
 }
 const scale=Math.min(232/Math.max(...cells.map(c=>c.box.width)),(name==='tall'?228:210)/Math.max(...cells.slice(0,11).map(c=>c.box.height))),layers=[],records=[];
 for(const [frame,c]of cells.entries()){
  const w=Math.round(c.box.width*scale),h=Math.round(c.box.height*scale),left=Math.round(128+(c.box.left-c.width/2)*scale),top=250-h;
  if(left<0||left+w>256||top<0)throw new Error('Cel crosses gutter: '+name+' '+frame);
  const input=await sharp(c.data,{raw:c.info}).extract(c.box).resize(w,h).png().toBuffer();layers.push({input,left:frame%4*256+left,top:Math.floor(frame/4)*256+top});records.push({frame,left,top,w,h,scale});
 }
 await sharp({create:{width:1024,height:768,channels:4,background:'#00000000'}}).composite(layers).webp({quality:97,alphaQuality:100}).toFile(enemies+'nightmare-'+name+'.webp');registration[name]=records;
}
const torsoFile=root+'sources/zombie-torso.png',{data,info}=await sharp(torsoFile).ensureAlpha().raw().toBuffer({resolveWithObject:true});
let x0=info.width,y0=info.height,x1=0,y1=0,noseX=0,n=0;
for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
 const k=(y*info.width+x)*4,[r,g,b,a]=data.subarray(k,k+4);
 if(a>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 if(a>180&&x<info.width*.38&&y>info.height*.39&&y<info.height*.53&&r>180&&g<140&&b<90){noseX+=x;n++;}
}
if(!n)throw new Error('Missing zombie nose');
const scale=178/(y1-y0+1),w=Math.round((x1-x0+1)*scale),left=Math.round(100-(noseX/n-x0)*scale);
const input=await sharp(data,{raw:info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize(w,178).png().toBuffer();
await sharp({create:{width:256,height:256,channels:4,background:'#00000000'}}).composite([{input,left,top:40}]).webp({lossless:true}).toFile(enemies+'nightmare-zombie-torso.webp');
registration.zombieTorso={left,top:40,w,h:178,scale};fs.writeFileSync(root+'registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Packed Halloween panorama, ground, registered props and three creature sheets.');
