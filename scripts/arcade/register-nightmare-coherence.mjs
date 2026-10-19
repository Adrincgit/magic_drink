import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
const dir='context/arcade/nightmare-coherence-v7',out='public/arcade/act-two/nightmare-coherence-v7';
await fs.mkdir(out,{recursive:true});
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
// The largest warm skin region is the face. White gloves, lavender hair,
// cream ruff and gold bells are excluded. This only measures the artwork.
function faceBox(data,w,h){
 const mask=new Uint8Array(w*h),parts=[];
 for(let i=0;i<w*h;i++){const[r,g,b,a]=data.subarray(i*4,i*4+4);mask[i]=a>150&&r>200&&g>120&&b>100&&r>g+20&&r>b+15&&b/g>.68?1:0;}
 for(let p=0;p<mask.length;p++)if(mask[p]){
  const queue=[p];mask[p]=0;let left=w,top=h,right=0,bottom=0;
  for(let j=0;j<queue.length;j++){
   const x=queue[j]%w,y=Math.floor(queue[j]/w);left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
   for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const xx=x+dx,yy=y+dy,k=yy*w+xx;if(xx>=0&&yy>=0&&xx<w&&yy<h&&mask[k]){mask[k]=0;queue.push(k);}}
  }
  parts.push({left,top,width:right-left+1,height:bottom-top+1,area:queue.length});
 }
 const face=parts.sort((a,b)=>b.area-a.area)[0];if(!face||face.area<50)throw Error('No usable face landmark');return face;
}
function alphaBox(data,w,h){
 let left=w,top=h,right=0,bottom=0;
 for(let i=0;i<w*h;i++)if(data[i*4+3]>80){const x=i%w,y=Math.floor(i/w);left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 return{left,top,width:right-left+1,height:bottom-top+1};
}
const files={},muzzles={},report={};
for(let phase=1;phase<=3;phase++)for(const kind of ['idle','cast']){
 const name=`phase-${phase}-${kind}`,file=dir+'/sources/'+name+'.png',m=await sharp(file).metadata(),cw=Math.floor(m.width/2),ch=Math.floor(m.height/2),cels=[];
 for(let frame=0;frame<4;frame++){
  const input=await sharp(file).extract({left:frame%2*cw,top:Math.floor(frame/2)*ch,width:cw,height:ch}).png().toBuffer();
  const s=await spriteComponents(input),body=s.components.sort((a,b)=>b.area-a.area)[0],rgba=Buffer.alloc(cw*ch*4);
  for(let p=0;p<s.labels.length;p++)if(s.labels[p]===body.id)s.data.copy(rgba,p*4,p*4,p*4+4);
  cels.push({rgba,body,face:faceBox(rgba,cw,ch)});
 }
 const scale=Math.min(430/Math.max(...cels.map(q=>q.body.height)),480/Math.max(...cels.map(q=>q.body.width))),parts=[];
 for(const [i,q]of cels.entries()){
  const w=Math.round(q.body.width*scale),h=Math.round(q.body.height*scale),left=Math.round((512-w)/2),top=499-h;
  const input=await sharp(q.rgba,{raw:{width:cw,height:ch,channels:4}}).extract({left:q.body.left,top:q.body.top,width:q.body.width,height:q.body.height}).resize(w,h).png().toBuffer();
  parts.push({input,left:i*512+left,top});
 }
 const output=out+'/'+name+'.webp';await sharp({create:{width:2048,height:512,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(output);
 files['nightmare-'+name]={file:output,loop:true};
}
for(const [key,file,loop]of [
 ['nightmare-phase-one','nightmare-madness-v2/phase-two',false],['nightmare-phase-two','nightmare-madness-v2/phase-two',false],['nightmare-phase-three','nightmare-madness-v2/phase-three',false],
 ['nightmare-phase-one-walk','nightmare-madness-v2/phase-two-walk',true],['nightmare-phase-two-walk','nightmare-madness-v2/phase-two-walk',true],['nightmare-phase-three-walk','nightmare-madness-v2/phase-three-walk',true],
 ['aerial-boss-air-actions','nightmare-aerial-v3/boss-air-actions',false],['pressure-boss-air','nightmare-sprites-v6/boss-air',true]
])files[key]={file:'public/arcade/act-two/'+file+'.webp',loop};
for(const[key,item]of Object.entries(files)){
 const m=await sharp(item.file).metadata(),side=m.width/4,frames=[];
 for(let f=0;f<m.height/side*4;f++){
  const data=await sharp(item.file).extract({left:f%4*side,top:Math.floor(f/4)*side,width:side,height:side}).ensureAlpha().raw().toBuffer(),face=faceBox(data,side,side),body=alphaBox(data,side,side);
  let sx=0,n=0;for(let y=body.top+body.height-18;y<body.top+body.height;y++)for(let x=0;x<side;x++)if(data[(y*side+x)*4+3]>150){sx+=x;n++;}
  frames.push({face,body,footX:n?sx/n:side/2,data});
 }
 report[key]={file:item.file,loop:item.loop,frames};
}
const hexy=await sharp('public/arcade/sprites/hexy/reactions.webp').extract({left:0,top:0,width:320,height:320}).ensureAlpha().raw().toBuffer(),hexyBounds=alphaBox(hexy,320,320),hexyHeight=hexyBounds.height*116/320;
const reference=report['nightmare-phase-1-idle'].frames,targetHeight=hexyHeight*1.15,targetFaceWidth=median(reference.map(q=>q.face.width))*targetHeight/median(reference.map(q=>q.body.height));
const oldMuzzles={...(await import('../../src/components/arcade/adventure/actors/bosses/nightmareRegistration.js')).NIGHTMARE_MUZZLES};
const aerial=(await import('../../src/components/arcade/adventure/actors/bosses/nightmareAerialRegistration.js')).NIGHTMARE_AERIAL_SOCKETS;
const pressure=(await import('../../src/components/arcade/adventure/actors/bosses/nightmarePressureRegistration.js')).NIGHTMARE_PRESSURE_PALMS;
const registration={};
for(const[key,item]of Object.entries(report)){
 registration[key]=[];muzzles[key]=[];
 for(const [f,q]of item.frames.entries()){
  // Use a common anatomical scale within a loop. A bent knee or raised
  // staff must never make the character grow or shrink between drawings.
  const group=key==='pressure-boss-air'?item.frames.slice(Math.floor(f/4)*4,Math.floor(f/4)*4+4):key==='aerial-boss-air-actions'?item.frames.slice(f<4?0:f<10?4:f<14?10:14,f<4?4:f<10?10:f<14?14:16):item.loop?item.frames:[q];
  let faceWidth=median(group.map(r=>r.face.width)),pixelScale;
  // Spiral eyes and the open mouth split the warm skin mask. These reviewed
  // skull widths include both cheeks; they are anatomical landmarks, not
  // a request to make the whole alpha bounding box equally tall.
  if(key==='nightmare-phase-three-walk')faceWidth=84;
  else if(['nightmare-phase-one','nightmare-phase-two','nightmare-phase-three'].includes(key))faceWidth=f===15?66:80;
  else if(key==='aerial-boss-air-actions'&&(f<4||f>=10&&f<14))faceWidth=79;
  // These new poses are equivalent across phases. Match their standing
  // stature directly; the casting stance bends the knees by six percent.
  if(/^nightmare-phase-[123]-(idle|cast)$/.test(key))pixelScale=targetHeight*(key.endsWith('-cast')?.94:1)/median(group.map(r=>r.body.height));
  else pixelScale=targetFaceWidth/faceWidth;
  const size=512*pixelScale,footX=median(group.map(r=>r.footX));
  const offsetX=(256-footX)*pixelScale;
  registration[key].push({size:+size.toFixed(5),offsetX:+offsetX.toFixed(5),faceWidth:q.face.width,worldFaceWidth:+(q.face.width*pixelScale).toFixed(4),visibleHeight:+(q.body.height*pixelScale).toFixed(4)});
  if(key.includes('-cast')){
   let x=0,y=0,n=0;for(let yy=0;yy<512;yy++)for(let xx=0;xx<q.face.left-35;xx++){
    const p=(yy*512+xx)*4,[r,g,b,a]=q.data.subarray(p,p+4);if(a>150&&r>210&&g>205&&b>195&&yy>q.face.top&&yy<q.face.top+q.face.height*1.7){x+=xx;y+=yy;n++;}
   }
   if(!n)throw Error('Missing open palm '+key+':'+f);muzzles[key].push([x/n,y/n]);
  }else{
   const fallback=key==='nightmare-phase-one'?'nightmare-phase-two':key==='nightmare-phase-one-walk'?'nightmare-phase-two-walk':key;
   muzzles[key].push((key==='pressure-boss-air'?pressure[f]:aerial[key]?.[f]||oldMuzzles[fallback]?.[f])||[q.face.left,q.face.top+q.face.height]);
  }
  delete q.data;
 }
}
const metadata={reference:{hexyHeight,targetHeight,ratio:1.15,targetFaceWidth,method:'Standing hat-to-sole height versus Hexy reactions:0. Equivalent idle/cast poses match across phases. Older poses use reviewed skull width when spiral eyes fragment the skin mask; a common scale within loops preserves breathing, bent limbs and raised props.'},registration,assets:report,muzzles};
await fs.writeFile(dir+'/registration.json',JSON.stringify(metadata,null,2)+'\n');
await fs.writeFile('src/components/arcade/adventure/actors/bosses/nightmareBodyRegistration.js','// Generated by register-nightmare-coherence.mjs. World scale only; portraits retain cinematic magnification.\nexport const NIGHTMARE_STATURE='+JSON.stringify(metadata.reference)+';\nexport const NIGHTMARE_BODY_REGISTRATION='+JSON.stringify(registration)+';\nexport const NIGHTMARE_BODY_MUZZLES='+JSON.stringify(muzzles)+';\n');
console.log(JSON.stringify(metadata.reference));
