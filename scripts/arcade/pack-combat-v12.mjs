import fs from 'node:fs/promises';
import sharp from 'sharp';
const base='context/arcade/village-5-2/revision-12',records={};
const layouts=[{name:'hexy-volt',sheet:'volt-cast',x:[0,376,732,1090,1448],y:[0,303,557,857,1086],scale:.94},
 {name:'hexy-popcorn-air',sheet:'popcorn-air',x:[0,474,895,1330,1774],y:[0,457,887],scale:.72}];
const atlas={},registration={};
for(const q of layouts){
 const layers=[],tips=[];records[q.sheet]=[];
 for(let row=0;row<q.y.length-1;row++)for(let col=0;col<4;col++){
  const i=row*4+col,width=q.x[col+1]-q.x[col],height=q.y[row+1]-q.y[row];
  const {data,info}=await sharp(`${base}/sources/${q.name}.png`).extract({left:q.x[col],top:q.y[row],width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=width,y0=height,x1=0,y1=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>24){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  const b={left:x0,top:y0,width:x1-x0+1,height:y1-y0+1},w=Math.round(b.width*q.scale),h=Math.round(b.height*q.scale),left=Math.round((320-w)/2),top=300-h;
  if(w>316||h>295)throw Error('Oversized cel '+q.sheet+':'+i);
  const input=await sharp(data,{raw:info}).extract(b).resize(w,h).png().toBuffer();layers.push({input,left:col*320+left,top:row*320+top});
  let tx=0,ty=0,n=0;
  for(let y=y0;y<y1;y++)for(let x=Math.floor(x0+b.width*.76);x<=x1;x++){
   const p=(y*width+x)*4,[r,g,blue,a]=data.subarray(p,p+4);
   if(a>180&&r>175&&g>135&&blue<110){tx+=x;ty+=y;n++;}
  }
  if(!n)throw Error('Missing wand star '+i);
  tips.push({tip:[+(left+(tx/n-x0)*q.scale).toFixed(2),+(top+(ty/n-y0)*q.scale).toFixed(2)]});
  records[q.sheet].push({bounds:b,left,top,scale:q.scale,tip:tips.at(-1).tip});
  registration[q.sheet+':'+i]={scale:1,x:0};
 }
 atlas[q.sheet]=tips;
 await sharp({create:{width:1280,height:320*(q.y.length-1),channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(`public/arcade/sprites/hexy/${q.sheet}.webp`);
}
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyCombatV12Atlas.js',`// Measured gold star centers; generated with scripts/arcade/pack-combat-v12.mjs.\nexport const combatV12Registration=${JSON.stringify(registration)};\nexport default ${JSON.stringify(atlas)};\n`);
await fs.writeFile(`${base}/registration.json`,JSON.stringify(records,null,2));
console.log(JSON.stringify({tips:atlas}));
