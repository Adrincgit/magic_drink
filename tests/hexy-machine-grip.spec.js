import {test,expect} from '@playwright/test';
import sharp from 'sharp';
import fs from 'node:fs';
import {createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {organMechanism} from '../src/components/arcade/adventure/actors/bosses/organMechanism';

test('organ unfolds continuously without resizing the body or moving its wheel anchors',()=>{
 const s=createAdventure(1),b=s.boss;
 Object.assign(b,{phase:'transform',transformed:true,release:0});
 const stages=[];
 for(let i=0;i<=26;i++){b.timer=2.6-i/10;stages.push(organMechanism(s));}
 expect(stages[0].cover.alpha).toBe(1);expect(stages.at(-1).cover.alpha).toBe(0);
 expect(stages[0].pipes.y-stages.at(-1).pipes.y).toBe(50);
 for(let i=1;i<stages.length;i++){
  expect(stages[i].body).toEqual(stages[0].body);
  expect(stages[i].wheels).toEqual(stages[0].wheels);
  expect(stages[i].pipes.y).toBeLessThanOrEqual(stages[i-1].pipes.y);
  expect(Math.abs(stages[i].pipes.y-stages[i-1].pipes.y)).toBeLessThan(5);
 }
 Object.assign(b,{phase:'attack',move:'organ-fanfare',activeMouth:1,release:.13});
 const recoil=organMechanism(s);b.release=0;const rest=organMechanism(s);
 expect(recoil.horns[1].mouth.x-rest.horns[1].mouth.x).toBeCloseTo(9);
 expect(recoil.horns[0].mouth).toEqual(rest.horns[0].mouth);
 expect(recoil.body).toEqual(rest.body);
});

test('boss parts retain native detail and the riverbank has a transparent leafy top edge',async()=>{
 for(const [name,width] of [['body',340],['pipes',184],['horn',102],['wheel',108],['cover',178]]){
  const meta=await sharp('public/arcade/sprites/bosses/organ/'+name+'.webp').metadata();
  expect(meta.hasAlpha).toBe(true);expect(meta.width).toBeGreaterThan(width*2.5);
 }
 const {data,info}=await sharp('public/arcade/maps/riverwoods/ground.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const edge=[];
 for(let x=0;x<info.width;x++){
  let y=0;while(y<100&&data[(y*info.width+x)*4+3]<128)y++;edge.push(y);
 }
 expect(Math.max(...edge)-Math.min(...edge)).toBeGreaterThan(10);
 expect(edge.filter(y=>y>0).length).toBeGreaterThan(info.width*.5);
 expect(data[((info.height-40)*info.width+100)*4+3]).toBe(255);
});

test('wand flash only adds warm light, fades outward and restores canvas state',async({page})=>{
 await page.goto('/arcade');
 const result=await page.evaluate(async()=>{
  const {drawWandGlow}=await import('/src/components/arcade/adventure/render/wandGlow.js');
  const c=document.createElement('canvas').getContext('2d');c.canvas.width=64;c.canvas.height=64;
  c.fillStyle='#304050';c.fillRect(0,0,64,64);drawWandGlow(c,32,32,1,16);
  const data=c.getImageData(0,0,64,64).data;let dark=0;
  for(let i=0;i<data.length;i+=4)if(data[i]<48||data[i+1]<64||data[i+2]<80)dark++;
  return{dark,center:[...c.getImageData(32,32,1,1).data],edge:[...c.getImageData(49,32,1,1).data],mode:c.globalCompositeOperation,alpha:c.globalAlpha};
 });
 expect(result.dark).toBe(0);expect(result.center[0]).toBeGreaterThan(220);expect(result.edge).toEqual([48,64,80,255]);expect(result.mode).toBe('source-over');expect(result.alpha).toBe(1);
});

test('production machine shows transformation stages and launches notes from the exposed pipes',async({page})=>{
 fs.mkdirSync('tests/artifacts/arcade/machine-and-grip',{recursive:true});
 await page.setViewportSize({width:1800,height:1320});await page.goto('/arcade');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(async()=>{
  const [{createAdventure},{loadAdventureArt,renderAdventure},{drawOrgan},{updateBoss},{playerBody}]=await Promise.all([
   import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),
   import('/src/components/arcade/adventure/render/organCanvas.js'),import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js'),import('/src/components/arcade/adventure/engine/adventureModel.js')]);
  const art=await loadAdventureArt(),s=createAdventure(1);window.machineReview={art,renderAdventure,createAdventure,updateBoss,playerBody};
  const c=document.createElement('canvas');c.width=1800;c.height=1320;c.id='machine-stages';c.style='position:fixed;inset:0;z-index:99999;width:1800px;height:1320px';document.body.append(c);
  const ctx=c.getContext('2d');ctx.fillStyle='#253e40';ctx.fillRect(0,0,c.width,c.height);ctx.font='24px sans-serif';
  s.level={...s.level,arena:{...s.level.arena,y:-5}};s.boss.x=0;
  [0,.3,.5,.75,1,1].forEach((progress,i)=>{
   const x=i%3*600,y=Math.floor(i/3)*660;
   ctx.fillStyle='#fff1bd';ctx.fillText(['Blindaje','Apertura','Desprendimiento','Tubos extendidos','Fuelle expuesto','Disparo'][i],x+25,y+36);
   Object.assign(s.boss,{phase:i===5?'attack':'transform',timer:2.6*(1-progress),transformed:progress>0,move:'organ-chords',release:i===5?.13:0});
   ctx.save();ctx.translate(x+320,y+610);ctx.scale(1.25,1.25);drawOrgan(ctx,s,art);ctx.restore();
  });
 });
 await page.locator('#machine-stages').screenshot({path:'tests/artifacts/arcade/machine-and-grip/transformation.jpg'});
 await page.evaluate(()=>{
  document.querySelector('#machine-stages').remove();
  const {art,renderAdventure,createAdventure,updateBoss,playerBody}=window.machineReview,s=createAdventure(1),a=s.level.arena;
  Object.assign(s.player,{x:a.right-900,y:a.y,cast:.24,firing:true});
  Object.assign(s.boss,{x:a.right-345,phase:'attack',move:'organ-chords',transformed:true,timer:4,shotClock:0,attackClock:0,volley:0});
  s.camera={x:a.right-1060,y:a.y-495,zoom:1};s.damage=()=>{};
  updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:playerBody});
  const c=document.createElement('canvas');c.id='machine-game';c.style='position:fixed;inset:0;z-index:99999;width:1800px;height:1012.5px';document.body.append(c);
  renderAdventure(c,s,art);window.machineReview.state=s;
 });
 await page.locator('#machine-game').screenshot({path:'tests/artifacts/arcade/machine-and-grip/gameplay.jpg'});
 expect(await page.evaluate(()=>window.machineReview.state.hostile.filter(q=>q.kind==='note').length)).toBeGreaterThan(1);
 expect(errors).toEqual([]);
});
