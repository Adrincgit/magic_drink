import fs from 'node:fs';
import sharp from 'sharp';
import {components} from './sprite-packing.mjs';
const dir='context/arcade/harbor-barge/',sources=JSON.parse(fs.readFileSync(dir+'sources.json','utf8'));
const maps='public/arcade/maps/harbor/',boss='public/arcade/sprites/bosses/barge/';
for(const folder of [dir,maps,boss])fs.mkdirSync(folder,{recursive:true});
const report=[];
async function save(input,path){await sharp(input).webp({quality:94,alphaQuality:100}).toFile(path);const m=await sharp(path).metadata();report.push({path,width:m.width,height:m.height,bytes:fs.statSync(path).size,alpha:m.hasAlpha});}
async function parts(path,min=2000){const raw=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});return{...raw,parts:components(raw.data,raw.info.width,raw.info.height,(d,k)=>d[k+3]>80).filter(q=>q.count>min)};}
// Each character is extracted by connected alpha, not a guessed cell border.
// This preserves the raised hand and keeps a neighbour's fin out of its frame.
async function isolate(raw,q){
 const {data,info}=raw,w=info.width,h=info.height,seen=new Uint8Array(w*h),queue=[q.seed];seen[q.seed]=1;
 let x0=q.x,y0=q.y,x1=q.x+q.w-1,y1=q.y+q.h-1;
 for(let j=0;j<queue.length;j++){const i=queue[j],x=i%w,y=Math.floor(i/w);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
  for(const n of [x?i-1:-1,x<w-1?i+1:-1,y?i-w:-1,y<h-1?i+w:-1])if(n>=0&&!seen[n]&&data[n*4+3]>3){seen[n]=1;queue.push(n);}}
 const bw=x1-x0+1,bh=y1-y0+1,out=Buffer.alloc(bw*bh*4);
 for(const i of queue){const at=((Math.floor(i/w)-y0)*bw+i%w-x0)*4;data.copy(out,at,i*4,i*4+4);}
 return{buffer:await sharp(out,{raw:{width:bw,height:bh,channels:4}}).png().toBuffer(),width:bw,height:bh};
}
await save(sources.body,boss+'body.webp');await save(sources.background,maps+'panorama.webp');
if(sources.damaged)await save(sources.damaged,boss+'damaged.webp');
for(const name of ['distant','fair'])if(sources[name])await save(sources[name],maps+name+'.webp');
const bg=await sharp(sources.background).metadata();await save(await sharp(sources.background).extract({left:0,top:Math.floor(bg.height*.69),width:bg.width,height:Math.floor(bg.height*.28)}).png().toBuffer(),maps+'water.webp');
for(const [source,names,target]of [[sources.kit,['wheel','mallet','shield','cannon'],boss],[sources.props,['lantern','boat','reeds','grove'],maps]]){
 const raw=await parts(source);if(raw.parts.length!==4)throw Error('Expected four components: '+source+' got '+raw.parts.length);
 for(const q of raw.parts){const col=q.x+q.w/2<raw.info.width/2?0:1,row=q.y+q.h/2<raw.info.height/2?0:1;const result=await isolate(raw,q);await save(result.buffer,target+names[row*2+col]+'.webp');}
}
const raw=await parts(sources.diver);if(raw.parts.length!==4)throw Error('Expected four diver poses, got '+raw.parts.length);
const poses=await Promise.all(raw.parts.sort((a,b)=>a.x-b.x).map(q=>isolate(raw,q)));
const scale=Math.min(220/Math.max(...poses.map(q=>q.height)),242/Math.max(...poses.map(q=>q.width))),frames=[];
for(const [i,q]of poses.entries()){const width=Math.round(q.width*scale),height=Math.round(q.height*scale);frames.push({input:await sharp(q.buffer).resize(width,height).png().toBuffer(),left:i*256+Math.round((256-width)/2),top:250-height});}
await save(await sharp({create:{width:1024,height:256,channels:4,background:'#00000000'}}).composite(frames).png().toBuffer(),'public/arcade/sprites/enemies/river-diver.webp');
if(sources.effects){
 const m=await sharp(sources.effects).metadata(),frames=[];
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
  const band=[[.11,.335],[.35,.61],[.615,.98]][row];
  const left=Math.round(col*m.width/4),top=Math.round(band[0]*m.height),width=Math.round((col+1)*m.width/4)-left,height=Math.round(band[1]*m.height)-top;
  const input=await sharp(sources.effects).extract({left,top,width,height}).resize(256,256,{fit:'contain',background:'#00000000'}).png().toBuffer();frames.push({input,left:col*256,top:row*256});
 }
 await save(await sharp({create:{width:1024,height:768,channels:4,background:'#00000000'}}).composite(frames).png().toBuffer(),'public/arcade/sprites/effects/harbor-effects.webp');
}
fs.writeFileSync(dir+'assets.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
