import fs from 'node:fs';
import sharp from 'sharp';
const record=JSON.parse(fs.readFileSync('context/arcade/ember-fort/atmosphere-art.json','utf8'));
for(const key of ['smoke','birds']){
 const job=record.jobs.find(q=>q.key===key);
 await sharp(job.source).webp({quality:93,alphaQuality:100}).toFile('public/arcade/maps/ember-trail/'+key+'.webp');
}
const job=record.jobs.find(q=>q.key==='hexy-heat-fixed');
if(job){
 const m=await sharp(job.source).metadata(),frames=[];
 // Hair projects farther left than the wand below it. Two measured gutter
 // bands preserve both without including a strip of the neighbouring pose.
 const bands=[{top:0,bottom:620,cuts:[0,380,760,1140,1536]},{top:620,bottom:m.height,cuts:job.columnCuts}];
 for(let i=0;i<4;i++){
  const left=Math.min(...bands.map(b=>b.cuts[i])),width=Math.max(...bands.map(b=>b.cuts[i+1]))-left;
  const input=await sharp({create:{width,height:m.height,channels:4,background:'#00000000'}}).composite(await Promise.all(bands.map(async b=>({input:await sharp(job.source).extract({left:b.cuts[i],top:b.top,width:b.cuts[i+1]-b.cuts[i],height:b.bottom-b.top}).png().toBuffer(),left:b.cuts[i]-left,top:b.top})))).png().toBuffer();
  const {data}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=width,x1=0,y0=m.height,y1=0;
  for(let y=0;y<m.height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>90){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  let l=width,r=0;for(let y=y1-20;y<=y1;y++)for(let x=x0;x<=x1;x++)if(data[(y*width+x)*4+3]>120){l=Math.min(l,x);r=Math.max(r,x);}
  frames.push({input,width,height:m.height,x0,x1,y0,y1,foot:(l+r)/2});
 }
 const k=Math.min(245/Math.max(...frames.map(q=>q.y1-q.y0+1)),...frames.flatMap(q=>[150/Math.max(1,q.foot-q.x0),150/Math.max(1,q.x1-q.foot)]));
 const parts=[];
 for(const [i,q]of frames.entries()){
  const w=Math.round(q.width*k),h=Math.round(q.height*k),left=Math.round(160-q.foot*k),top=Math.round(300-q.y1*k);
  const resized=await sharp(q.input).resize(w,h).png().toBuffer();
  const crop={left:Math.max(0,-left),top:Math.max(0,-top),width:Math.min(w,320-left)-Math.max(0,-left),height:Math.min(h,320-top)-Math.max(0,-top)};
  parts.push({input:await sharp(resized).extract(crop).png().toBuffer(),left:i*320+Math.max(0,left),top:Math.max(0,top)});
 }
 await sharp({create:{width:1280,height:320,channels:4,background:'#00000000'}}).composite(parts).webp({quality:95,alphaQuality:100}).toFile('public/arcade/sprites/hexy/heat.webp');
}
