import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
const dir='context/arcade/global-combat-polish/',source=await spriteComponents(dir+'air-ultimate-source.png'),{data,info,labels,components}=source;
const scale=.66,rows=[[],[]],tips=[[],[]],records=[];
for(let frame=0;frame<8;frame++){
 const col=frame%4,row=Math.floor(frame/4),part=components.filter(q=>q.area>800&&Math.floor(q.cx/info.width*4)===col&&Math.floor(q.cy/info.height*2)===row).sort((a,b)=>b.area-a.area)[0];
 if(!part)throw Error('Missing complete character '+frame);
 const left=part.left-1,top=part.top-1,width=part.width+2,height=part.height+2,pixels=Buffer.alloc(width*height*4),gold=[];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const sx=left+x,sy=top+y,i=sy*info.width+sx,o=(y*width+x)*4;
  let keep=labels[i]===part.id;
  if(!keep)for(let dy=-1;dy<=1&&!keep;dy++)for(let dx=-1;dx<=1;dx++)if(labels[(sy+dy)*info.width+sx+dx]===part.id){keep=true;break;}
  if(keep){data.copy(pixels,o,i*4,i*4+4);if(data[i*4]>180&&data[i*4+1]>125&&data[i*4+2]<105&&data[i*4+3]>220)gold.push({x:sx,y:sy});}
 }
 const center=points=>[points.reduce((n,p)=>n+p.x,0)/points.length,points.reduce((n,p)=>n+p.y,0)/points.length];
 const wand=center(gold.filter(p=>p.x>part.left+part.width*.87)),hat=center(gold.filter(p=>p.x>part.left+part.width*.45&&p.x<part.left+part.width*.8&&p.y<part.top+part.height*.26));
 if(![...wand,...hat].every(Number.isFinite))throw Error('Cannot register gold stars in '+frame);
 const anchor=row?wand:hat,target=row?[282,144]:[200,86],x=Math.round(target[0]-(anchor[0]-left)*scale),y=Math.round(target[1]-(anchor[1]-top)*scale),w=Math.round(width*scale),h=Math.round(height*scale);
 if(x<3||y<3||x+w>317||y+h>317)throw Error('Would crop character '+frame+' '+JSON.stringify({x,y,w,h}));
 const input=await sharp(pixels,{raw:{width,height,channels:4}}).resize(w,h).png().toBuffer();rows[row].push({input,left:col*320+x,top:y});
 // Integer placement can differ by less than half a source pixel. Register the
 // measured tip rather than inventing a muzzle based on the collision body.
 const tip=row?[282,144]:[+(x+(wand[0]-left)*w/width).toFixed(2),+(y+(wand[1]-top)*h/height).toFixed(2)];
 tips[row].push({tip});records.push({frame,source:part,wand,hat,output:{x,y,w,h},tip});
}
for(const [row,name]of ['air-super-v2','air-super-release-v2'].entries())await sharp({create:{width:1280,height:320,channels:4,background:'#00000000'}}).composite(rows[row]).webp({lossless:true}).toFile('public/arcade/sprites/hexy/'+name+'.webp');
await fs.writeFile(dir+'air-ultimate-registration.json',JSON.stringify(records,null,2)+'\n');
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyAirSuperAtlas.js','// Registered on the complete airborne v2 drawings; release keeps a steady wand.\nexport default '+JSON.stringify({'air-super':tips[0],'air-super-release':tips[1]})+';\n');
console.log('Packed and registered eight complete airborne ultimate poses.');
