import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/halloween-5-1/bellkeeper-v6/',out='public/arcade/sprites/enemies/';
function cut(counts,expected,radius){
 let best=Math.round(expected),score=Infinity;
 for(let i=Math.max(1,Math.floor(expected-radius));i<Math.min(counts.length-1,expected+radius);i++){
  const cost=(counts[i-1]+counts[i]+counts[i+1])*100+Math.abs(expected-i);if(cost<score){score=cost;best=i;}
 }return best;
}
const CELL=320,BASE=Math.round(CELL*250/256),registration={};
// Technical matte cleanup removes disconnected spill from neighbouring cels.
async function cel(source,rect,clean=false){
 const {data,info}=await sharp(source).extract(rect).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(clean){
  const labels=new Int32Array(info.width*info.height),groups=[];let label=0;
  for(let i=0;i<labels.length;i++)if(!labels[i]&&data[i*4+3]>16){
   const queue=[i];labels[i]=++label;for(let n=0;n<queue.length;n++){const p=queue[n],x=p%info.width;for(const q of [x>0?p-1:-1,x<info.width-1?p+1:-1,p-info.width,p+info.width])if(q>=0&&q<labels.length&&!labels[q]&&data[q*4+3]>16){labels[q]=label;queue.push(q);}}
   groups.push(queue.length);
  }
  const minimum=Math.max(...groups)*.012;
  for(let i=0;i<labels.length;i++)if(labels[i]&&groups[labels[i]-1]<minimum)data[i*4+3]=0;
 }
 return sharp(data,{raw:info}).png().toBuffer();
}
const dashSource=root+'sources/dash.png',dashMeta=await sharp(dashSource).metadata(),dash=[];
for(let i=0;i<4;i++){
 const source=await cel(dashSource,{left:i%2*Math.floor(dashMeta.width/2),top:Math.floor(i/2)*Math.floor(dashMeta.height/2),width:Math.floor(dashMeta.width/2),height:Math.floor(dashMeta.height/2)},true);
 dash.push(await sharp(source).trim({threshold:16}).png().toBuffer());
}
const dashSizes=await Promise.all(dash.map(q=>sharp(q).metadata())),dashScale=292/Math.max(...dashSizes.map(q=>q.width));
for(const [name,rows]of [['bell',8],['wraith',8],['break',3]]){
 const input=root+'sources/'+name+'.png',{data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true}),rc=Array(info.height).fill(0);
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80)rc[y]++;
 const ry=[0,...Array.from({length:rows-1},(_,i)=>cut(rc,(i+1)*info.height/rows,info.height/rows*.18)),info.height],cells=[];
 for(let row=0;row<rows;row++){
  const cc=Array(info.width).fill(0);for(let y=ry[row];y<ry[row+1];y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>80)cc[x]++;
  const cx=[0,...[1,2,3].map(i=>cut(cc,i*info.width/4,info.width*.035)),info.width];
  for(let col=0;col<4;col++){
   let left=info.width,top=info.height,right=-1,bottom=-1;
   for(let y=ry[row];y<ry[row+1];y++)for(let x=cx[col];x<cx[col+1];x++)if(data[(y*info.width+x)*4+3]>16){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   if(right<left)throw Error('Empty '+name+' '+row+','+col);
   cells.push({left,top,width:right-left+1,height:bottom-top+1});
  }
 }
 // A single scale per sheet retains actual squash, stretch and shrinking death.
 const scale=Math.min(210/cells[0].height,304/Math.max(...cells.map(q=>q.width)),298/Math.max(...cells.map(q=>q.height))),layers=[];
 registration[name]={scale,cells};
 for(const [i,q]of cells.entries()){
  if(name==='break'&&[0,11].includes(i)){layers.push({input:await sharp(out+'nightmare-'+(i?'wraith':'bell')+'-v6.webp').extract({left:0,top:0,width:CELL,height:CELL}).png().toBuffer(),left:i%4*CELL,top:Math.floor(i/4)*CELL});continue;}
  if(name==='wraith'&&i>=20&&i<24){const j=i-20,w=Math.round(dashSizes[j].width*dashScale),h=Math.round(dashSizes[j].height*dashScale);layers.push({input:await sharp(dash[j]).resize(w,h).png().toBuffer(),left:i%4*CELL+Math.round((CELL-w)/2),top:Math.floor(i/4)*CELL+BASE-150});continue;}
  let source=sharp(await cel(input,q,name==='wraith'&&i===13));if(name==='bell'&&[3,5].includes(i))source=source.flop();
  const w=Math.round(q.width*scale),h=Math.round(q.height*scale);
  layers.push({input:await source.resize(w,h).png().toBuffer(),left:i%4*CELL+Math.round((CELL-w)/2),top:Math.floor(i/4)*CELL+BASE-h});
 }
 await sharp({create:{width:CELL*4,height:rows*CELL,channels:4,background:'#00000000'}}).composite(layers).webp({quality:98,alphaQuality:100}).toFile(out+'nightmare-'+name+'-v6.webp');
}
fs.writeFileSync(root+'registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Packed 32 bell, 32 wraith and 12 shell-breaking poses.');
