import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='context/arcade/ribbon-dance/source/mastery-spaced.png';
const boxes=[[35,20,235,266],[358,18,210,268],[624,20,310,266],[960,75,260,211],[38,319,235,289],[357,318,225,290],[598,350,320,258],[937,374,301,230],[58,630,228,290],[345,630,247,290],[638,633,239,291],[930,630,274,297],[37,970,253,240],[350,924,240,292],[615,945,313,267],[949,969,289,245]];
const hips=[166,466,745,1096,167,461,792,1064,173,467,765,1070,175,460,777,1099];
const feet=[270,270,270,270,596,596,596,596,917,917,917,923,1198,1198,1198,1198];
const tips=[[112,82],[429,73],[902,64],[1185,175],[114,353],[415,350],[875,473],[1204,498],[240,659],[533,660],[831,675],[1140,660],[105,1050],[455,950],[872,1073],[1184,1090]];
const layers=[],atlas=[],scale=.78;
for(let i=0;i<16;i++){
 const col=i%4,row=Math.floor(i/4),[left,top,width,height]=boxes[i];
 const dx=Math.round(160+(left-hips[i])*scale),dy=Math.round(300+(top-feet[i])*scale);
 layers.push({input:await sharp(source).extract({left,top,width,height}).resize(Math.round(width*scale),Math.round(height*scale)).png().toBuffer(),left:col*320+dx,top:row*320+dy});
 atlas.push({tip:[Math.round(160+(tips[i][0]-hips[i])*scale),Math.round(300+(tips[i][1]-feet[i])*scale)]});
}
await sharp({create:{width:1280,height:1280,channels:4,background:'#00000000'}}).composite(layers).webp({quality:96}).toFile('public/arcade/sprites/hexy/ribbon-mastery.webp');
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyRibbonMasteryAtlas.js','// Wand toss, leg reel, aerial pirouette and charged flourish.\nexport default '+JSON.stringify(atlas)+';\n');
console.log('Packed 16 registered Ribbon poses.');
