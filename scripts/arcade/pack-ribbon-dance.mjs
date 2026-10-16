import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='context/arcade/ribbon-dance/source/';
const actor=root+'hexy.png';
const xs=[0,283,565,844,1122],ys=[0,300,558,833,1120,1402],hips=[152,430,712,1007,160,440,697,981,146,438,707,994,160,436,719,1008,140,430,710,1003];
const feet=[292,292,292,292,550,550,550,555,827,827,827,827,1115,1115,1115,1115,1387,1387,1387,1387];
const tips=[[65,207],[516,34],[793,23],[1090,63],[232,432],[455,450],[799,471],[1098,443],[260,575],[531,685],[799,793],[1093,806],[202,859],[415,858],[680,856],[1035,856],[205,1220],[475,1196],[760,1183],[1050,1225]];
const layers=[],atlas=[],scale=.87;
for(let i=0;i<20;i++){
 const col=i%4,row=Math.floor(i/4),left=xs[col],top=ys[row],width=xs[col+1]-left,height=ys[row+1]-top,w=Math.round(width*scale),h=Math.round(height*scale),dx=Math.round(160-(hips[i]-left)*scale),dy=Math.round(300-(feet[i]-top)*scale);
 layers.push({input:await sharp(actor).extract({left,top,width,height}).resize(w,h).png().toBuffer(),left:col*320+dx,top:row*320+dy});atlas.push({tip:[Math.round(160+(tips[i][0]-hips[i])*scale),Math.round(300+(tips[i][1]-feet[i])*scale)]});
}
await sharp({create:{width:1280,height:1600,channels:4,background:'#00000000'}}).composite(layers).webp({quality:96}).toFile('public/arcade/sprites/hexy/ribbon-dance.webp');
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyRibbonDanceAtlas.js','// Rhythmic dance, tumble, aerial bind, guard and sip; registered foot planes and wand tips.\nexport default '+JSON.stringify(atlas)+';\n');
const clown=root+'clown.png',cl=[],start=[0,418,778],end=[397,769,1086];
for(let i=0;i<12;i++){
 const col=i%4,row=Math.floor(i/4),cut=sharp(clown).extract({left:col*362,top:start[row],width:362,height:end[row]-start[row]});
 const crop=await cut.png().toBuffer(),trimmed=await sharp(crop).trim({threshold:10}).png().toBuffer();
 const img=await sharp(trimmed).resize(290,250,{fit:'inside',withoutEnlargement:true}).png().toBuffer(),m=await sharp(img).metadata();
 cl.push({input:img,left:col*320+Math.round((320-m.width)/2),top:row*320+300-m.height});
}
await sharp({create:{width:1280,height:960,channels:4,background:'#00000000'}}).composite(cl).webp({quality:96}).toFile('public/arcade/sprites/enemies/clown-ribbon.webp');
const fx=root+'effects.png';
await sharp(fx).resize(1280,640).webp({quality:96}).toFile('public/arcade/sprites/effects/ribbon-dance.webp');
console.log('Packed 20 Hexy poses, 12 clown reactions, 8 ribbon/petal effects.');
