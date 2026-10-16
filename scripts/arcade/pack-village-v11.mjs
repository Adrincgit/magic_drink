import fs from 'node:fs/promises';
import sharp from 'sharp';
const base='context/arcade/village-5-2/revision-11',records={};
async function cells(name,rows){
 const file=`${base}/sources/${name}.png`,meta=await sharp(file).metadata(),cw=meta.width/4,ch=meta.height/rows,out=[];
 // ImageGen's painted gutters are not a mathematically uniform grid. Measured
 // empty scanlines keep the raised-wand boots out of the release row.
 const grid=name==='harvester-combat'?{x:[0,332,650,962,1254],y:[0,315,650,940,1254]}:name==='harvester-ritual'?{x:[0,332,638,962,1254],y:[0,324,648,947,1254]}:null;
 for(let i=0;i<rows*4;i++){
  const col=i%4,row=Math.floor(i/4),left=grid?grid.x[col]:Math.round(col*cw),top=grid?grid.y[row]:Math.round(row*ch),width=(grid?grid.x[col+1]:Math.round((col+1)*cw))-left,height=(grid?grid.y[row+1]:Math.round((row+1)*ch))-top;
  let buffer=await sharp(file).extract({left,top,width,height}).ensureAlpha().png().toBuffer();
  const {data,info}=await sharp(buffer).raw().toBuffer({resolveWithObject:true});let x0=info.width,y0=info.height,x1=0,y1=0;
  if(grid){
   // Extract the connected character, excluding a neighbouring wand protruding
   // into the gutter. Preserve original RGBA values inside the selected sprite.
   const seen=new Uint8Array(width*height);let largest=[];
   for(let p=0;p<seen.length;p++)if(!seen[p]&&data[p*4+3]>8){const component=[p];seen[p]=1;
    for(let at=0;at<component.length;at++){const q=component[at],x=q%width,y=Math.floor(q/width);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy,n=ny*width+nx;if(nx>=0&&nx<width&&ny>=0&&ny<height&&!seen[n]&&data[n*4+3]>8){seen[n]=1;component.push(n);}}}
    if(component.length>largest.length)largest=component;
   }
   const keep=new Uint8Array(seen.length);for(const p of largest){const x=p%width,y=Math.floor(p/width);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(x+dx>=0&&x+dx<width&&y+dy>=0&&y+dy<height)keep[p+dy*width+dx]=1;}
   for(let p=0;p<keep.length;p++)if(!keep[p])data[p*4+3]=0;
   buffer=await sharp(data,{raw:info}).png().toBuffer();
  }
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>24){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  out.push({buffer,data,info,b:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}});
 }return out;
}
const combat=await cells('harvester-combat',4),ritual=await cells('harvester-ritual',4),scale=Math.min(232/Math.max(...[...combat,...ritual].map(c=>c.b.width)),232/combat[0].b.height);
for(const [name,arr]of [['harvester-combat',combat],['harvester-ritual',ritual]]){
 const layers=[];records[name]=[];
 for(const [i,c]of arr.entries()){
  const w=Math.round(c.b.width*scale),h=Math.round(c.b.height*scale),left=Math.round(128+(c.b.left-c.info.width/2)*scale),top=250-h;
  const input=await sharp(c.buffer).extract(c.b).resize(w,h).png().toBuffer();layers.push({input,left:i%4*256+left,top:Math.floor(i/4)*256+top});records[name].push({scale,left,top,bounds:c.b});
 }
 await sharp({create:{width:1024,height:1024,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(`public/arcade/sprites/bosses/${name}.webp`);
}
const hexy=await cells('hexy-popcorn',2),hs=Math.min(245/hexy[0].b.height,300/Math.max(...hexy.map(c=>c.b.width))),hlayers=[],tips=[];
for(const [i,c]of hexy.entries()){
 const w=Math.round(c.b.width*hs),h=Math.round(c.b.height*hs),left=Math.round(160+(c.b.left-c.info.width*.5)*hs),top=300-h;
 if(left<0||left+w>320)throw Error('Hexy exceeds cell '+i);
 hlayers.push({input:await sharp(c.buffer).extract(c.b).resize(w,h).png().toBuffer(),left:i%4*320+left,top:Math.floor(i/4)*320+top});
 let sumX=0,sumY=0,n=0;
 for(let y=0;y<c.info.height*.7;y++)for(let x=Math.floor(c.info.width*.82);x<c.info.width;x++){const p=(y*c.info.width+x)*4,[r,g,b,a]=c.data.subarray(p,p+4);if(a>128&&r>180&&g>145&&b<110){sumX+=x;sumY+=y;n++;}}
 if(!n)throw Error('Missing wand star '+i);tips.push({tip:[+(left+(sumX/n-c.b.left)*hs).toFixed(2),+(top+(sumY/n-c.b.top)*hs).toFixed(2)]});
 records['hexy-popcorn']??=[];records['hexy-popcorn'].push({left,top,scale:hs,bounds:c.b,tip:tips.at(-1).tip});
}
await sharp({create:{width:1280,height:640,channels:4,background:'#00000000'}}).composite(hlayers).webp({lossless:true}).toFile('public/arcade/sprites/hexy/popcorn-recoil.webp');
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyPopcornAtlas.js','// Measured gold star centers on the packed recoil cels.\nexport const popcornRegistration={scale:'+245/(hs*hexy[0].b.height)+',x:-13};\nexport default '+JSON.stringify(tips)+';\n');
await fs.writeFile(`${base}/registration.json`,JSON.stringify(records,null,2));
console.log(JSON.stringify({bossScale:scale,hexyScale:hs,tips}));
