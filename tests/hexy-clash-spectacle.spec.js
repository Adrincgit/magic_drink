import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {beginHarlequinUltimate} from '../src/components/arcade/adventure/actors/bosses/harlequinUltimate';
import {harlequinDrawing,harlequinBody,harlequinHand,updateHarlequin,stepHarlequinProjectile} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
import {clashContact,clashPortraitFrames,CLASH_DURATION} from '../src/components/arcade/adventure/engine/adventurePowerClash';
import {superCameraOffset} from '../src/components/arcade/adventure/render/adventureSuperCanvas';
import {followAdventureCamera,adventureBounds} from '../src/components/arcade/adventure/render/adventureCamera';
import {damageSupply,dropHarlequinSupply,updateSupplies} from '../src/components/arcade/adventure/world/adventureSupplies';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
const folder='tests/artifacts/arcade/clash-spectacle/';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function battle(){const s=createAdventure(3);s.supplies=[];s.stars=[];s.arenaLocked=true;Object.assign(s.player,{x:1500,y:480,ground:2});Object.assign(s.boss,{phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:240,turn:3,ultimateCooldown:0});return s;}
function charge(s){const ok=beginHarlequinUltimate(s);if(!ok)return false;for(let n=0;n<150&&s.boss.ultimate?.state==='leap';n++)tick(s,1);expect(s.boss.ultimate?.state).toBe('charge');return true;}
function collide(reverse=false){const s=battle();if(reverse){s.player.x=2500;s.boss.x=1450;s.boss.dir=1;}
 charge(s);tick(s,40);tick(s,1,{super:true});while(['windup','travel'].includes(s.powerClash.state))tick(s,1);return s;}
function contest(s,rate=8,fps=120){let frame=0;while(s.powerClash.state==='contest'&&frame<fps*(CLASH_DURATION+1)){const t=frame/fps,previous=(frame-1)/fps;stepAdventure(s,{attack:rate>0&&Math.floor(t*rate)!==Math.floor(previous*rate)},1/fps);frame++;}return s;}
function finish(s){let n=0;while(s.powerClash&&n++<850)tick(s,1);expect(s.powerClash).toBeUndefined();}

test('twenty seconds resolves by beam distance, on either side, at 30, 60 and 120 Hz',()=>{
 for(const reverse of [false,true])for(const fps of [30,60,120])for(const rate of [6,7]){
  const s=contest(collide(reverse),rate,fps),q=s.powerClash,h=clashContact(s);
  expect(CLASH_DURATION).toBe(20);expect(q.state).toBe('resolve');expect(q.contestAge).toBeGreaterThanOrEqual(CLASH_DURATION);expect(q.contestAge).toBeLessThan(CLASH_DURATION+1/fps+.001);
  expect(q.won).toBe(rate===7);expect(Math.hypot(h.x-h.a.x,h.y-h.a.y)>Math.hypot(h.x-h.b.x,h.y-h.b.y)).toBe(q.won);
  expect(q.taps).toBeGreaterThanOrEqual(rate*CLASH_DURATION-1);expect(q.taps).toBeLessThanOrEqual(rate*CLASH_DURATION+1);
 }
});

test('even maximal pressing cannot skip the six second struggle; sustained FX stay bounded',()=>{
 const s=contest(collide(),12),q=s.powerClash;expect(q.contestAge).toBeGreaterThanOrEqual(6);expect(q.won).toBe(true);expect(q.taps).toBeGreaterThan(60);
 expect(q.sparks.length).toBeGreaterThan(15);expect(q.sparks.length).toBeLessThanOrEqual(140);
 expect(Math.hypot(...Object.values(superCameraOffset(s)))).toBeGreaterThan(0);expect(superCameraOffset(s,true)).toEqual({x:0,y:0});
});

