import fs from 'node:fs/promises';
import sharp from 'sharp';
import {spriteComponents} from './act-two-components.mjs';
const dir='context/arcade/nightmare-corners-v5',out='public/arcade/act-two/nightmare-corners-v5';await fs.mkdir(out,{recursive:true});
async function cleanAlpha(name){
 const original=await sharp(dir+'/sources/'+name+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true}),{data,info}=original,mask=await sharp(dir+'/sources/'+name+'-alpha.png').resize(info.width,info.height).ensureAlpha().raw().toBuffer();
 const gold=rgba=>{let x=0,y=0,n=0;for(let yy=0;yy<info.height*.65;yy++)for(let xx=Math.floor(info.width*.82);xx<info.width;xx++){const p=(yy*info.width+xx)*4;if(rgba[p]>185&&rgba[p+1]>140&&rgba[p+2]<130&&rgba[p+3]>150){x+=xx;y+=yy;n++;}}return{x:x/n,y:y/n};},a=gold(data),b=gold(mask),dx=Math.round(a.x-b.x),dy=Math.round(a.y-b.y);
 // Register ImageGen's extraction matte to the held weapon, then retain the
 // approved RGB. Opaque physical paint is 249-255; lower-alpha edge paint
 // follows the matte, while the residual 239-244 backdrop is discarded.
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const p=(y*info.width+x)*4,alpha=data[p+3],mx=x-dx,my=y-dy,ma=mx>=0&&my>=0&&mx<info.width&&my<info.height?mask[(my*info.width+mx)*4+3]:0;data[p+3]=alpha>=249?255:alpha>244&&ma>=249?255:0;}
 return sharp(data,{raw:info}).png().toBuffer();
}
const files=['hexy-parallel','hexy-shock','hexy-support'],inputs=[];
for(const [i,name]of files.entries()){
 const source=await spriteComponents(await cleanAlpha(name)),rgba=source.data;
 const isolated=await sharp(rgba,{raw:source.info}).png().toBuffer(),canvas=await sharp({create:{width:1024,height:1600,channels:4,background:'#0000'}}).composite([{input:isolated,left:0,top:i===2?32:0}]).png().toBuffer(),aligned=await sharp(canvas).extract({left:0,top:330,width:1024,height:1040}).png().toBuffer();inputs.push(aligned);
}
const role=[0,1,2,2,2],crops={},hexy={},portraits=[];
for(let i=0;i<3;i++)portraits.push({input:inputs[i],left:i%2*1024,top:Math.floor(i/2)*1040});
await sharp({create:{width:2048,height:2080,channels:4,background:'#0000'}}).composite(portraits).webp({lossless:true}).toFile(out+'/hexy-portraits.webp');
crops['hexy-portraits']=role.flatMap(i=>Array.from({length:4},()=>[i%2*1024,Math.floor(i/2)*1040,1024,1040]));
for(const air of [false,true]){
 const scale=274/1040,w=Math.round(1024*scale),h=274,left=Math.round(160-445*scale),top=300-h,parts=[],tips=[];
 for(let row=0;row<5;row++){
  const image=await sharp(inputs[role[row]]).resize(w,h).png().toBuffer(),{data,info}=await sharp(inputs[role[row]]).ensureAlpha().raw().toBuffer({resolveWithObject:true});let sx=0,sy=0,n=0;
  for(let y=0;y<400;y++)for(let x=850;x<1024;x++){const p=(y*info.width+x)*4;if(data[p]>175&&data[p+1]>130&&data[p+2]<125&&data[p+3]>150){sx+=x;sy+=y;n++;}}
  if(!n)throw Error('Missing star: '+files[role[row]]);
  for(let cel=0;cel<4;cel++){parts.push({input:image,left:cel*320+left,top:row*320+top});tips.push({tip:[left+sx/n*scale,top+sy/n*scale]});}
 }
 const name=air?'air':'ground';await sharp({create:{width:1280,height:1600,channels:4,background:'#0000'}}).composite(parts).webp({lossless:true}).toFile(out+'/hexy-'+name+'.webp');hexy['nightmare-pressure-'+name]=tips;
}
const boss=await spriteComponents(await cleanAlpha('boss-held')),b={...boss.components.sort((a,b)=>b.area-a.area)[0],left:0,top:0,width:768,height:512},rgba=Buffer.alloc(b.width*b.height*4);
for(let y=0;y<b.height;y++)for(let x=0;x<b.width;x++){const i=(b.top+y)*boss.info.width+b.left+x;boss.data.copy(rgba,(y*b.width+x)*4,i*4,i*4+4);}
await sharp(rgba,{raw:{width:b.width,height:b.height,channels:4}}).webp({lossless:true}).toFile(out+'/boss-portraits.webp');crops['boss-portraits']=Array.from({length:16},()=>[0,0,b.width,b.height]);
const reaction=sharp(dir+'/sources/boss-reaction.png'),rm=await reaction.metadata(),rx=rm.width/768,ry=rm.height/512,eyes={x:250-b.left,y:105-b.top,w:150,h:80};
await reaction.extract({left:Math.round(500/2*rx),top:Math.round(210/2*ry),width:Math.round(150*rx),height:Math.round(80*ry)}).resize(150,80).webp({lossless:true}).toFile(out+'/boss-eyes.webp');
const old=JSON.parse(await fs.readFile('context/arcade/nightmare-pressure-v4/registration.json','utf8')),palm=old['boss-air'][0].tip,body=await sharp('public/arcade/act-two/nightmare-pressure-v4/boss-air.webp').extract({left:0,top:0,width:512,height:512}).png().toBuffer();
await sharp({create:{width:2048,height:2048,channels:4,background:'#0000'}}).composite(Array.from({length:16},(_,i)=>({input:body,left:i%4*512,top:Math.floor(i/4)*512}))).webp({lossless:true}).toFile(out+'/boss-air.webp');
await sharp(dir+'/sources/corner-magic.png').webp({quality:94}).toFile(out+'/corner-magic.webp');
const registration=await fs.readFile('src/components/arcade/adventure/actors/bosses/nightmarePressureRegistration.js','utf8'),aperture=JSON.parse(registration.match(/NIGHTMARE_METER_WINDOW=(.*);/)[1]);
await fs.writeFile('src/components/arcade/adventure/actors/bosses/nightmarePressureRegistration.js','// Generated by pack-nightmare-corners.mjs. Held keys use continuous living-ink motion.\nexport const NIGHTMARE_PRESSURE_HEXY='+JSON.stringify(hexy)+';\nexport const NIGHTMARE_PRESSURE_PALMS='+JSON.stringify(Array.from({length:16},()=>palm))+';\nexport const NIGHTMARE_PRESSURE_PORTRAITS='+JSON.stringify(crops)+';\nexport const NIGHTMARE_BOSS_EYES='+JSON.stringify(eyes)+';\nexport const NIGHTMARE_METER_WINDOW='+JSON.stringify(aperture)+';\n');
await fs.writeFile(dir+'/registration.json',JSON.stringify({files,roles:role,alignment:{'hexy-support':[0,32]},portraitCrops:crops,animation:'Continuous deformation of held artwork, no pose ping-pong; repeated atlas cells preserve actor interfaces.'},null,2)+'\n');console.log('Packed held cast, shock and support poses with native portrait detail.');
