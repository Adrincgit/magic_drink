import fs from 'node:fs';
import sharp from 'sharp';
import {components,landmarks} from './sprite-packing.mjs';
const out='context/arcade/animation-refinement/';
const strips=[
 {name:'air-horizontal',sheet:'air-aim',row:0,air:true,count:12,frames:[0,3,2,0]},
 {name:'up-diagonal',sheet:'ground-aim',row:0,standing:true},
 {name:'up-vertical',sheet:'ground-aim',row:1,standing:true},
 {name:'crouch-focused',sheet:'ground-aim',row:2},
 // All arms are repaired; omit frame 1 because its face changes width.
 {name:'down-diagonal',sheet:'ground-aim',row:3,standing:true,frames:[0,3,2,0]},
 {name:'air-up-diagonal',sheet:'air-aim',row:1,air:true},
 {name:'air-up-vertical',sheet:'air-aim',row:2,air:true},
 {name:'horizontal',sheet:'stand-fire',row:0,standing:true,frames:[0,3,0,0]},
];
const median=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
const ref=landmarks(await sharp(out+'identity-reference.webp').ensureAlpha().raw().toBuffer(),320,320);
const atlas=JSON.parse(fs.readFileSync('src/components/arcade/adventure/actors/hexy/hexyActionAtlas.js','utf8').split('export default ')[1].split(';')[0]);
const sheets={'ground-aim':[],'air-aim':[],'stand-fire':[]},measurements=[],registrations={};
// Isolate the selected connected drawing, retaining its antialiased edge but
// excluding stray pixels from the adjacent generated figure's hair/wand.
async function isolated(path,box,seed,sourceWidth){
 const data=await sharp(path).extract(box).ensureAlpha().raw().toBuffer(),w=box.width,h=box.height,seen=new Uint8Array(w*h),keep=new Uint8Array(w*h);
 const start=(Math.floor(seed/sourceWidth)-box.top)*w+seed%sourceWidth-box.left,queue=[start];seen[start]=1;
 for(let j=0;j<queue.length;j++){
  const p=queue[j],x=p%w,y=Math.floor(p/w);
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)keep[(y+dy)*w+x+dx]=1;
  for(const n of [x?p-1:-1,x<w-1?p+1:-1,y?p-w:-1,y<h-1?p+w:-1])if(n>=0&&!seen[n]&&data[n*4+3]>128){seen[n]=1;queue.push(n);}
 }
 for(let i=0;i<w*h;i++)if(!keep[i])data[i*4+3]=0;
 return sharp(data,{raw:{width:w,height:h,channels:4}}).png().toBuffer();
}
for(const spec of strips){
 const path=out+spec.name+'-source.webp', {data,info}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let parts=components(data,info.width,info.height,(d,k)=>d[k+3]>128).filter(q=>q.count>2000).slice(0,spec.count||4);
 if(spec.count)parts=parts.sort((a,b)=>(a.y+a.h/2)-(b.y+b.h/2)).slice(0,4);
 parts.sort((a,b)=>a.x-b.x);
 if(parts.length!==4)throw Error('Expected four figures: '+spec.name);
 const frames=[];
 for(const q of parts){
  const box={left:Math.max(0,q.x-2),top:Math.max(0,q.y-2),width:Math.min(info.width-Math.max(0,q.x-2),q.w+4),height:Math.min(info.height-Math.max(0,q.y-2),q.h+4)};
  const input=await isolated(path,box,q.seed,info.width),pixels=await sharp(input).ensureAlpha().raw().toBuffer();
  frames.push({box,input,...landmarks(pixels,box.width,box.height)});
 }
 const selected=(spec.frames||[0,1,2,3]).map(i=>frames[i]);
 // A single isotropic scale for the entire strip. Never widen a torso or
 // rescale the face independently between rest, release and recovery.
 const bodyHeight=median(selected.map(q=>q.foot-q.hat));
 const desiredScale=spec.name==='air-up-vertical'?227/bodyHeight:spec.standing?(spec.name==='down-diagonal'?230:242)/bodyHeight:56/median(selected.map(q=>q.face.w));
 const scale=Math.min(desiredScale,296/Math.max(...selected.map(q=>q.foot)),312/Math.max(...selected.map(q=>q.box.width)));
 const renderScale=desiredScale/scale;
 console.log(spec.name,{scale,renderScale,face:median(selected.map(q=>q.face.w))*desiredScale,body:median(selected.map(q=>q.foot-q.hat))*desiredScale});
 if(path!==out+spec.name+'-source.webp')await sharp(path).webp({quality:94,alphaQuality:100}).toFile(out+spec.name+'-source.webp');
 for(let i=0;i<4;i++){
  const q=selected[i],w=Math.round(q.box.width*scale),h=Math.round(q.box.height*scale);
  // Ground: boot baseline. Air: fixed head center so firing cannot make the
  // whole character twitch sideways as her tucked feet shift.
  const pivot=spec.air?q.face.x+q.face.w/2:q.feet;
  const desiredX=160+((spec.air?177:160)-160)/renderScale-pivot*scale;
  const x=Math.max(1,Math.min(319-w,Math.round(desiredX))),y=300-Math.round(q.foot*scale);
  if(x<0||y<0||x+w>320||y+h>320)throw Error(`Overflow ${spec.name}:${i} ${x},${y},${w},${h}`);
  const input=await sharp(q.input).resize(w,h).png().toBuffer();
  sheets[spec.sheet].push({input,left:i*320+x,top:spec.row*320+y});
  // Overhead aim: the highest gold region is the wand star. A boot buckle
  // can be farther right, so horizontal selection is invalid for this pose.
  const star=q.gold.reduce((a,b)=>spec.name.includes('vertical')?(b.y<a.y?b:a):(b.x+b.w>a.x+a.w?b:a)),tip=[Math.round(x+(star.x+star.w/2)*scale),Math.round(y+(star.y+star.h/2)*scale)];
  (atlas[spec.sheet]??=[])[spec.row*4+i]={tip};
  const offset=(desiredX-x)*renderScale;
  registrations[spec.sheet+':'+(spec.row*4+i)]={scale:renderScale,x:offset};
  measurements.push({sheet:spec.sheet,frame:spec.row*4+i,scale:desiredScale,bodyHeight:(q.foot-q.hat)*desiredScale,faceWidth:q.face.w*desiredScale,faceX:160+(x+(q.face.x+q.face.w/2)*scale-160)*renderScale+offset,faceY:300+(y+(q.face.y+q.face.h/2)*scale-300)*renderScale,sourceFrame:(spec.frames||[0,1,2,3])[i]});
 }
}
for(const [name,cells]of Object.entries(sheets)){
 const height=name==='ground-aim'?1280:name==='air-aim'?960:320;
 await sharp({create:{width:1280,height,channels:4,background:'#00000000'}}).composite(cells).webp({quality:94,alphaQuality:100}).toFile('public/arcade/sprites/hexy/'+name+'.webp');
}
fs.writeFileSync('src/components/arcade/adventure/actors/hexy/hexyActionAtlas.js','// Wand-star centers measured after isotropic strip registration.\nexport default '+JSON.stringify(atlas)+';\nexport const ACTION_REGISTRATION='+JSON.stringify(registrations)+';\n');
fs.writeFileSync(out+'registration.json',JSON.stringify(measurements,null,2));
fs.writeFileSync('tests/fixtures/hexy-pose-registration.json',JSON.stringify(measurements,null,2));
