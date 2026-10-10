import fs from 'node:fs';
import sharp from 'sharp';
const file='context/arcade/ember-fort/grounding-art.json',manifest=JSON.parse(fs.readFileSync(file,'utf8'));
for(const job of manifest.jobs){
 const meta=await sharp(job.source).metadata(),tiles=[];
 if(job.name==='floorFine'){
  job.outputs=[];
  for(let row=0;row<2;row++){
   const top=Math.round(row*meta.height/2),height=Math.round((row+1)*meta.height/2)-top;
   const file=`public/arcade/maps/ember-trail/floor-fine-${row}.webp`;
   await sharp(job.source).extract({left:0,top,width:meta.width,height}).webp({quality:96}).toFile(file);job.outputs.push(file);
  }continue;
 }
 if(job.name==='fortWindows'){
  // Same circular rim registration, even when its gun reaches outside it.
  for(let i=0;i<8;i++){
   const left=i%4*384,top=Math.floor(i/4)*512+(i<4?90:56);
   const input=await sharp(job.source).extract({left,top,width:384,height:384}).resize(256,256).png().toBuffer();
   tiles.push({input,left:i%4*256,top:Math.floor(i/4)*256});
  }
  job.output='public/arcade/sprites/bosses/ember-fort/windows.webp';
 }else if(job.name==='balloonDefeat'){
  const {data,info}=await sharp(job.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const scale=.52;
  for(let i=0;i<8;i++){
   const left=Math.round(i%4*meta.width/4),right=Math.round((i%4+1)*meta.width/4),top=Math.round(Math.floor(i/4)*meta.height/2),bottom=Math.round((Math.floor(i/4)+1)*meta.height/2);
   let lowest=top;for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(data[(y*info.width+x)*4+3]>120)lowest=Math.max(lowest,y);
   const height=lowest-top+1,w=Math.round((right-left)*scale),h=Math.round(height*scale);
   const input=await sharp(job.source).extract({left,top,width:right-left,height}).resize(w,h).png().toBuffer();
   tiles.push({input,left:i%4*256+Math.floor((256-w)/2),top:Math.floor(i/4)*256+250-h});
  }
  job.output='public/arcade/sprites/enemies/ember-balloon-defeat.webp';
 }else if(job.name==='torchAttack'){
  const {data,info}=await sharp(job.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // Register to the existing walk face (61px), not the full silhouette.
  // Raised torches must not shrink the clown to fit an animation's bounds.
  const scale=61/76;
  const cuts=Array.from({length:4},(_,col)=>{
   const l=Math.round(col*meta.width/4),r=Math.round((col+1)*meta.width/4),rows=[0];
   for(let row=1;row<4;row++){
    const nominal=meta.height*row/4;let best=Math.round(nominal),cost=Infinity;
    for(let y=Math.floor(nominal-40);y<nominal+40;y++){
     let count=0;for(let x=l;x<r;x++)if(data[(y*info.width+x)*4+3]>120)count++;
     count+=Math.abs(y-nominal)*.001;if(count<cost){best=y;cost=count;}
    }
    rows.push(best);
   }return [...rows,meta.height];
  });
  for(let i=0;i<16;i++){
   const l=Math.round(i%4*meta.width/4),r=Math.round((i%4+1)*meta.width/4),t=cuts[i%4][Math.floor(i/4)],b=cuts[i%4][Math.floor(i/4)+1];
   let x0=r,x1=l,y0=b,y1=t;
   for(let y=t;y<b;y++)for(let x=l;x<r;x++)if(data[(y*info.width+x)*4+3]>120){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
   const w=Math.round((x1-x0+1)*scale),h=Math.round((y1-y0+1)*scale),left=Math.round(128+(x0-(l+r)/2)*scale);
   const input=await sharp(job.source).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize(w,h).png().toBuffer();
   tiles.push({input,left:i%4*256+left,top:Math.floor(i/4)*256+250-h});
  }
  job.output='public/arcade/sprites/enemies/ember-torch-attack.webp';
 }else continue;
 await sharp({create:{width:1024,height:job.name==='torchAttack'?1024:512,channels:4,background:'#00000000'}}).composite(tiles).webp({quality:96,alphaQuality:100}).toFile(job.output);
 console.log(job.name,job.output);
}
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