test('losing costs four hearts after the fall, bypasses shields, and lands inside the wider fire walls',()=>{
 const s=contest(collide(),0);s.overdrive=8;s.shield=3;s.player.hurt=5;
 while(s.powerClash.state!=='land')tick(s,1);expect(s.hearts).toBe(5);expect(s.done).toBe(false);expect(s.player.x).toBeGreaterThan(s.level.arena.left+24);expect(s.effects.some(q=>q.cinematicSmoke)).toBe(true);
 finish(s);expect(s.hearts).toBe(1);expect(s.shield).toBe(3);expect(s.clashRetreatBounds).toBeUndefined();const x=s.player.x;
 tick(s,1);expect(Math.abs(s.player.x-x)).toBeLessThan(1);expect(s.player.ground).not.toBeNull();expect(adventureBounds(s).left).toBeLessThan(x);
 for(let i=0;i<200&&!s.done&&s.clashRetreatBounds;i++)tick(s,1,{right:true});expect(s.clashRetreatBounds).toBeUndefined();expect(s.player.x).toBeGreaterThanOrEqual(s.level.arena.left+24);expect(s.hearts).toBe(1);
});

test('one to four hearts means a prone defeat; only a surviving Hexy can sit up and recover',()=>{
 for(const hearts of [1,2,3,4,5]){
  const s=collide();s.hearts=hearts;contest(s,0);const landingFrames=new Set();let deaths=0,n=0;
  while(s.powerClash&&n++<850){tick(s,1,{jump:true,right:true});if(s.powerClash?.state==='land')landingFrames.add(hexyPose(s).frame);deaths+=s.events.filter(e=>e==='death').length;}
  expect(s.powerClash).toBeUndefined();expect(s.hearts).toBe(Math.max(0,hearts-4));
  if(hearts<=4){
   expect([...landingFrames]).toEqual([4]);expect(s.done).toBe(true);expect(s.won).toBe(false);expect(deaths).toBe(1);expect(hexyPose(s)).toEqual({sheet:'clash-fall',frame:4});
   const position={x:s.player.x,y:s.player.y,ticks:s.ticks};tick(s,240,{jump:true,attack:true,right:true});expect({x:s.player.x,y:s.player.y,ticks:s.ticks}).toEqual(position);expect(hexyPose(s).frame).toBe(4);
   expect(s.clashRetreatBounds).toBeUndefined();retryAdventure(s);expect(s.player.clashFlight).toBeUndefined();expect(s.done).toBe(false);
  }else{expect([...landingFrames]).toEqual([4,5,6,7]);expect(s.done).toBe(false);expect(deaths).toBe(0);expect(s.player.clashFlight).toBeUndefined();}
 }
});

test('winning throws the boss, applies 192 once and keeps a lethally hit boss prone',()=>{
 for(const hp of [240,160]){const s=contest(collide(),8);s.boss.hp=hp;const start=s.boss.x;
  while(s.powerClash.state!=='flight')tick(s,1);expect(s.boss.hp).toBe(Math.max(0,hp-192));expect(s.clear).toBeFalsy();
  tick(s,60);expect(s.boss.x).toBeGreaterThan(start+100);expect(s.boss.y).toBeLessThan(480);expect(harlequinDrawing(s).key).toBe('harlequin-fire-actions');
  finish(s);expect(s.boss.hp).toBe(Math.max(0,hp-192));expect(s.score).toBe(0);
  if(hp<192){expect(harlequinDrawing(s).frame).toBe(16);tick(s,20);expect(harlequinDrawing(s).key).toBe('harlequin-fire-actions');expect(harlequinDrawing(s).frame).toBe(16);tick(s,410);expect(s.score).toBe(60);}
 }
});

test('flight and recovery keep the floor and both fighters in bounds, also from the right',()=>{
 for(const reverse of [false,true]){const s=collide(reverse);for(let n=0;n<600;n++)followAdventureCamera(s,1/120);contest(s,0);
  while(s.powerClash.state!=='flight')tick(s,1);
  while(s.powerClash){tick(s,1);const c=s.camera;expect(c.x).toBeGreaterThanOrEqual(0);expect(c.x+960/c.zoom).toBeLessThanOrEqual(s.level.width+.01);expect((480-c.y)*c.zoom).toBeCloseTo(454,1);
   for(const [actor,margin]of [[s.player,65],[s.boss,110]]){expect((actor.x-margin-c.x)*c.zoom).toBeGreaterThanOrEqual(0);expect((actor.x+margin-c.x)*c.zoom).toBeLessThanOrEqual(960);}
  }
  for(const actor of [s.player,s.boss]){const x=(actor.x-s.camera.x)*s.camera.zoom;expect(x).toBeGreaterThan(10);expect(x).toBeLessThan(950);}
  const x=s.player.x;tick(s,1);expect(Math.abs(s.player.x-x)).toBeLessThan(1);
  retryAdventure(s);expect(s.clashRetreatBounds).toBeUndefined();expect(s.player.clashFlight).toBeUndefined();
 }
});

