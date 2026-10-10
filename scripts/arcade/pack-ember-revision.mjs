import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const record=JSON.parse(fs.readFileSync('context/arcade/ember-fort/art.json','utf8'));
const source=key=>record.jobs.find(q=>q.key===key).source;
const report=[];
async function output(buffer,dest){fs.mkdirSync(path.dirname(dest),{recursive:true});await sharp(buffer).webp({quality:95,alphaQuality:100}).toFile(dest);const m=await sharp(dest).metadata();report.push({path:dest,width:m.width,height:m.height,hasAlpha:m.hasAlpha});}
async function atlas(key,cols,rows,dest,{size=256,base=size-6,targetWidth=size-18,anchor=.5,boots=false,scale:specified,rowCuts,columnCuts,frameRegions={}}={}){
 const m=await sharp(source(key)).metadata(),frames=[];
 for(let i=0;i<cols*rows;i++){
  const row=Math.floor(i/cols),col=i%cols,cuts=columnCuts?.[row];
  const left=cuts?.[col]??Math.round(col*m.width/cols),top=rowCuts?.[row]??Math.round(row*m.height/rows),width=Math.max((cuts?.[col+1]??Math.round((col+1)*m.width/cols))-left,...(frameRegions[i]??[]).map(r=>r.left+r.width)),height=(rowCuts?.[row+1]??Math.round((row+1)*m.height/rows))-top;
  const regions=frameRegions[i];
  const input=regions?await sharp({create:{width,height,channels:4,background:'#00000000'}}).composite(await Promise.all(regions.map(async r=>({input:await sharp(source(key)).extract({left:left+r.left,top:top+r.top,width:r.width,height:r.height}).png().toBuffer(),left:r.left,top:r.top})))).png().toBuffer():await sharp(source(key)).extract({left,top,width,height}).png().toBuffer();
  const {data}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=width,y0=height,x1=0,y1=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++){if(data[(y*width+x)*4+3]>65){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}
  let foot=(x0+x1)/2;
  if(boots){let l=width,r=0;for(let y=Math.max(0,y1-14);y<=y1;y++)for(let x=x0;x<=x1;x++){const n=(y*width+x)*4;if(data[n+3]>100&&(key==='fire-hit'?data[n]<110&&data[n+1]<110&&data[n+2]<150:data[n]>data[n+1]*1.35&&data[n]>data[n+2]*1.15)){l=Math.min(l,x);r=Math.max(r,x);}}if(r>l)foot=(l+r)/2;}
  frames.push({input,width,height,x0,x1,y0,y1,foot});
 }
 // Keep the fixed foot registration without clipping a leaning head or wide stance.
 const scale=Math.min(specified??Infinity,targetWidth/Math.max(...frames.map(f=>f.x1-f.x0+1)),(base-10)/Math.max(...frames.map(f=>f.y1-f.y0+1)),...frames.map(f=>(size*anchor-4)/Math.max(1,f.foot-f.x0)),...frames.map(f=>(size*(1-anchor)-4)/Math.max(1,f.x1-f.foot)));
 const tiles=[];
 for(let i=0;i<frames.length;i++){
  const f=frames[i],w=Math.round(f.width*scale),h=Math.round(f.height*scale),left=Math.round(size*anchor-f.foot*scale),top=Math.round(base-f.y1*scale);
  const resized=await sharp(f.input).resize(w,h).png().toBuffer(),crop={left:Math.max(0,-left),top:Math.max(0,-top),width:Math.min(w,size-left)-Math.max(0,-left),height:Math.min(h,size-top)-Math.max(0,-top)};
  tiles.push({input:await sharp(resized).extract(crop).png().toBuffer(),left:i%cols*size+Math.max(0,left),top:Math.floor(i/cols)*size+Math.max(0,top)});
 }
 await output(await sharp({create:{width:cols*size,height:rows*size,channels:4,background:'#00000000'}}).composite(tiles).png().toBuffer(),dest);
}
// Measured transparent gutters, rather than an assumed equal generated grid.
// Row two extends below 2/3 of the source; equal slices cut off its boots.
await atlas('drummer',4,3,'public/arcade/sprites/bosses/barge/drummer.webp',{size:384,base:368,targetWidth:350,anchor:.68,boots:true,scale:.9,rowCuts:[0,370,765,1086],columnCuts:[[0,377,726,1097,1448],[0,372,730,1096,1448],[0,391,756,1130,1448]]});
// The third-row hose and leaning hat interleave horizontally. Extract their
// two transparent bands separately, preserving the complete original artwork.
await atlas('gunner',4,4,'public/arcade/sprites/bosses/barge/gunner.webp',{boots:true,anchor:.61,rowCuts:[0,328,650,953,1254],columnCuts:[[0,312,624,950,1254],[0,310,624,932,1254],[0,310,624,940,1254],[0,323,623,940,1254]],frameRegions:{10:[{left:0,top:0,width:357,height:185},{left:0,top:185,width:316,height:118}],11:[{left:41,top:0,width:273,height:185},{left:0,top:185,width:314,height:118}]}});
await atlas('diver-water',4,3,'public/arcade/sprites/enemies/river-diver-water.webp');
await atlas('boat-crew',3,2,'public/arcade/sprites/enemies/river-boat-crew.webp');
await atlas('fire-hit',4,1,'public/arcade/sprites/hexy/fire-hit.webp',{size:320,base:300,targetWidth:310,boots:true});
await atlas('fire-juggler',4,3,'public/arcade/sprites/enemies/fire-juggler.webp',{boots:true,rowCuts:[0,374,744,1086]});
await output(await sharp(source('fortress')).png().toBuffer(),'public/arcade/sprites/bosses/ember-fort/body.webp');
await output(await sharp(source('approach-panorama')).png().toBuffer(),'public/arcade/maps/ember-trail/background.webp');
await output(await sharp(source('ash-ground')).png().toBuffer(),'public/arcade/maps/ember-trail/ground.webp');
// Unequal tree widths in the generated strip: preserve whole branches.
const tree=await sharp(source('burnt-trees')).metadata();
for(const [i,a,b]of [[0,0,.285],[1,.285,.515],[2,.515,.76],[3,.76,1]])await output(await sharp(source('burnt-trees')).extract({left:Math.round(a*tree.width),top:0,width:Math.round(b*tree.width)-Math.round(a*tree.width),height:tree.height}).png().toBuffer(),`public/arcade/maps/ember-trail/tree-${i}.webp`);
fs.writeFileSync('context/arcade/ember-fort/assets.json',JSON.stringify(report,null,2)+'\n');console.log(report);
