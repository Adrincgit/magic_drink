import fs from 'node:fs';
import sharp from 'sharp';

const dir='context/arcade/hexy-acting/',out='public/arcade/sprites/hexy/';
const atlas={},registration={},records={};
const bounds=(points,w)=>{
 let l=w,t=Infinity,r=0,b=0;
 for(const k of points){const x=k%w,y=Math.floor(k/w);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
 return{l,t,r,b,w:r-l+1,h:b-t+1};
};
function components(data,w,h,test){
 const seen=new Uint8Array(w*h),result=[];
 for(let k=0;k<seen.length;k++)if(!seen[k]&&test(k)){
  const q=[k];seen[k]=1;
  for(let i=0;i<q.length;i++){
   const at=q[i],x=at%w,y=Math.floor(at/w);
   for(const n of [x?at-1:-1,x<w-1?at+1:-1,y?at-w:-1,y<h-1?at+w:-1])if(n>=0&&!seen[n]&&test(n)){seen[n]=1;q.push(n);}
  }
  result.push(q);
 }
 return result.sort((a,b)=>b.length-a.length);
}
const mean=(p,w)=>[p.reduce((v,k)=>v+k%w,0)/p.length,p.reduce((v,k)=>v+Math.floor(k/w),0)/p.length];
async function readCels(source,rows,columns=4){
 const raw=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),sw=raw.info.width,sh=raw.info.height,cels=[];
 // Source gutters are not perfectly regular. Extract whole connected bodies
 // before assigning rows/columns so a star cannot be cut at a nominal grid.
 const bodies=components(raw.data,sw,sh,k=>raw.data[k*4+3]>40).slice(0,rows*columns).map(body=>({body,b:bounds(body,sw)})).sort((a,b)=>a.b.t+a.b.h/2-b.b.t-b.b.h/2);
 if(bodies.length!==rows*columns)throw Error('Missing cels '+source);
 for(let row=0;row<rows;row++){
 const ordered=bodies.slice(row*columns,row*columns+columns).sort((a,b)=>a.b.l-b.b.l);
 for(const [col,{body,b:sourceBounds}]of ordered.entries()){
  const w=sourceBounds.w,h=sourceBounds.h,info={width:w,height:h,channels:4},data=Buffer.alloc(w*h*4);
  for(const k of body){const x=k%sw-sourceBounds.l,y=Math.floor(k/sw)-sourceBounds.t;raw.data.copy(data,(y*w+x)*4,k*4,k*4+4);}
  const points=body.map(k=>(Math.floor(k/sw)-sourceBounds.t)*w+k%sw-sourceBounds.l);
  const b=bounds(points,w);
  const gold=components(data,w,h,k=>{const [r,g,bl,a]=data.subarray(k*4,k*4+4);return a>100&&r>180&&g>140&&bl<110;}).filter(p=>p.length>12);
  // The hat star is attached to navy fabric. The wand star is the other,
  // larger gold component; its location can change during anticipation.
  const star=gold[0];if(!star)throw Error('Missing star '+source+':'+row+','+col);
  const reds=components(data,w,h,k=>{const x=k%w,y=Math.floor(k/w),[r,g,bl,a]=data.subarray(k*4,k*4+4);return a>100&&r>130&&g<85&&bl<90&&x>b.l+b.w*.35&&y>b.t+b.h*.2&&y<b.t+b.h*.8;}).filter(p=>p.length>20);
  const bow=reds[0]?mean(reds[0],w):[b.l+b.w*.57,b.t+b.h*.47];
  const faces=components(data,w,h,k=>{const x=k%w,y=Math.floor(k/w),[r,g,bl,a]=data.subarray(k*4,k*4+4);return a>100&&r>175&&g>115&&g>bl*1.05&&r>g*1.05&&y<bow[1]&&x>b.w*.4;});
  const faceHeight=faces[0]?bounds(faces[0],w).h:0;
  cels.push({data,info,b,sourceBounds,star:mean(star,w),bow,bowSize:Math.sqrt(reds[0]?.length||100),faceHeight,source,row,col});
  }
 }
 return cels.sort((a,b)=>a.row-b.row||a.col-b.col);
}
const median=values=>values.toSorted((a,b)=>a-b)[Math.floor(values.length/2)];
const repairDir='context/arcade/hexy-down-repair/';
const repaired=fs.existsSync(repairDir+'diagonal-ground-source.png');
let young;
if(repaired){
 const reference=await readCels(out+'reactions.webp',2),height=reference[0].faceHeight;
 young=Object.fromEntries(await Promise.all(['diagonal-ground','diagonal-air','down-ground','down-air'].map(async key=>{
  const cels=await readCels(repairDir+key+'-source.png',2),face=median(cels.map(c=>c.faceHeight));
  if(!face||!height)throw Error('Missing face calibration '+key);
  console.log('Face calibration '+key+': '+face+' -> '+height);
  return[key,cels.map(c=>({...c,artScale:height/face}))];
 })));
}
for(const direction of ['diagonal-up','up','diagonal-down','down']){
 const sheet='super-'+direction+'-v2',corrected=direction==='down'&&fs.existsSync(dir+'ultimate-down-correct-hand-source.png');
 let cels=await readCels(dir+'ultimate-'+direction+(corrected?'-correct-hand':'')+'-source.png',4);const layers=[];
 const youngDown=young&&['diagonal-down','down'].includes(direction);
 const chargePath=dir+'ultimate-'+direction+'-charge-source.png';
 if(!youngDown&&fs.existsSync(chargePath)){
  const charge=await readCels(chargePath,2);
  // The approved charge keeps the canonical far hand throughout. Discharge
  // wind cels retain their existing targeted ground and aerial acting.
  for(const row of [0,1]){
   const artScale=median(cels.slice(row*8+4,row*8+8).map(c=>c.b.h))/charge[row*4+3].b.h;
   for(let i=0;i<(corrected?2:4);i++)cels[row*8+i]={...charge[row*4+i],row:row*2,artScale};
  }
 }
 if(!youngDown&&corrected){
  const air=await readCels(dir+'ultimate-down-air-vertical-source.png',2,2),height=median(cels.slice(12).map(c=>c.b.h));
  const airScale=height/median(air.map(c=>c.b.h));
  for(let i=0;i<4;i++)cels[12+i]={...air[i],row:3,col:i,artScale:airScale};
 }
 if(youngDown){
  const dg=young['diagonal-ground'],da=young['diagonal-air'],vg=young['down-ground'],va=young['down-air'];
  // Reject the vertical ground charge's swapped hand and the standing cells
  // in the aerial diagonal source. Only selected, inspected drawings enter.
  cels=direction==='down'?[...dg.slice(0,3),vg[3],...vg.slice(4),...va]:[...dg,...va.slice(0,3),da[4],...da.slice(4)];
  cels=cels.map((c,i)=>({...c,row:Math.floor(i/4),col:i%4}));
 }
 // One scale for the whole sheet. No individual frame rescaling that makes
 // her head breathe, changes wand length or conceals a lack of animation.
 const scale=Math.min(youngDown?1:Infinity,...cels.map(c=>Math.min(308/c.b.w,290/c.b.h)/(c.artScale||1)));
 const groundBowY=median(cels.slice(4,8).map(c=>(c.b.b-c.bow[1])*scale*(c.artScale||1)));
 const airBowY=median(cels.slice(12).map(c=>(c.b.b-c.bow[1])*scale*(c.artScale||1)));
 atlas[sheet]=[];records[sheet]=[];
 for(const [frame,c]of cels.entries()){
  const celScale=scale*(c.artScale||1),bw=Math.round(c.b.w*celScale),bh=Math.round(c.b.h*celScale);
  let left=Math.round(177-(c.bow[0]-c.b.l)*celScale),top=300-bh;
  // Casting loops share their body anchor. Charge retains its crouch and
  // uncoiling; aerial knees do not drag the torso up and down each cel.
  if(c.row%2)top=Math.round(300-(c.row===1?groundBowY:airBowY)-(c.bow[1]-c.b.t)*celScale);
  left=Math.max(3,Math.min(317-bw,left));top=Math.max(3,Math.min(317-bh,top));
  const input=await sharp(c.data,{raw:c.info}).extract({left:c.b.l,top:c.b.t,width:c.b.w,height:c.b.h}).resize(bw,bh).png().toBuffer();
  layers.push({input,left:frame%4*320+left,top:Math.floor(frame/4)*320+top});
  const tip=[+(left+(c.star[0]-c.b.l)*celScale).toFixed(2),+(top+(c.star[1]-c.b.t)*celScale).toFixed(2)];
  atlas[sheet].push({tip});registration[sheet+':'+frame]={scale:youngDown?1:1.075,x:0};
  records[sheet].push({frame,source:c.source,sourceRow:c.row,sourceBounds:c.b,sourceStar:c.star,sourceBow:c.bow,faceHeight:c.faceHeight,left,top,scale:celScale,tip});
 }
 await sharp({create:{width:1280,height:1280,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(out+sheet+'.webp');
}
{
 const sheet='super-horizontal-charge-v2',cels=await readCels(dir+'ultimate-horizontal-charge-source.png',2),layers=[];
 const scale=Math.min(...cels.map(c=>Math.min(308/c.b.w,270/c.b.h)));
 atlas[sheet]=[];records[sheet]=[];
 for(const [frame,c]of cels.entries()){
  const bw=Math.round(c.b.w*scale),bh=Math.round(c.b.h*scale),left=Math.max(3,Math.min(317-bw,Math.round(170-(c.bow[0]-c.b.l)*scale))),top=300-bh;
  const input=await sharp(c.data,{raw:c.info}).extract({left:c.b.l,top:c.b.t,width:c.b.w,height:c.b.h}).resize(bw,bh).png().toBuffer();
  layers.push({input,left:frame%4*320+left,top:Math.floor(frame/4)*320+top});
  const tip=[+(left+(c.star[0]-c.b.l)*scale).toFixed(2),+(top+(c.star[1]-c.b.t)*scale).toFixed(2)];
  atlas[sheet].push({tip});records[sheet].push({frame,sourceBounds:c.b,left,top,scale,tip});
 }
 await sharp({create:{width:1280,height:640,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(out+sheet+'.webp');
}
for(const action of ['run','run-fire','run-diagonal-up']){
 const sheet='tired-'+action+'-v1',cels=await readCels(dir+'tired-'+action+'-source.png',3),layers=[];
 const original=await readCels(out+action+'.webp',3);
 // Match the original body/foot registration, preserving the 12-cel gait.
 const scale=Math.min(median(original.map((c,i)=>c.b.h/cels[i].b.h)),...cels.map(c=>Math.min(310/c.b.w,285/c.b.h)));
 atlas[sheet]=[];records[sheet]=[];
 for(const [frame,c]of cels.entries()){
  const base=original[frame],bw=Math.round(c.b.w*scale),bh=Math.round(c.b.h*scale);
  const baseX=base.sourceBounds.l-base.col*320+base.bow[0],bottom=base.sourceBounds.b-base.row*320+1;
  const left=Math.max(2,Math.min(318-bw,Math.round(baseX-(c.bow[0]-c.b.l)*scale))),top=bottom-bh;
  if(top<0||bw>316)throw Error('Oversized tired cel '+frame);
  const input=await sharp(c.data,{raw:c.info}).extract({left:c.b.l,top:c.b.t,width:c.b.w,height:c.b.h}).resize(bw,bh).png().toBuffer();
  layers.push({input,left:frame%4*320+left,top:Math.floor(frame/4)*320+top});
  const tip=[+(left+(c.star[0]-c.b.l)*scale).toFixed(2),+(top+(c.star[1]-c.b.t)*scale).toFixed(2)];
  atlas[sheet].push({tip});records[sheet].push({frame,sourceBounds:c.b,left,top,scale,tip});
 }
 await sharp({create:{width:1280,height:960,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(out+sheet+'.webp');
}
fs.writeFileSync('src/components/arcade/adventure/actors/hexy/hexyActingAtlas.js','// Registered hand-drawn preparation, casting wind and tired locomotion.\nexport const actingRegistration='+JSON.stringify(registration)+';\nexport default '+JSON.stringify(atlas)+';\n');
fs.writeFileSync(dir+'registration.json',JSON.stringify(records,null,2)+'\n');
console.log('Packed '+Object.keys(atlas).length+' sheets / '+Object.values(atlas).reduce((n,a)=>n+a.length,0)+' cels');
