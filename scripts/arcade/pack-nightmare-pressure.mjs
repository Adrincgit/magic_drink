import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
const dir='context/arcade/nightmare-pressure-v4',out='public/arcade/act-two/nightmare-pressure-v4';
await fs.mkdir(out,{recursive:true});const config={
 'hexy-ground':{count:20,side:320,hero:true},'hexy-air':{count:20,side:320,hero:true},
 'hexy-portraits':{count:20,side:640,portrait:true,sections:['focus','surprise','brace','strain','rally']},'boss-air':{count:16,side:512},'boss-portraits':{count:16,side:640,portrait:true,sections:['laugh','surge','strain','overwhelmed']}
};
const registration={},hexy={},palms=[],crops={};
for(const [name,cfg]of Object.entries(config)){
 const files=cfg.sections?cfg.sections.map(role=>({file:name.replace('-portraits','-portrait-')+role+(name==='hexy-portraits'?'-anatomy':'')})):cfg.hero?[{file:name,expected:20,frames:[0,1,2,3,4,5,6,7]},{file:name+'-anatomy',expected:12}]:[{file:name}],boxes=[];
 for(const entry of files){
  const {file}=entry;
  const selectedFile=await fs.access(dir+'/sources/'+file+'-clean.png').then(()=>file+'-clean').catch(()=>file);
  if(file==='boss-portrait-strain'||file.startsWith('hexy-portrait-')&&file.endsWith('-anatomy')){
   // Its painted magic crosses the gutter. Separate the four source cells
   // before identifying each figure, so two portraits never become one cel.
   const m=await sharp(dir+'/sources/'+selectedFile+'.png').metadata(),cw=m.width/2,ch=m.height/2;
   for(let f=0;f<4;f++){
    const input=await sharp(dir+'/sources/'+selectedFile+'.png').extract({left:f%2*cw,top:Math.floor(f/2)*ch,width:cw,height:ch}).png().toBuffer(),source=await spriteComponents(input),q=source.components.sort((a,b)=>b.area-a.area)[0];
    boxes.push({...q,file:selectedFile,sourceFrame:f,cellCrop:true,source});
   }continue;
  }
  const source=await spriteComponents(dir+'/sources/'+selectedFile+'.png'),expected=entry.expected??(cfg.sections?4:cfg.count),bodies=source.components.filter(q=>q.area>1000).sort((a,b)=>b.area-a.area).slice(0,expected).sort((a,b)=>a.cy-b.cy),cols=cfg.sections?2:4;
  if(bodies.length!==expected)throw Error(file+' requires '+expected+' isolated drawings, got '+bodies.length);
  const ordered=[];for(let i=0;i<expected;i+=cols)ordered.push(...bodies.slice(i,i+cols).sort((a,b)=>a.cx-b.cx));
  for(const [sourceFrame,q]of ordered.entries())if(!entry.frames||entry.frames.includes(sourceFrame))boxes.push({...q,file:selectedFile,sourceFrame,source});
 }
 if(boxes.length!==cfg.count)throw Error(name+' incomplete selected animation');
 for(const q of boxes){
  const {info,labels}=q.source;
  // This reaction source contains complete bodies; its cinematic panel uses
  // only the upper body, independently of the lower-resolution game artwork.
  if(q.file==='hexy-portrait-surprise')q.height=Math.round(q.height*.62);
  if(!q.cellCrop&&(q.left===0||q.top===0||q.left+q.width===info.width||q.top+q.height===info.height))throw Error(name+' '+q.file+' cel '+q.sourceFrame+' has a cropped source tip');
  let low=info.width,high=0;for(let y=q.top+q.height-12;y<q.top+q.height;y++)for(let x=q.left;x<q.left+q.width;x++)if(labels[y*info.width+x]===q.id){low=Math.min(low,x-q.left);high=Math.max(high,x-q.left);}
  q.anchor=cfg.portrait?q.width/2:(low+high)/2;
 }
 const side=cfg.side,foot=cfg.hero?300:cfg.portrait?side-12:499,scale=Math.min(cfg.portrait?1:99,(cfg.hero?274:cfg.portrait?side-30:442)/Math.max(...boxes.map(q=>q.height)),...boxes.map(q=>(side/2-8)/Math.max(q.anchor,q.width-q.anchor))),parts=[];
 registration[name]=[];
 for(const [f,q]of boxes.entries()){
  const {data,info,labels}=q.source;
  const rgba=Buffer.alloc(q.width*q.height*4);let sx=0,sy=0,sn=0;
  for(let y=0;y<q.height;y++)for(let x=0;x<q.width;x++){
   const at=(q.top+y)*info.width+q.left+x;if(labels[at]!==q.id)continue;data.copy(rgba,(y*q.width+x)*4,at*4,at*4+4);
   const [r,g,b]=data.subarray(at*4,at*4+3),star=cfg.hero&&x>q.width*.7&&y<q.height*.35&&r>170&&g>120&&b<140,palm=name==='boss-air'&&x<q.width*.3&&y<q.height*.65&&r>180&&g>180&&b>180;
   if(star||palm){sx+=x;sy+=y;sn++;}
  }
  if(!cfg.portrait&&!sn)throw Error(name+' frame '+f+' has no registered star/palm');
  const w=Math.round(q.width*scale),h=Math.round(q.height*scale),left=Math.round(side/2-q.anchor*scale),top=foot-h,tip=[left+sx/Math.max(1,sn)*scale,top+sy/Math.max(1,sn)*scale];
  const input=await sharp(rgba,{raw:{width:q.width,height:q.height,channels:4}}).resize(w,h).png().toBuffer();parts.push({input,left:f%4*side+left,top:Math.floor(f/4)*side+top});
  const {source,...box}=q;registration[name].push({source:box,left,top,w,h,scale,tip});
 }
 await sharp({create:{width:side*4,height:side*Math.ceil(cfg.count/4),channels:4,background:'#00000000'}}).composite(parts).webp({lossless:true}).toFile(out+'/'+name+'.webp');
 if(cfg.hero)hexy['nightmare-pressure-'+name.slice(5)]=registration[name].map(q=>({tip:q.tip}));
 if(name==='boss-air')palms.push(...registration[name].map(q=>q.tip));
 if(cfg.portrait){
  // One common crop for the entire animation prevents breathing/wind motion
  // from changing the panel scale or making the actor bounce in its corner.
  crops[name]=[];
  for(let row=0;row<registration[name].length;row+=4){
   const frames=registration[name].slice(row,row+4),x=Math.min(...frames.map(q=>q.left)),y=Math.min(...frames.map(q=>q.top)),w=Math.max(...frames.map(q=>q.left+q.w))-x,h=Math.max(...frames.map(q=>q.top+q.h))-y;
   crops[name].push(...frames.map((q,i)=>[(row+i)%4*side+x,Math.floor((row+i)/4)*side+y,w,h]));
  }
 }
}
const {components:meterComponents}=await spriteComponents(dir+'/sources/meter.png'),bounds=meterComponents.filter(q=>q.area>500).reduce((a,q)=>({left:Math.min(a.left,q.left),top:Math.min(a.top,q.top),right:Math.max(a.right,q.left+q.width),bottom:Math.max(a.bottom,q.top+q.height)}),{left:1e9,top:1e9,right:0,bottom:0});
await sharp(dir+'/sources/meter.png').extract({left:bounds.left,top:bounds.top,width:bounds.right-bounds.left,height:bounds.bottom-bounds.top}).resize({width:1800,withoutEnlargement:true}).webp({lossless:true}).toFile(out+'/meter.webp');
const {data:md,info:mi}=await sharp(out+'/meter.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true}),mx=Math.floor(mi.width/2),my=Math.floor(mi.height/2),clear=(x,y)=>md[(y*mi.width+x)*4+3]<24;
let ml=mx,mr=mx,mt=my,mb=my;while(clear(ml-1,my)&&ml>0)ml--;while(clear(mr+1,my)&&mr<mi.width-1)mr++;while(clear(mx,mt-1)&&mt>0)mt--;while(clear(mx,mb+1)&&mb<mi.height-1)mb++;
const meterWindow={x:(ml+4)/mi.width,y:(mt+3)/mi.height,w:(mr-ml-8)/mi.width,h:(mb-mt-6)/mi.height};if(meterWindow.w<.5||meterWindow.h<.05)throw Error('Meter aperture not found');
await fs.writeFile(dir+'/registration.json',JSON.stringify(registration,null,2)+'\n');
await fs.writeFile('src/components/arcade/adventure/actors/bosses/nightmarePressureRegistration.js','// Generated by pack-nightmare-pressure.mjs.\nexport const NIGHTMARE_PRESSURE_HEXY='+JSON.stringify(hexy)+';\nexport const NIGHTMARE_PRESSURE_PALMS='+JSON.stringify(palms)+';\nexport const NIGHTMARE_PRESSURE_PORTRAITS='+JSON.stringify(crops)+';\nexport const NIGHTMARE_METER_WINDOW='+JSON.stringify(meterWindow)+';\n');
console.log('Packed pressure acting, animated portraits and independent meter; anatomy requires visual review.');
