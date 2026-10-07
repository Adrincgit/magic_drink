import sharp from 'sharp';
import fs from 'node:fs/promises';
const [air,foam,meadowTree,riverTree]=process.argv.slice(2);
if(!air)throw new Error('Pass the airborne release PNG; pier foam and the two foreground trees are optional.');
async function cells(source,cols,rows,size,out){
 const m=await sharp(source).metadata(),w=Math.floor(m.width/cols),h=Math.floor(m.height/rows),layers=[];
 for(let i=0;i<cols*rows;i++){
  const sourceCell=sharp(source).extract({left:i%cols*w,top:Math.floor(i/cols)*h,width:w,height:h});
  const input=await sourceCell.resize(size,size,{fit:'contain',position:'bottom',background:'#00000000'}).png().toBuffer();
  layers.push({input,left:i*size,top:0});
 }
 await fs.mkdir(out.slice(0,out.lastIndexOf('/')),{recursive:true});
 await sharp({create:{width:size*cols*rows,height:size,channels:4,background:'#00000000'}}).composite(layers).webp({quality:92,alphaQuality:100}).toFile(out);
 console.log(out,await sharp(out).metadata());
}
async function airFrames(source){
 const {data,info:{width:w,height:h}}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const seen=new Uint8Array(w*h),components=[];
 // Extract complete alpha-connected drawings. The generated 2x2 sheet's
 // shoes cross its nominal middle gutter; slicing equal cells cuts them off.
 for(let p=0;p<w*h;p++){
  if(seen[p]||!data[p*4+3])continue;
  const stack=[p],pixels=[];seen[p]=1;let x0=w,x1=0,y0=h,y1=0;
  while(stack.length){
   const n=stack.pop(),x=n%w,y=Math.floor(n/w);pixels.push(n);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   for(const j of [x>0?n-1:-1,x<w-1?n+1:-1,y>0?n-w:-1,y<h-1?n+w:-1])if(j>=0&&!seen[j]&&data[j*4+3]){seen[j]=1;stack.push(j);}
  }
  if(pixels.length>10000)components.push({pixels,x0,x1,y0,y1});
 }
 if(components.length!==4)throw new Error(`Expected four complete drawings, found ${components.length}.`);
 components.sort((a,b)=>Math.floor(a.y0/(h/2))-Math.floor(b.y0/(h/2))||a.x0-b.x0);
 const layers=[],registration=[],scale=.43;
 for(const [i,q] of components.entries()){
  const width=q.x1-q.x0+1,height=q.y1-q.y0+1,raw=Buffer.alloc(width*height*4);let sx0=w,sx1=0,sy0=h,sy1=0;
  for(const n of q.pixels){
   const x=n%w,y=Math.floor(n/w),dest=((y-q.y0)*width+x-q.x0)*4;data.copy(raw,dest,n*4,n*4+4);
   // Only the golden wand star in the far right, above the shoes; excludes
   // the hat badge, skin, buckles and low-alpha antialiasing fringe.
   if(x>q.x0+width*.82&&y>q.y0+height*.34&&y<q.y0+height*.54&&data[n*4]>180&&data[n*4+1]>140&&data[n*4+2]<100&&data[n*4+3]>200){sx0=Math.min(sx0,x);sx1=Math.max(sx1,x);sy0=Math.min(sy0,y);sy1=Math.max(sy1,y);}
  }
  if(sx0>sx1)throw new Error(`Missing wand star in frame ${i}.`);
  const tip=[(sx0+sx1)/2,(sy0+sy1)/2],left=Math.round(282-(tip[0]-q.x0)*scale),top=Math.round(142-(tip[1]-q.y0)*scale);
  const input=await sharp(raw,{raw:{width,height,channels:4}}).resize({width:Math.round(width*scale)}).png().toBuffer(),meta=await sharp(input).metadata();
  if(left<4||top<4||left+meta.width>318||top+meta.height>318)throw new Error(`Frame ${i} exceeds its safe cell bounds: ${JSON.stringify({left,top,w:meta.width,h:meta.height,tip})}`);
  layers.push({input,left:i*320+left,top});registration.push({frame:i,sourceBounds:[q.x0,q.y0,width,height],sourceTip:tip,scale,left,top,tip:[282,142]});
 }
 const out='public/arcade/sprites/hexy/air-super-release.webp';
 await sharp({create:{width:1280,height:320,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toFile(out);
 await fs.writeFile('context/arcade/stage-polish/air-registration.json',JSON.stringify(registration,null,2)+'\n');
 console.log(out,registration);
}
await airFrames(air);
if(foam)await cells(foam,2,2,512,'public/arcade/sprites/effects/pier-foam.webp');
for(const [source,out] of [[meadowTree,'public/arcade/maps/meadow/near-tree.webp'],[riverTree,'public/arcade/maps/riverwoods/near-tree.webp']]){
 if(source)await sharp(source).webp({quality:92,alphaQuality:100}).toFile(out);
}
