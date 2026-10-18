import fs from 'node:fs';
import sharp from 'sharp';
const dir='context/arcade/route-polish/';fs.mkdirSync(dir,{recursive:true});
const source=dir+'ultimate-one-hand-source.png';
if(process.argv[2])fs.copyFileSync(process.argv[2],source);
const down=dir+'ultimate-down-source.png';
if(process.argv[3])fs.copyFileSync(process.argv[3],down);
const cols=[0,512,1024],rows=[0,391,841,1184,1536],scale=.62;
const layers=[],atlas=[],records=[];
for(let row=0;row<4;row++)for(let col=0;col<2;col++){
 const lower=row>=2,cellScale=lower?.4:scale;
 const downRows=col===0?[0,490,1024]:[0,468,1024];
 const upperTop=row===1?370:rows[row];
 const rect=lower?{left:col*768,top:downRows[row-2],width:768,height:downRows[row-1]-downRows[row-2]}:{left:cols[col],top:upperTop,width:cols[col+1]-cols[col],height:rows[row+1]-upperTop};
 const {data,info}=await sharp(lower?down:source).extract(rect).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const visited=new Uint8Array(info.width*info.height);let largest=[];
 for(let k=0;k<visited.length;k++)if(!visited[k]&&data[k*4+3]>24){
  const queue=[k];visited[k]=1;
  for(let j=0;j<queue.length;j++){const at=queue[j],x=at%info.width,y=Math.floor(at/info.width);
   for(const next of [x?at-1:-1,x<info.width-1?at+1:-1,y?at-info.width:-1,y<info.height-1?at+info.width:-1])if(next>=0&&!visited[next]&&data[next*4+3]>24){visited[next]=1;queue.push(next);}
  }
  if(queue.length>largest.length)largest=queue;
 }
 const keep=new Uint8Array(visited.length);for(const k of largest)keep[k]=1;
 for(let k=0;k<keep.length;k++)if(!keep[k])data.fill(0,k*4,k*4+4);
 let x0=info.width,y0=info.height,x1=0,y1=0,faceX=0,faceN=0;
 const gold=[];
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const [r,g,b,a]=data.subarray((y*info.width+x)*4,(y*info.width+x)*4+4);if(a<40)continue;
  x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
  if(r>180&&g>105&&g<220&&b<160&&r-g>25&&x>info.width*.45&&y<info.height*.65){faceX+=x;faceN++;}
  if(a>150&&r>180&&g>145&&b<110)gold.push({x,y});
 }
 // Isolate the wand's star from the smaller star on the hat.
 const edge=row===1?Math.min(...gold.map(p=>p.y)):row===3?Math.max(...gold.map(p=>p.y)):Math.max(...gold.map(p=>p.x));
 const band=lower?60:30;
 const star=gold.filter(p=>row===1?p.y<edge+band:row===3?p.y>edge-band:p.x>edge-band);
 const sx=star.reduce((n,p)=>n+p.x,0)/star.length,sy=star.reduce((n,p)=>n+p.y,0)/star.length;
 const w=Math.round((x1-x0+1)*cellScale),h=Math.round((y1-y0+1)*cellScale);
 const anchor=faceN?faceX/faceN:(x0+x1)/2;
 const left=Math.max(2,Math.min(318-w,Math.round(183-(anchor-x0)*cellScale))),top=300-h;
 if(w>316||h>298||top<2)throw Error('Oversized cel '+row+':'+col);
 const input=await sharp(data,{raw:info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize(w,h).png().toBuffer();
 const frame=row*2+col;
 layers.push({input,left:frame%4*320+left,top:Math.floor(frame/4)*320+top});
 const tip=[+(left+(sx-x0)*cellScale).toFixed(2),+(top+(sy-y0)*cellScale).toFixed(2)];atlas.push({tip});
 records.push({row,col,bounds:[x0,y0,x1,y1],left,top,scale:cellScale,tip});
}
await sharp({create:{width:1280,height:640,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile('public/arcade/sprites/hexy/super-directional-v1.webp');
fs.writeFileSync('src/components/arcade/adventure/actors/hexy/hexyDirectionalSuperAtlas.js','// One-handed directional discharge, measured wand stars.\nexport default '+JSON.stringify(atlas)+';\n');
fs.writeFileSync(dir+'ultimate-registration.json',JSON.stringify(records,null,2)+'\n');
