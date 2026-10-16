import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646/';
const files={whip:'exec-45fb0da7-295a-4080-ac84-51a2d24c4124.png',mobility:'exec-e9fb5198-3c37-41f1-9711-2cc0c935face.png',clown:'exec-ea211ea8-3942-4147-88c1-5be5e602b31c.png',ribbon:'exec-597be8f7-479b-4d0f-ab19-0dc74335c988.png'};
const outputs=[];
for(const [i,id]of ['quick-cast','encore-pocket','bright-spark','grand-flourish'].entries()){
 const file='public/arcade/sprites/ui/'+id+'.webp';outputs.push(file);
 await sharp('public/arcade/sprites/ui/mod-charms.webp').extract({left:i*256,top:0,width:256,height:256}).webp({quality:95}).toFile(file);
}
async function sheet(file,layers,cols,rows,cell=320){outputs.push(file);await sharp({create:{width:cols*cell,height:rows*cell,channels:4,background:'#00000000'}}).composite(layers).webp({quality:95}).toFile(file);}
async function poses(key,indices,hips,feet,tips,scale,output){
 const m=await sharp(source+files[key]).metadata(),layers=[],atlas=[];
 for(const [out,i]of indices.entries()){
  let left=Math.round(i%4*m.width/4),top=Math.round(Math.floor(i/4)*m.height/2),width=Math.round((i%4+1)*m.width/4)-left,height=Math.round((Math.floor(i/4)+1)*m.height/2)-top;
  // The extended fifth wand slightly crosses its nominal source cell.
  if(key==='whip'&&i===4)width=400;
  if(key==='whip'&&i===5){left=412;width=356;}
  const w=Math.round(width*scale),h=Math.round(height*scale),dx=Math.round(160-(hips[out]-left)*scale),dy=Math.round(300-(feet[out]-top)*scale),cx=Math.max(0,-dx),cy=Math.max(0,-dy);
  const input=await sharp(source+files[key]).extract({left,top,width,height}).resize(w,h).extract({left:cx,top:cy,width:Math.min(w-cx,320-Math.max(0,dx)),height:Math.min(h-cy,320-Math.max(0,dy))}).png().toBuffer();
  layers.push({input,left:out%4*320+Math.max(0,dx),top:Math.floor(out/4)*320+Math.max(0,dy)});
  atlas.push({tip:[Math.round(160+(tips[out][0]-hips[out])*scale),Math.round(300+(tips[out][1]-feet[out])*scale)]});
 }
 await sheet(output,layers,4,Math.ceil(indices.length/4));return atlas;
}
const whip=await poses('whip',[0,1,2,3,4,5,6,7],[218,588,965,1346,210,590,971,1350],[492,492,491,491,943,943,943,943],[[309,236],[671,151],[1029,90],[1453,167],[365,725],[737,761],[1094,842],[1476,841]],.69,'public/arcade/sprites/hexy/ribbon-swing.webp');
const guard=await poses('mobility',[0,1,2,3],[220,679,1125,1570],[435,435,435,435],[[236,40],[787,112],[1234,112],[1680,163]],.70,'public/arcade/sprites/hexy/guard-up.webp');
const dive=await poses('mobility',[4,5,6,7],[265,701,1163,1583],[790,860,860,870],[[355,503],[652,535],[1092,548],[1568,583]],.70,'public/arcade/sprites/hexy/comet-kick.webp');
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyRibbonAtlas.js','// Registered far-hand wand tips; boots anchored at y=300.\nexport default '+JSON.stringify(whip)+';\n');
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyMobilityAtlas.js','// Registered overhead guard and downward air-kick tips.\nexport const guardAtlas='+JSON.stringify(guard)+';\nexport const diveAtlas='+JSON.stringify(dive)+';\n');
for(const [key,rows,cell,output]of [['clown',4,256,'public/arcade/sprites/enemies/clown-element-hits.webp'],['ribbon',2,320,'public/arcade/sprites/effects/ribbon-whip.webp']]){
 const m=await sharp(source+files[key]).metadata(),layers=[];
 for(let i=0;i<4*rows;i++){
  const left=Math.round(i%4*m.width/4),top=Math.round(Math.floor(i/4)*m.height/rows),width=Math.round((i%4+1)*m.width/4)-left,height=Math.round((Math.floor(i/4)+1)*m.height/rows)-top;
  if(key==='ribbon'){
   // Technical gutter crop: omit guide-border pixels outside the painted cels.
   const x=24,y=20,w=width-30,h=327,k=320/(m.width/4);
   const input=await sharp(source+files[key]).extract({left:left+x,top:top+y,width:w,height:h}).resize(Math.round(w*k),Math.round(h*k)).png().toBuffer();
   layers.push({input,left:i%4*cell+Math.round(x*k),top:Math.floor(i/4)*cell+Math.round(y*k)});
  }else{
   const input=await sharp(source+files[key]).extract({left,top,width,height}).resize(Math.round(width*.76),Math.round(height*.76)).png().toBuffer();
   layers.push({input,left:i%4*cell+7,top:Math.floor(i/4)*cell+20});
  }
 }
 await sheet(output,layers,4,rows,cell);
}
await fs.mkdir('context/arcade/combat-polish',{recursive:true});
await fs.writeFile('context/arcade/combat-polish/assets.json',JSON.stringify({mode:'built-in imagegen',sources:Object.fromEntries(Object.entries(files).map(([k,v])=>[k,source+v])),outputs},null,2));
console.log('Packed registered combat poses, elemental reactions and ribbon sweep.');
