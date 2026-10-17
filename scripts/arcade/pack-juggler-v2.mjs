import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
const root='context/arcade/juggler-gait/revision-2/',raw=await spriteComponents(root+'sources/walk.png'),{data,info,labels}=raw;
const groups=Array.from({length:8},()=>[]);
for(const q of raw.components)if(q.area>10)groups[Math.min(1,Math.floor(q.cy/info.height*2))*4+Math.min(3,Math.floor(q.cx/info.width*4))].push(q);
const boxes=groups.map(group=>{const left=Math.min(...group.map(q=>q.left)),top=Math.min(...group.map(q=>q.top)),right=Math.max(...group.map(q=>q.left+q.width)),bottom=Math.max(...group.map(q=>q.top+q.height));return{left,top,width:right-left,height:bottom-top,ids:new Set(group.map(q=>q.id))};});
const scale=210/Math.max(...boxes.map(q=>q.height)),parts=[],records=[];
for(const [i,b]of boxes.entries()){
 const rgba=Buffer.alloc(b.width*b.height*4);let noseX=0,noseY=0,n=0;
 for(let y=0;y<b.height;y++)for(let x=0;x<b.width;x++){
  const j=(b.top+y)*info.width+b.left+x,k=(y*b.width+x)*4;let keep=false;
  for(let dy=-1;dy<=1&&!keep;dy++)for(let dx=-1;dx<=1;dx++){const xx=b.left+x+dx,yy=b.top+y+dy;if(xx>=0&&xx<info.width&&yy>=0&&yy<info.height&&b.ids.has(labels[yy*info.width+xx])){keep=true;break;}}
  if(!keep)continue;data.copy(rgba,k,j*4,j*4+4);
  const [r,g,blue,a]=data.subarray(j*4,j*4+4);
  if(a>180&&y>b.height*.2&&y<b.height*.42&&x<b.width*.4&&r>150&&g<75&&blue<75){noseX+=x;noseY+=y;n++;}
 }
 if(!n)throw Error('Missing red nose in '+i);
 const w=Math.round(b.width*scale),h=Math.round(b.height*scale),left=Math.round(100-noseX/n*scale),top=250-h;
 if(left<2||left+w>254)throw Error('Sprite overflow '+i);
 parts.push({input:await sharp(rgba,{raw:{width:b.width,height:b.height,channels:4}}).resize(w,h).png().toBuffer(),left:i%4*256+left,top:Math.floor(i/4)*256+top});
 records.push({frame:i,scale,left,top,w,h,noseX:100,noseY:+(top+noseY/n*scale).toFixed(2),soleY:250});
}
await sharp({create:{width:1024,height:512,channels:4,background:'#00000000'}}).composite(parts).webp({lossless:true}).toFile('public/arcade/sprites/enemies/juggler-walk-v2.webp');
await fs.writeFile(root+'registration.json',JSON.stringify(records,null,2)+'\n');console.log(records);
