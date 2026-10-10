import fs from 'node:fs';
import sharp from 'sharp';
const root='C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646/';
const shrubs=root+'exec-24cb5239-89b4-4cb3-b72e-915accf5ebd4.png',animals=root+'exec-ad7f323b-b96b-4a15-bbe9-73a3da2fa610.png';
async function bounds(input){
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});let left=info.width,top=info.height,right=0,bottom=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>24){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 return{left,top,width:right-left+1,height:bottom-top+1};
}
const parts=[];
for(let i=0;i<6;i++){
 const row=Math.floor(i/3),col=i%3,edges=[0,535,992,1536];
 const cell=await sharp(shrubs).extract({left:edges[col],top:row*512,width:edges[col+1]-edges[col],height:512}).png().toBuffer();
 const b=await bounds(cell),scale=Math.min(468/b.width,436/b.height),w=Math.round(b.width*scale),h=Math.round(b.height*scale);
 const input=await sharp(cell).extract(b).resize(w,h).png().toBuffer();parts.push({input,left:col*512+Math.round((512-w)/2),top:row*512+460-h});
}
const bushOutput='public/arcade/maps/ember-trail/shrub-clusters.webp';
await sharp({create:{width:1536,height:1024,channels:4,background:'#00000000'}}).composite(parts).webp({quality:94,alphaQuality:100}).toFile(bushOutput);
const frames=[],registrations=[];
for(let i=0;i<16;i++){
 const cell=await sharp(animals).extract({left:i%4*384,top:Math.floor(i/4)*256,width:384,height:256}).png().toBuffer(),b=await bounds(cell);
 const lift=i<8?[0,0,14,22,14,0,0,0][i]:[0,0,10,14,0,0,0,0][i-8];
 const input=await sharp(cell).extract(b).png().toBuffer(),top=225-lift-b.height;
 frames.push({input,left:i%4*384+b.left,top:Math.floor(i/4)*256+top});registrations.push({frame:i,bounds:b,lift,baseline:225});
}
const animalOutput='public/arcade/maps/ember-trail/wildlife-run.webp';
await sharp({create:{width:1536,height:1024,channels:4,background:'#00000000'}}).composite(frames).webp({quality:95,alphaQuality:100}).toFile(animalOutput);
fs.writeFileSync('context/arcade/ember-fort/depth-art.json',JSON.stringify({shrubs,animals,outputs:[bushOutput,animalOutput],registrations,operations:'Crop and register transparent paintings; preserve alpha; uniform shrub scaling. Animal poses retain a fixed scale and shared ground baseline.'},null,2)+'\n');
console.log([bushOutput,animalOutput]);