test('portraits clench through equilibrium and losing; only winning makes Hexy shout',()=>{
 const q={pressure:.2,contestAge:2,rally:0};expect(clashPortraitFrames(q)).toEqual({hexy:1,boss:3});
 q.rally=.4;expect(clashPortraitFrames(q).hexy).toBe(1);q.pressure=.12;expect(clashPortraitFrames(q).hexy).toBe(2);q.rally=0;q.pressure=.85;expect(clashPortraitFrames(q)).toEqual({hexy:3,boss:1});
 q.pressure=.5;expect(clashPortraitFrames(q)).toEqual({hexy:0,boss:0});
 q.won=true;q.rally=.6;expect(clashPortraitFrames(q).hexy).toBe(3);
});

test('each new phase drops one real chest, with guaranteed usable drink loot and fresh retry aid',()=>{
 const s=battle();s.boss.stage=1;s.boss.hp=480;s.checkpointAt=[1150,480];tick(s,112);
 expect(s.supplies).toHaveLength(1);const first=s.supplies[0];expect(first.falling).toBe(true);expect(first.y).toBeLessThan(480);expect(first.phaseAid).toBe(2);
 for(let n=0;n<200;n++)updateSupplies(s,1/120);expect(first.y).toBe(480);expect(first.falling).toBe(false);damageSupply(s,first,1);
 expect(s.pickups[0]).toMatchObject({type:'drink',kind:2,phaseAid:2});tick(s,100);s.player.x=first.x;tick(s,1);expect(s.weapon).toBe(2);expect(s.ammo).toBeGreaterThan(0);
  s.boss.hp=240;for(let n=0;n<400&&s.supplies.length<2;n++)tick(s,1);expect(s.supplies).toHaveLength(2);const second=s.supplies[1];expect(second.phaseAid).toBe(3);damageSupply(s,second,1);expect(s.pickups.at(-1)).toMatchObject({type:'drink',kind:2,phaseAid:3});expect(s.pickups.at(-1).y).toBeLessThan(100);
 dropHarlequinSupply(s,2);dropHarlequinSupply(s,3);expect(s.supplies).toHaveLength(2);retryAdventure(s);expect(s.supplies.filter(q=>q.phaseAid)).toHaveLength(0);expect(s.pickups.filter(q=>q.phaseAid)).toHaveLength(0);
 dropHarlequinSupply(s,2);expect(s.supplies.filter(q=>q.phaseAid)).toHaveLength(1);expect(s.starMoney).toBe(0);
});

test('ribbon has a windup, an actual release from the hand and a visible descent to the floor',()=>{
 const s=battle(),b=s.boss;b.phase='warn';b.timer=.01;b.move='ribbon';const shots=[],helpers={body:playerBody};s.damage=()=>{};
 const shoot=(s,x,y,angle,speed,kind,extra)=>shots.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,kind,age:0,...extra});
 updateHarlequin(s,.02,helpers,shoot);expect(harlequinDrawing(s).frame).toBe(27);updateHarlequin(s,.12,helpers,shoot);expect(harlequinDrawing(s).frame).toBe(27);expect(shots).toHaveLength(0);
 updateHarlequin(s,.13,helpers,shoot);expect(harlequinDrawing(s).frame).toBe(28);expect(shots).toHaveLength(1);const shot=shots[0],h=harlequinHand(b,true);expect([shot.x,shot.y]).toEqual([h.x,h.y]);
 updateHarlequin(s,.13,helpers,shoot);expect(harlequinDrawing(s).frame).toBe(30);shot.age=.12;stepHarlequinProjectile(s,shot,.12);expect(shot.y).toBeGreaterThan(h.y);expect(shot.y).toBeLessThan(shot.floor-shot.r);
 shot.age=.3;stepHarlequinProjectile(s,shot,.18);expect(shot.y).toBe(shot.floor-shot.r-1);
 expect(harlequinBody(s).w).toBeCloseTo(84*.72);expect(harlequinBody(s).h).toBeCloseTo(200*.72);
});

