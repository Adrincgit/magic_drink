import fs from 'node:fs';
import sharp from 'sharp';

const root='context/arcade/halloween-5-1/bellkeeper-v9/',out='public/arcade/sprites/enemies/';
const names=['bell-idle','bell-ring','bell-impact','bell-summon','wraith-idle','wraith-cast','wraith-dash','wraith-defeat','break'];
const CELL=320,BASE=313,registration={},offsets={};
function cut(counts,expected,radius){let best=Math.round(expected),score=Infinity;for(let i=Math.max(1,Math.floor(expected-radius));i<Math.min(counts.length-1,expected+radius);i++){const v=(counts[i-1]+counts[i]+counts[i+1])*100+Math.abs(i-expected);if(v<score){score=v;best=i;}}return best;}
function nose(data,width,height){
 const mask=new Uint8Array(width*height),groups=[];
 for(let i=0;i<mask.length;i++){const p=i*4,[r,g,b,a]=data.subarray(p,p+4);mask[i]=a>180&&r>140&&g<80&&b<105&&r>g*2&&r>b*1.4?1:0;}
 for(let i=0;i<mask.length;i++)if(mask[i]){
  const queue=[i];mask[i]=0;let xsum=0,ysum=0,l=width,r=0,t=height,b=0;
  for(let j=0;j<queue.length;j++){const p=queue[j],x=p%width,y=Math.floor(p/width);xsum+=x;ysum+=y;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);for(const q of [x>0?p-1:-1,x<width-1?p+1:-1,p-width,p+width])if(q>=0&&q<mask.length&&mask[q]){mask[q]=0;queue.push(q);}}
  const w=r-l+1,h=b-t+1,y=ysum/queue.length;
  if(queue.length>=10&&w/h>.35&&w/h<2.4&&y>height*.27&&y<height*.8)groups.push({x:xsum/queue.length,y,area:queue.length,width:w,height:h});
 }
 return groups.sort((a,b)=>b.area-a.area)[0]||null;
}
const old=await sharp(out+'nightmare-bell-v6.webp').extract({left:0,top:0,width:CELL,height:CELL}).ensureAlpha().raw().toBuffer();
const anchor=nose(old,CELL,CELL);
if(!anchor)throw Error('Missing reference nose anchor');
for(const name of names){
 const file=root+'sources/'+name+'.png',{data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true}),rowCounts=Array(info.height).fill(0);
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80)rowCounts[y]++;
 const ys=[0,...Array.from({length:5},(_,i)=>cut(rowCounts,(i+1)*info.height/6,info.height/6*.12)),info.height],cels=[];
 for(let row=0;row<6;row++){
  const columnCounts=Array(info.width).fill(0);for(let y=ys[row];y<ys[row+1];y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80)columnCounts[x]++;
  const xs=[0,...[1,2,3].map(i=>cut(columnCounts,i*info.width/4,info.width/4*.07)),info.width];
  for(let col=0;col<4;col++){
   const rect={left:xs[col],top:ys[row],width:xs[col+1]-xs[col],height:ys[row+1]-ys[row]};
   const raw=await sharp(file).extract(rect).ensureAlpha().raw().toBuffer();let l=rect.width,r=-1,t=rect.height,b=-1;
   for(let y=0;y<rect.height;y++)for(let x=0;x<rect.width;x++)if(raw[(y*rect.width+x)*4+3]>16){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
   if(r<l)throw Error('Empty cel '+name+' '+cels.length);
   cels.push({rect,box:{left:l,top:t,width:r-l+1,height:b-t+1},nose:nose(raw,rect.width,rect.height)});
  }
 }
 // One scale per atlas retains the size of the hat while the dying body dissolves.
 const scale=Math.min(210/cels[0].box.height,302/Math.max(...cels.map(c=>c.box.width))),layers=[];offsets[name]=[];
 for(const [i,c]of cels.entries()){
  const cx=i%4*CELL,cy=Math.floor(i/4)*CELL;
  if(name==='break'&&(i===0||i===23)){
   layers.push({input:await sharp(out+'nightmare-'+(i===0?'bell-idle':'wraith-idle')+'-v9.webp').extract({left:0,top:0,width:CELL,height:CELL}).png().toBuffer(),left:cx,top:cy});offsets[name].push([0,0]);continue;
  }
  const width=Math.round(c.box.width*scale),height=Math.round(c.box.height*scale);
  let left=Math.round((CELL-width)/2),top=BASE-height;
  // Register the painted face, rather than moving the body when a tail/ghost grows.
  if(c.nose&&name!=='wraith-defeat'){
   left=Math.round(anchor.x-(c.nose.x-c.box.left)*scale);
   top=Math.round(anchor.y-(c.nose.y-c.box.top)*scale);
   if(name==='bell-idle'&&i>=12)top+=Math.round(10*(1-(i-12)/11));
  }
  const desired={left,top};left=Math.max(4,Math.min(CELL-width-4,left));top=Math.max(4,Math.min(CELL-height-4,top));
  // Keep effects inside the atlas, and restore the intended face origin at draw time.
  offsets[name].push([desired.left-left,desired.top-top]);
  const rect={left:c.rect.left+c.box.left,top:c.rect.top+c.box.top,width:c.box.width,height:c.box.height};
  layers.push({input:await sharp(file).extract(rect).resize(width,height).png().toBuffer(),left:cx+left,top:cy+top});
  Object.assign(c,{placed:{left,top,width,height}});
 }
 const dest=out+'nightmare-'+name+'-v9.webp';
 await sharp({create:{width:CELL*4,height:CELL*6,channels:4,background:'#00000000'}}).composite(layers).webp({quality:98,alphaQuality:100}).toFile(dest);
 await sharp(dest).flatten({background:'#292d34'}).resize(1024).png().toFile(root+name+'-preview.png');
 registration[name]={scale,anchor,cels};console.log(name+': 24 cels, scale '+scale.toFixed(3)+', nose anchors '+cels.filter(c=>c.nose).length);
}
fs.writeFileSync(root+'registration.json',JSON.stringify(registration,null,2)+'\n');
fs.writeFileSync('src/components/arcade/adventure/actors/bosses/bellkeeperRegistration.js','// Generated by scripts/arcade/pack-bellkeeper-v9.mjs; offsets in 320px atlas cells.\nexport const BELLKEEPER_OFFSETS='+JSON.stringify(offsets)+';\n');
