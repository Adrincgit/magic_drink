import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
import {NIGHTMARE_STORM_PALMS} from '../../src/components/arcade/adventure/actors/bosses/nightmareStormRegistration.js';
const dir='context/arcade/nightmare-performance-v10',out='public/arcade/act-two/nightmare-performance-v10';await fs.mkdir(out,{recursive:true});
const median=a=>[...a].sort((a,b)=>a-b)[Math.floor(a.length/2)],body={},palms=[...NIGHTMARE_STORM_PALMS],vortex=[],report={};
const targetFace=JSON.parse(await fs.readFile('context/arcade/nightmare-coherence-v7/registration.json','utf8')).reference.targetFaceWidth;
async function isolated(name,count,cols){
 const file=dir+'/sources/'+name+'.png';let s=await spriteComponents(file),threshold=32;
 if(s.components.filter(q=>q.area>1000).length<count){
  const original=s.data,{width,height}=s.info;
  for(const limit of [100,160,200,225]){const mask=Buffer.from(original);threshold=limit;for(let i=3;i<mask.length;i+=4)if(mask[i]<limit)mask[i]=0;
   s=await spriteComponents(await sharp(mask,{raw:{width,height,channels:4}}).png().toBuffer());s.data=original;if(s.components.filter(q=>q.area>1000).length>=count)break;
  }
 }
 const boxes=s.components.filter(q=>q.area>1000).sort((a,b)=>b.area-a.area).slice(0,count).sort((a,b)=>a.cy-b.cy),order=[];
 if(boxes.length!==count)throw Error(name+' expected '+count+' components, found '+boxes.length);
 for(let row=0;row<count/cols;row++)order.push(...boxes.slice(row*cols,row*cols+cols).sort((a,b)=>a.cx-b.cx));
 const frames=[];for(const q of order){
  const pad=12,left=Math.max(0,q.left-pad),top=Math.max(0,q.top-pad),w=Math.min(s.info.width-left,q.width+pad*2),h=Math.min(s.info.height-top,q.height+pad*2),rgba=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const p=(y+top)*s.info.width+x+left,a=s.data[p*4+3];let halo=threshold===32;
   if(threshold>32&&a>0&&a<=threshold)for(let dy=-3;dy<=3&&!halo;dy++)for(let dx=-3;dx<=3&&!halo;dx++){const xx=x+left+dx,yy=y+top+dy;if(xx>=0&&yy>=0&&xx<s.info.width&&yy<s.info.height&&s.labels[yy*s.info.width+xx]===q.id)halo=true;}
   if(s.labels[p]===q.id||a>0&&a<=threshold&&halo)s.data.copy(rgba,(y*w+x)*4,p*4,p*4+4);
  }
  frames.push({rgba,w,h,input:await sharp(rgba,{raw:{width:w,height:h,channels:4}}).png().toBuffer(),box:q});
 }
 return frames;
}
function skinBox(q){
 const points=[];for(let y=0;y<q.h*.65;y++)for(let x=0;x<q.w*.8;x++){const i=(y*q.w+x)*4,[r,g,b,a]=q.rgba.subarray(i,i+4);if(a>150&&r>200&&g>120&&b>100&&r>g+25&&r>b+15&&b/g>.68)points.push([x,y]);}
 // A broad skin envelope around the face excludes white gloves, cloth and
 // gold. A common scale across each complete sequence preserves anatomy.
 if(!points.length)throw Error('Missing skin landmarks');const ys=points.map(p=>p[1]).sort((a,b)=>a-b),lo=ys[Math.floor(ys.length*.1)],hi=ys[Math.floor(ys.length*.7)],xs=points.filter(p=>p[1]>=lo&&p[1]<=hi).map(p=>p[0]).sort((a,b)=>a-b);
 return{width:xs[Math.floor(xs.length*.95)]-xs[Math.floor(xs.length*.05)],x:median(xs),y:median(ys)};
}
function average(q,test){let sx=0,sy=0,n=0;for(let y=0;y<q.h;y++)for(let x=0;x<q.w;x++){const i=(y*q.w+x)*4;if(q.rgba[i+3]>150&&test(x,y,...q.rgba.subarray(i,i+3))){sx+=x;sy+=y;n++;}}if(!n)throw Error('Missing socket');return[sx/n,sy/n];}
for(const phase of [2,3])for(const [kind,count,cols]of [['jump',12,4],['staff-defense',16,4]]){
 const name=kind+'-'+phase,key='nightmare-'+name,source=await isolated(name+(kind==='staff-defense'?'-spaced':''),count,cols),scale=Math.min(440/Math.max(...source.map(q=>q.h)),466/Math.max(...source.map(q=>q.w))),faceWidth=median(source.map(q=>skinBox(q).width)),worldScale=targetFace/faceWidth,size=512*worldScale/scale,parts=[];body[key]=[];
 for(const [i,q]of source.entries()){
  const w=Math.round(q.w*scale),h=Math.round(q.h*scale),left=Math.round((512-w)/2),top=499-h,input=await sharp(q.input).resize(w,h).png().toBuffer();parts.push({input,left:i%4*512+left,top:Math.floor(i/4)*512+top});
  let sx=0,n=0;for(let y=Math.max(0,q.h-23);y<q.h;y++)for(let x=0;x<q.w;x++)if(q.rgba[(y*q.w+x)*4+3]>150){sx+=x;n++;}
  const footX=left+(n?sx/n:q.w/2)*scale;body[key].push({size,offsetX:(256-footX)*size/512,worldFaceWidth:skinBox(q).width*worldScale});
 }
 await sharp({create:{width:2048,height:Math.ceil(count/4)*512,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/'+name+'.webp');report[name]={count,size,faceWidth};
}
{
 const world=[{input:await sharp('public/arcade/act-two/nightmare-storm-v8/boss-air.webp').png().toBuffer(),left:0,top:0}],portraits=[{input:await sharp('public/arcade/act-two/nightmare-storm-v8/boss-portraits.webp').png().toBuffer(),left:0,top:0}];
 body['pressure-boss-air']=Array.from({length:24},()=>({size:102.4,offsetX:0}));
 for(const [index,name]of ['despair','counter-reaction'].entries()){
  const row=4+index,source=await isolated(name,4,2),scale=Math.min(438/Math.max(...source.map(q=>q.h)),480/Math.max(...source.map(q=>q.w)));
  for(const [i,q]of source.entries()){
   const p=average(q,(x,y,r,g,b)=>x<q.w*.3&&y<q.h*.6&&r>195&&g>190&&b>180),w=Math.round(q.w*scale),h=Math.round(q.h*scale),left=Math.round(86-p[0]*scale),top=Math.round(210-p[1]*scale);
   if(left<0||top<0||left+w>512||top+h>512)throw Error('Cast outside cel '+name+':'+i);
   world.push({input:await sharp(q.input).resize(w,h).png().toBuffer(),left:i*512+left,top:row*512+top});palms.push([left+p[0]*scale,top+p[1]*scale]);
   const face=average(q,(x,y,r,g,b)=>x>q.w*.25&&x<q.w*.65&&y>q.h*.14&&y<q.h*.4&&r>195&&g>110&&b>100&&r>g+20),ps=1.6,pw=Math.round(q.w*ps),ph=Math.round(q.h*ps),px=Math.round(335-face[0]*ps),py=Math.round(260-face[1]*ps);
   const canvas=await sharp({create:{width:1536,height:1536,channels:4,background:'#0000'}}).composite([{input:await sharp(q.input).resize(pw,ph).png().toBuffer(),left:px+256,top:py+256}]).png().toBuffer();
   portraits.push({input:await sharp(canvas).extract({left:256,top:256,width:704,height:704}).png().toBuffer(),left:i*704,top:row*704});
  }
 }
 await sharp({create:{width:2048,height:3072,channels:4,background:'#0000'}}).composite(world).webp({lossless:true}).toFile(out+'/boss-air.webp');
 await sharp({create:{width:2816,height:4224,channels:4,background:'#0000'}}).composite(portraits).webp({lossless:true}).toFile(out+'/boss-portraits.webp');
}
if(!process.argv.includes('--actors-only')){
 for(const [name,count,cols,side,height]of [['clash-plasma',8,4,384,384],['fast-wind',8,4,384,384],['halloween-vortex-16',16,4,512,512],['speech-tails',4,2,512,320]]){
  const source=await isolated(name,count,cols),scale=Math.min((side-44)/Math.max(...source.map(q=>q.w)),(height-44)/Math.max(...source.map(q=>q.h))),parts=[];
  for(const [i,q]of source.entries()){
   const w=Math.round(q.w*scale),h=Math.round(q.h*scale),left=Math.round((side-w)/2),top=Math.round((height-h)/2);
   parts.push({input:await sharp(q.input).resize(w,h).png().toBuffer(),left:i%cols*side+left,top:Math.floor(i/cols)*height+top});
   if(name==='halloween-vortex-16')vortex.push({front:[left+12*scale,256],tail:[left+w-12*scale,256]});
  }
  await sharp({create:{width:cols*side,height:Math.ceil(count/cols)*height,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/'+name+'.webp');
 }
 await sharp(dir+'/sources/city-plate.png').resize(1536,1024).webp({quality:95}).toFile(out+'/city-plate.webp');
 const original=await sharp('public/arcade/act-two/episode-two-v1/ring.webp').ensureAlpha().raw().toBuffer(),cutout=await sharp(dir+'/sources/arena-cutout.png').resize(1536,1024).ensureAlpha().raw().toBuffer(),rigid=Buffer.from(original),mask=new Uint8Array(1536*1024);
 for(let y=0;y<1024;y++)for(let x=0;x<1536;x++){
  const n=y*1536+x,p=n*4,[r,g,b]=original.subarray(p,p+3),pillar=x<350||x>1185,ornament=((x-780)/185)**2+((y-110)/130)**2<1||((x-385)/100)**2+((y-205)/140)**2<1||((x-1150)/90)**2+((y-205)/145)**2<1;
  const fabric=y<625&&!pillar&&!ornament&&cutout[p+3]>100&&b>r*.65&&b>g*.95;
  mask[n]=fabric?255:0;rigid[p+3]=cutout[p+3]<80?0:fabric?0:255;
 }
 await sharp(rigid,{raw:{width:1536,height:1024,channels:4}}).webp({lossless:true}).toFile(out+'/arena-cutout.webp');
 const source=sharp(dir+'/sources/cloth-cels.png'),m=await source.metadata(),cw=Math.floor(m.width/2),ch=Math.floor(m.height/2);
 for(let i=0;i<4;i++){
  const cel=await source.clone().extract({left:i%2*cw,top:Math.floor(i/2)*ch,width:cw,height:ch}).resize(1536,1024).ensureAlpha().raw().toBuffer();
  // Registration uses the original room pixels to retain every rigid prop.
  // Only the actual fabric region consumes the newly drawn fabric cels.
  for(let p=0;p<cel.length;p+=4){const blend=cel[p+3]/255*.55;for(let k=0;k<3;k++)cel[p+k]=Math.round(original[p+k]*(1-blend)+cel[p+k]*blend);cel[p+3]=mask[p/4];}
  await sharp(cel,{raw:{width:1536,height:1024,channels:4}}).webp({lossless:true}).toFile(out+'/cloth-'+i+'.webp');
 }
}
const crops=Array.from({length:24},(_,i)=>[i%4*704,Math.floor(i/4)*704,704,704]);
await fs.writeFile('src/components/arcade/adventure/actors/bosses/nightmarePerformanceRegistration.js','// Generated by pack-nightmare-performance.mjs; drawn movement and expression continuity.\nexport const NIGHTMARE_PERFORMANCE_BODY='+JSON.stringify(body)+';\nexport const NIGHTMARE_PERFORMANCE_PALMS='+JSON.stringify(palms)+';\nexport const NIGHTMARE_PERFORMANCE_PORTRAITS='+JSON.stringify(crops)+';\nexport const NIGHTMARE_PERFORMANCE_VORTEX='+JSON.stringify(vortex)+';\n');
await fs.writeFile(dir+'/registration.json',JSON.stringify({body,palms,vortex,report},null,2)+'\n');console.log('Packed actor sequences and continuous casting expressions.');