test('all 72 normal motion cells and both falls retain visible native transparency',async()=>{
 for(const [path,cols,rows,size]of [['bosses/harlequin/motion',4,6,512],['bosses/harlequin/motion-mid',4,6,512],['bosses/harlequin/motion-final',4,6,512],['bosses/harlequin/clash-fall',4,2,512],['hexy/clash-fall',4,2,320]]){
  const img=sharp('public/arcade/sprites/'+path+'.webp'),m=await img.metadata();expect([m.width,m.height,m.hasAlpha]).toEqual([cols*size,rows*size,true]);
  for(let frame=0;frame<cols*rows;frame++){const {data}=await img.clone().extract({left:frame%cols*size,top:Math.floor(frame/cols)*size,width:size,height:size}).raw().toBuffer({resolveWithObject:true});let count=0;for(let i=3;i<data.length;i+=4)if(data[i]>80)count++;expect(count).toBeGreaterThan(size*size*.04);expect(count).toBeLessThan(size*size*.8);}
 }
});

test('real renderer shows release gestures, sustained portraits, both flights and landing dust',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});await page.setViewportSize({width:1440,height:810});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{followAdventureCamera},{beginHarlequinUltimate}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureCamera.js'),import('/src/components/arcade/adventure/actors/bosses/harlequinUltimate.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='spectacle-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const fresh=()=>{const s=createAdventure(3);s.supplies=[];s.stars=[];s.noticeTime=0;s.arenaLocked=true;Object.assign(s.player,{x:1500,y:480,ground:2});Object.assign(s.boss,{phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:240,turn:3});for(let n=0;n<600;n++)followAdventureCamera(s,1/120);window.spectacle.s=s;return s;};
  window.spectacle={c,art,fresh,stepAdventure,beginHarlequinUltimate:(s)=>{beginHarlequinUltimate(s);for(let n=0;n<150&&s.boss.ultimate?.state==='leap';n++)stepAdventure(s,{},1/120);},paint:(reduced=false)=>renderAdventure(c,window.spectacle.s,art,{reduced})};fresh();
 });
 const canvas=page.locator('#spectacle-review');
 for(const frame of [1,16,32,48]){await page.evaluate(n=>{const w=window.spectacle,s=w.fresh();Object.assign(s.boss,{phase:'warn',timer:.01,move:'ribbon'});for(let i=0;i<n;i++)w.stepAdventure(s,{},1/120);w.paint();},frame);await canvas.screenshot({path:folder+'ribbon-'+frame+'.jpg'});}
 for(const win of [true,false]){
  await page.evaluate(()=>{const w=window.spectacle,s=w.fresh();w.beginHarlequinUltimate(s);w.stepAdventure(s,{super:true},1/120);while(['windup','travel'].includes(s.powerClash.state))w.stepAdventure(s,{},1/120);});
  for(const [name,pressure,rally]of [['effort',.5,0],['worried',.22,0],['rally',.4,.8],['advantage',.79,0]]){await page.evaluate(([pressure,rally])=>{const w=window.spectacle;Object.assign(w.s.powerClash,{pressure,rally,age:1});w.paint();},[pressure,rally]);if(win)await canvas.screenshot({path:folder+'portraits-'+name+'.jpg'});}
  await page.evaluate(win=>{const w=window.spectacle,q=w.s.powerClash;Object.assign(q,{age:14.999,pressure:win?.8:.2});w.stepAdventure(w.s,{},1/120);w.paint();},win);
  const prefix=win?'win':'lose';await canvas.screenshot({path:folder+prefix+'-breakthrough.jpg'});
  for(const [name,frames]of [['explosion',45],['flight',58],['landing',80]]){await page.evaluate(frames=>{const w=window.spectacle;for(let i=0;i<frames;i++)w.stepAdventure(w.s,{},1/120);w.paint();},frames);await canvas.screenshot({path:folder+prefix+'-'+name+'.jpg'});}
  await page.evaluate(()=>{const w=window.spectacle;while(w.s.powerClash)w.stepAdventure(w.s,{},1/120);w.paint();});await canvas.screenshot({path:folder+prefix+'-recovered.jpg'});
 }
 expect(errors).toEqual([]);
});
