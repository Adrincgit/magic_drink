import fs from 'node:fs/promises';
import sharp from 'sharp';
import {chromium} from '@playwright/test';
const out='tests/artifacts/arcade/nightmare-coherence-v7',dir='context/arcade/nightmare-coherence-v7';await fs.mkdir(out,{recursive:true});
const r=JSON.parse(await fs.readFile(dir+'/registration.json','utf8')),parts=[],zoom=1.8,cellW=320,cellH=310;
const frames=[];
for(let phase=1;phase<=3;phase++)for(const kind of ['idle','cast'])for(let f=0;f<4;f++)frames.push([`nightmare-phase-${phase}-${kind}`,f]);
for(const key of ['nightmare-phase-two-walk','nightmare-phase-three-walk'])for(let f=0;f<12;f++)frames.push([key,f]);
for(const key of ['nightmare-phase-two','nightmare-phase-three'])for(const f of [7,11,12,13,14,15])frames.push([key,f]);
for(const key of ['aerial-boss-air-actions','pressure-boss-air'])for(let f=0;f<16;f++)frames.push([key,f]);
for(const [i,[key,f]]of frames.entries()){
 const a=r.assets[key],n=r.registration[key][f],size=Math.round(n.size*zoom),col=i%4,row=Math.floor(i/4),left=col*cellW,top=row*cellH;
 const input=await sharp(a.file).extract({left:f%4*512,top:Math.floor(f/4)*512,width:512,height:512}).resize(size,size).png().toBuffer();
 // Crop only the comparison viewport, never the game sprite or source.
 const layer=await sharp({create:{width:800,height:700,channels:4,background:'#0000'}}).composite([{input,left:Math.round(400-size/2+n.offsetX*zoom),top:Math.round(580-size*.975)}]).png().toBuffer();
 const body=a.frames[f].body,center=400+((body.left+body.width/2)/512-.5)*size+n.offsetX*zoom;
 parts.push({input:await sharp(layer).extract({left:Math.round(center-160),top:300,width:320,height:310}).png().toBuffer(),left,top});
 const text=`${key.replace('nightmare-','')} #${f}`;
 parts.push({input:Buffer.from(`<svg width="320" height="310"><path d="M0 280H320" stroke="#817288"/><text x="5" y="16" fill="white" font-size="12" font-family="Arial">${text}</text><text x="5" y="32" fill="#c5b3df" font-size="11" font-family="Arial">Silhouette ${n.visibleHeight.toFixed(1)} world units</text></svg>`),left,top});
}
await sharp({create:{width:cellW*4,height:Math.ceil(frames.length/4)*cellH,channels:4,background:'#241c38'}}).composite(parts).jpeg({quality:95}).toFile(out+'/all-world-cels.jpg');
const lineup=[];
for(let phase=1;phase<=3;phase++){
 const key=`nightmare-phase-${phase}-idle`,n=r.registration[key][0],size=Math.round(n.size*3),x=(phase-1)*700;
 const hero=await sharp('public/arcade/sprites/hexy/reactions.webp').extract({left:0,top:0,width:320,height:320}).resize(348,348).png().toBuffer();
 const boss=await sharp(r.assets[key].file).extract({left:0,top:0,width:512,height:512}).resize(size,size).png().toBuffer();
 lineup.push({input:hero,left:x-38,top:400-Math.round(116*3*300/320)});
 lineup.push({input:boss,left:Math.round(x+520-size/2+n.offsetX*3),top:400-Math.round(size*.975)});
 lineup.push({input:Buffer.from(`<svg width="700" height="440"><path d="M0 400H700 M340 ${400-r.reference.targetHeight*3}H700" stroke="#a194ba"/><text x="12" y="28" fill="white" font-family="Arial" font-size="19">Fase ${phase}: Hexy / Arlequin +15%</text></svg>`),left:x,top:0});
}
// Use generous outer padding so the reference wand cannot be cut by the canvas.
const padded=lineup.map(p=>({...p,left:p.left+70}));
await sharp({create:{width:2240,height:440,channels:4,background:'#241c38'}}).composite(padded).jpeg({quality:96}).toFile(out+'/standing-lineup.jpg');
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.route('**/__proportion_review',route=>route.fulfill({contentType:'text/html',body:'<body style="margin:0"></body>'}));await page.goto('http://localhost:4321/__proportion_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';window.w=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','actors/bosses/nightmareGames.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='width:1440px;height:810px';document.body.append(w.c);
  w.setup=stage=>{const s=w.s=w.createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.stars=[];s.cages=[];s.arenaLocked=true;s.noticeTime=0;s.episodeTwo.captionAge=0;s.episodeTwo.seen=new Set([0,1,2]);Object.assign(s.player,{x:4600,y:a.y,ground:1,hurt:999});Object.assign(s.boss,{x:4820,y:a.y,stage,hp:stage===3?260:500,phase:'recover',timer:99,engaged:true,vulnerable:true,encoreAid:true,nightmareCooldown:999});for(let i=0;i<600;i++)w.followAdventureCamera(s,1/120);};
  w.paint=()=>{w.s.shake=0;w.renderAdventure(w.c,w.s,w.art);};
 });
 for(let phase=1;phase<=3;phase++){
  await page.evaluate(phase=>{w.setup(phase);w.paint();},phase);await page.locator('canvas').screenshot({path:`${out}/scene-phase-${phase}.jpg`,type:'jpeg',quality:95});
 }
 for(const age of [.7,1.05,1.3,1.8]){
  await page.evaluate(age=>{w.setup(3);w.s.boss.x=5150;w.startNightmareGame(w.s,'wind-blink');for(let i=0;i<age*120;i++)w.stepAdventure(w.s,{},1/120);w.paint();},age);
  await page.locator('canvas').screenshot({path:`${out}/illusion-${age}.jpg`,type:'jpeg',quality:95});
 }
 await fs.writeFile(dir+'/proportion-review.json',JSON.stringify({worldCels:frames.length,reference:r.reference,errors},null,2)+'\n');if(errors.length)throw Error(JSON.stringify(errors));
}finally{await browser.close();}
console.log('Reviewed '+frames.length+' world cels, standing lineup, actual scenes and illusion timings.');
