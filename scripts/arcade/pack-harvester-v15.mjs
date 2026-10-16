import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='context/arcade/village-5-2/revision-15',file=dir+'/sources/harvester-flight.png';
const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const gaps=[];let first=null;
for(let y=0;y<info.height;y++){let count=0;for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>24)count++;if(!count&&first===null)first=y;if(count&&first!==null){if(y-first>=3)gaps.push([first,y-1]);first=null;}}
console.log(JSON.stringify({info,gaps}));
const rows=[0,300,555,810,1090,1254],cols=[0,314,627,941,1254],scale=.92,size=320,layers=[],records=[];
// Packing/registration only: preserve the generated RGBA and remove detached
// fragments of neighbouring cells from ImageGen's slightly uneven gutters.
for(let i=0;i<20;i++){
 const col=i%4,row=Math.floor(i/4),left=cols[col],top=rows[row],width=cols[col+1]-left,height=rows[row+1]-top;
 const {data:rgba,info:cell}=await sharp(file).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const seen=new Uint8Array(width*height);let largest=[];
 for(let p=0;p<seen.length;p++)if(!seen[p]&&rgba[p*4+3]>16){const component=[p];seen[p]=1;
  for(let at=0;at<component.length;at++){const p=component[at],x=p%width,y=Math.floor(p/width);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy,n=ny*width+nx;if(nx>=0&&nx<width&&ny>=0&&ny<height&&!seen[n]&&rgba[n*4+3]>16){seen[n]=1;component.push(n);}}}
  if(component.length>largest.length)largest=component;
 }
 let x0=width,y0=height,x1=0,y1=0;const keep=new Uint8Array(width*height);
 for(const p of largest){const x=p%width,y=Math.floor(p/width);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(x+dx>=0&&x+dx<width&&y+dy>=0&&y+dy<height)keep[p+dy*width+dx]=1;}
 for(let p=0;p<keep.length;p++)if(!keep[p])rgba[p*4+3]=0;
 const bounds={left:x0,top:y0,width:x1-x0+1,height:y1-y0+1},w=Math.round(bounds.width*scale),h=Math.round(bounds.height*scale),x=Math.round(size/2+(x0-width/2)*scale),y=Math.round(size*250/256-h);
 if(x<0||x+w>size||y<0)throw Error('Sprite outside cell '+i);
 layers.push({input:await sharp(rgba,{raw:cell}).extract(bounds).resize(w,h).png().toBuffer(),left:col*size+x,top:row*size+y});
 const point=(px,py)=>[+(x+(px-left-x0)*scale).toFixed(2),+(y+(py-top-y0)*scale).toFixed(2)];
 const sourceVessels={12:[102,976],13:[411,990],14:[731,982],15:[1048,986]},sourceWand=i===10?[630,750]:null;
 records.push({i,source:{left,top,width,height},bounds,x,y,scale,...(sourceVessels[i]?{vessel:point(...sourceVessels[i])}:{}),...(sourceWand?{wand:point(...sourceWand)}:{})});
}
await sharp({create:{width:1280,height:1600,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile('public/arcade/sprites/bosses/harvester-flight-v15.webp');
await fs.writeFile(dir+'/registration.json',JSON.stringify(records,null,2));
await fs.writeFile('src/components/arcade/adventure/actors/harvesterFlightAtlas.js','// Measured on the packed 320px cels; flight sprites face left.\nexport const harvesterFlightWand='+JSON.stringify(records[10].wand)+';\nexport const harvesterFlightVessels='+JSON.stringify(records.slice(12,16).map(q=>q.vessel))+';\n');
console.log(JSON.stringify({wand:records[10].wand,vessels:records.slice(12,16).map(q=>q.vessel)}));
