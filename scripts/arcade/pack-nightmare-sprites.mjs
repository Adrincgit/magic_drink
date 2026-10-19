import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';

const dir='context/arcade/nightmare-sprites-v6',out='public/arcade/act-two/nightmare-sprites-v6';
await fs.mkdir(out,{recursive:true});
const heroNames=['hexy-focus','hexy-shock','hexy-strain','hexy-strain','hexy-rally'];
const bossNames=['boss-laugh','boss-glee','boss-mad','boss-strain'];
const native=704,registration={},crops={},portraitTips=[],heroSockets={},palms=[];
const cache=new Map();
function centroid(data,w,h,test){
 let x=0,y=0,n=0;
 for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
  const p=(yy*w+xx)*4;if(data[p+3]>120&&test(xx/w,yy/h,...data.subarray(p,p+3))){x+=xx;y+=yy;n++;}
 }
 if(!n)throw Error('Missing physical registration point');return[x/n,y/n];
}
async function sourceCels(name,hero=false){
 if(cache.has(name))return cache.get(name);
 const file=dir+'/sources/'+name+'.png',m=await sharp(file).metadata(),cw=Math.floor(m.width/2),ch=Math.floor(m.height/2),frames=[];
 for(let frame=0;frame<4;frame++){
  const input=await sharp(file).extract({left:frame%2*cw,top:Math.floor(frame/2)*ch,width:cw,height:ch}).png().toBuffer();
  const s=await spriteComponents(input),body=s.components.sort((a,b)=>b.area-a.area)[0],rgba=Buffer.alloc(cw*ch*4);
  // Only discard disconnected extraction specks. Preserve the drawing's RGB
  // and alpha; no fake in-between frames, warps, or facial repainting.
  for(let p=0;p<s.labels.length;p++)if(s.labels[p]===body.id)s.data.copy(rgba,p*4,p*4,p*4+4);
  const anchor=hero?centroid(rgba,cw,ch,(x,y,r,g,b)=>x>.4&&x<.72&&y<.24&&r>180&&g>125&&b<140):centroid(rgba,cw,ch,(x,y,r,g,b)=>x>.27&&x<.66&&y>.2&&y<.48&&r>190&&g>110&&b>100&&r>g+13);
  const dx=Math.round((hero?385:335)-anchor[0]),dy=Math.round((hero?120:260)-anchor[1]);
  const tip=hero?centroid(rgba,cw,ch,(x,y,r,g,b)=>x>.76&&y<.42&&r>180&&g>125&&b<140):null;
  const left=Math.max(0,-dx),top=Math.max(0,-dy),width=Math.min(cw-left,native-Math.max(0,dx)),height=Math.min(ch-top,native-Math.max(0,dy));
  const clipped=await sharp(rgba,{raw:{width:cw,height:ch,channels:4}}).extract({left,top,width,height}).png().toBuffer();
  const aligned=await sharp({create:{width:native,height:native,channels:4,background:'#0000'}}).composite([{input:clipped,left:Math.max(0,dx),top:Math.max(0,dy)}]).png().toBuffer();
  frames.push({input:aligned,tip:tip?.map((v,i)=>v+(i?dy:dx)),source:name,sourceFrame:frame,anchor,offset:[dx,dy],body});
 }
 cache.set(name,frames);return frames;
}
for(const [kind,names]of [['hexy-portraits',heroNames],['boss-portraits',bossNames]]){
 const parts=[];crops[kind]=[];registration[kind]=[];
 for(const [row,name]of names.entries())for(const [cel,q]of (await sourceCels(name,kind.startsWith('hexy'))).entries()){
  parts.push({input:q.input,left:cel*native,top:row*native});crops[kind].push([cel*native,row*native,native,native]);
  const {input,...meta}=q;registration[kind].push(meta);if(q.tip)portraitTips.push(q.tip);
 }
 await sharp({create:{width:native*4,height:native*names.length,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/'+kind+'.webp');
}
const allHero=registration['hexy-portraits'],worldLeft=Math.min(...allHero.map(q=>q.body.left+q.offset[0])),worldTop=Math.min(...allHero.map(q=>q.body.top+q.offset[1]));
const worldRight=Math.max(...allHero.map(q=>q.body.left+q.body.width+q.offset[0])),worldBottom=Math.max(...allHero.map(q=>q.body.top+q.body.height+q.offset[1]));
const worldCrop={left:worldLeft,top:worldTop,width:worldRight-worldLeft,height:worldBottom-worldTop};
for(const air of [false,true]){
 const side=320,scale=Math.min(274/worldCrop.height,300/worldCrop.width),parts=[],tips=[];
 for(const [row,name]of heroNames.entries())for(const [cel,q]of (await sourceCels(name,true)).entries()){
  const w=Math.round(worldCrop.width*scale),h=Math.round(worldCrop.height*scale),left=Math.round(160-(360-worldLeft)*scale),top=300-h;
  parts.push({input:await sharp(q.input).extract(worldCrop).resize(w,h).png().toBuffer(),left:cel*side+left,top:row*side+top});
  tips.push({tip:[left+(q.tip[0]-worldLeft)*scale,top+(q.tip[1]-worldTop)*scale]});
 }
 const name=air?'air':'ground';heroSockets['nightmare-pressure-'+name]=tips;
 await sharp({create:{width:1280,height:1600,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/hexy-'+name+'.webp');
}
const old=JSON.parse(await fs.readFile('context/arcade/nightmare-pressure-v4/registration.json','utf8'));
const madFile=dir+'/sources/boss-air-mad.png',mm=await sharp(madFile).metadata(),mw=Math.floor(mm.width/2),mh=Math.floor(mm.height/2),mad=[];
for(let f=0;f<4;f++){
 const input=await sharp(madFile).extract({left:f%2*mw,top:Math.floor(f/2)*mh,width:mw,height:mh}).png().toBuffer(),s=await spriteComponents(input),body=s.components.sort((a,b)=>b.area-a.area)[0],rgba=Buffer.alloc(body.width*body.height*4);
 for(let y=0;y<body.height;y++)for(let x=0;x<body.width;x++){const p=(y+body.top)*mw+x+body.left;if(s.labels[p]===body.id)s.data.copy(rgba,(y*body.width+x)*4,p*4,p*4+4);}
 const tip=centroid(rgba,body.width,body.height,(x,y,r,g,b)=>x<.3&&y<.6&&r>195&&g>190&&b>180);mad.push({rgba,body,tip});
}
const scale=442/Math.max(...mad.map(q=>q.body.height)),parts=[];registration['boss-air']=[];
for(let row=0;row<4;row++)for(let f=0;f<4;f++){
 let input,tip,meta;
 if(row===0||row===3){const frame=row===0?f:8+f;input=await sharp('public/arcade/act-two/nightmare-pressure-v4/boss-air.webp').extract({left:frame%4*512,top:Math.floor(frame/4)*512,width:512,height:512}).png().toBuffer();tip=old['boss-air'][frame].tip;meta={source:'nightmare-pressure-v4/boss-air',sourceFrame:frame};}
 else{
  const q=mad[f],w=Math.round(q.body.width*scale),h=Math.round(q.body.height*scale),left=Math.round((512-w)/2),top=499-h;
  input=await sharp({create:{width:512,height:512,channels:4,background:'#0000'}}).composite([{input:await sharp(q.rgba,{raw:{width:q.body.width,height:q.body.height,channels:4}}).resize(w,h).png().toBuffer(),left,top}]).png().toBuffer();
  tip=[left+q.tip[0]*scale,top+q.tip[1]*scale];meta={source:'boss-air-mad',sourceFrame:f};
 }
 parts.push({input,left:f*512,top:row*512});palms.push(tip);registration['boss-air'].push({...meta,tip});
}
await sharp({create:{width:2048,height:2048,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/boss-air.webp');
const module=await fs.readFile('src/components/arcade/adventure/actors/bosses/nightmarePressureRegistration.js','utf8'),aperture=JSON.parse(module.match(/NIGHTMARE_METER_WINDOW=(.*);/)[1]);
await fs.writeFile('src/components/arcade/adventure/actors/bosses/nightmarePressureRegistration.js','// Generated by pack-nightmare-sprites.mjs. Genuine cel loops; no mesh deformation.\nexport const NIGHTMARE_PRESSURE_HEXY='+JSON.stringify(heroSockets)+';\nexport const NIGHTMARE_PRESSURE_PALMS='+JSON.stringify(palms)+';\nexport const NIGHTMARE_PRESSURE_PORTRAITS='+JSON.stringify(crops)+';\nexport const NIGHTMARE_PRESSURE_PORTRAIT_TIPS='+JSON.stringify(portraitTips)+';\nexport const NIGHTMARE_METER_WINDOW='+JSON.stringify(aperture)+';\n');
await fs.writeFile(dir+'/registration.json',JSON.stringify(registration,null,2)+'\n');
console.log('Packed native drawn cel loops, world actors and per-frame physical star/palm sockets.');
