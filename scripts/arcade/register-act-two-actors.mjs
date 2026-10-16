import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
export async function registerActTwoActors(){
 const dir='context/arcade/act-2-expansion/',records=JSON.parse(await fs.readFile(dir+'registration.json','utf8')),anchors={},enemyAnchors={};
 const sourcePoints={straw:{frame:6,point:[697,382]},count:{frame:6,point:[730,323]},harlequin:{frame:5,point:[300,401]}};
 for(const name of ['straw','count','harlequin','enemies']){
  const {data,info,labels,components}=await spriteComponents(dir+'sources/'+name+'.png'),rows=name==='enemies'?6:4,w=info.width,h=info.height;
  // Assign COMPLETE connected sprites by their centroids, so a staff or cape
  // can cross ImageGen's nominal grid without entering the neighbouring cel.
  const groups=Array.from({length:rows*4},()=>[]);
  for(const component of components)if(component.area>10){const col=Math.min(3,Math.floor(component.cx/w*4)),row=Math.min(rows-1,Math.floor(component.cy/h*rows));groups[row*4+col].push(component);}
  const boxes=groups.map(group=>{const left=Math.min(...group.map(c=>c.left)),top=Math.min(...group.map(c=>c.top)),right=Math.max(...group.map(c=>c.left+c.width)),bottom=Math.max(...group.map(c=>c.top+c.height));return{left,top,width:right-left,height:bottom-top,ids:new Set(group.map(c=>c.id))};});
  const scale=Math.min(298/Math.max(...boxes.map(b=>b.width)),298/Math.max(...boxes.map(b=>b.height))),parts=[],saved=[];
  for(const [i,b]of boxes.entries()){
   const mask=new Uint8Array(w*h);
   // Preserve the source antialiasing around each selected component.
   for(let y=b.top;y<b.top+b.height;y++)for(let x=b.left;x<b.left+b.width;x++)if(b.ids.has(labels[y*w+x]))for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h)mask[yy*w+xx]=1;}
   const rgba=Buffer.from(data);for(let j=0;j<mask.length;j++)if(!mask[j])rgba[j*4+3]=0;
   const bw=Math.round(b.width*scale),bh=Math.round(b.height*scale),left=Math.round((320-bw)/2),top=312-bh;
   parts.push({input:await sharp(rgba,{raw:info}).extract({left:b.left,top:b.top,width:b.width,height:b.height}).resize(bw,bh).png().toBuffer(),left:i%4*320+left,top:Math.floor(i/4)*320+top});
   saved.push({source:{left:b.left,top:b.top,width:b.width,height:b.height},packed:{left,top,width:bw,height:bh}});
   if(sourcePoints[name]?.frame===i){const p=sourcePoints[name].point;anchors[name]={frame:i,point:[+(left+(p[0]-b.left)*scale).toFixed(2),+(top+(p[1]-b.top)*scale).toFixed(2)]};}
   if(name==='enemies')for(const [type,frame,point]of [[29,5,[291,341]],[30,13,[289,787]],[31,21,[236,1293]]])if(frame===i)enemyAnchors[type]=[+(left+(point[0]-b.left)*scale).toFixed(2),+(top+(point[1]-b.top)*scale).toFixed(2)];
  }
  await sharp({create:{width:1280,height:rows*320,channels:4,background:'#00000000'}}).composite(parts).webp({lossless:true}).toFile('public/arcade/act-two/'+name+'-v1.webp');
  records[name]={source:w+'x'+h,scale,cell:320,boxes:saved};
 }
 await fs.writeFile(dir+'registration.json',JSON.stringify(records,null,2)+'\n');
 await fs.writeFile('src/components/arcade/adventure/actors/bosses/actTwoAtlas.js','// Measured on the full, registered 320px cels. Source sprites face LEFT.\nexport const ACT_TWO_MUZZLES='+JSON.stringify(anchors)+';\nexport const ACT_TWO_ENEMY_MUZZLES='+JSON.stringify(enemyAnchors)+';\n');
 console.log(JSON.stringify(anchors));
}
