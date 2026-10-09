import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {harlequinDrawing,updateHarlequin} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
import {beginHarlequinUltimate} from '../src/components/arcade/adventure/actors/bosses/harlequinUltimate';
import {clashPortraitFrames,clashPressureWave,clashResistance,opponentLight} from '../src/components/arcade/adventure/engine/clashActing';
import {clashPortraitLayout} from '../src/components/arcade/adventure/render/clashPortraitLayout';
import {followAdventureCamera} from '../src/components/arcade/adventure/render/adventureCamera';
import {castHarlequinFire} from '../src/components/arcade/adventure/actors/bosses/harlequinFire';
import {enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import tips from '../src/components/arcade/adventure/actors/hexy/hexySuperCastAtlas';
const tick=(s,input={})=>stepAdventure(s,input,1/120);
function scene(reverse=false,y=480){const s=createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:reverse?2460:1460,y,ground:y===480?2:null});Object.assign(s.boss,{x:reverse?1460:2460,y:480,phase:'recover',timer:100,engaged:true,stage:3,hp:240,turn:3});for(let i=0;i<600;i++)followAdventureCamera(s,1/120);return s;}
function clash(reverse=false,y=480){const s=scene(reverse);beginHarlequinUltimate(s);while(s.boss.ultimate.state==='leap')tick(s);s.player.y=y;s.player.ground=y===480?2:null;tick(s,{super:true});while(['windup','travel'].includes(s.powerClash.state))tick(s);return s;}

test('default ultimate uses the shared one-handed drawings in the air and on every level',()=>{
 for(let level=0;level<4;level++)for(const airborne of [false,true]){const s=createAdventure(level);s.superCinematic={age:1.3,airborne};s.player.superCast=.32;s.player.ground=airborne?null:0;
  const poses=new Set();for(let i=0;i<3;i++){s.fxTime=i/18;const pose=hexyPose(s);expect(pose.sheet).toBe('super-cast');expect(pose.frame).toBeGreaterThanOrEqual(9);poses.add(pose.frame);}expect(poses.size).toBe(3);
 }
});
test('all twelve measured wand sockets are on the actual golden star, including mirrored casting',async()=>{
 const {data,info}=await sharp('public/arcade/sprites/hexy/super-cast.webp').raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<12;i++){const [x,y]=tips[i].tip,k=((Math.round(y)+Math.floor(i/4)*320)*info.width+Math.round(x)+i%4*320)*4;expect(data[k+3]).toBeGreaterThan(180);expect(data[k]).toBeGreaterThan(180);expect(data[k+1]).toBeGreaterThan(130);
  const s=scene(),pose={sheet:'super-cast',frame:i};const a=hexyMuzzle(s,pose);s.player.dir=-1;const b=hexyMuzzle(s,pose);expect(a.x-s.player.x).toBeCloseTo(s.player.x-b.x,4);expect(a.y).toBe(b.y);
 }
});
test('gameplay and portraits share effort states without a rally smile or early worried face',()=>{
 const s=clash();for(const [pressure,expected]of [[.5,0],[.44,0],[.35,1],[.2,1],[.1,2],[.6,3],[.9,3]]){s.powerClash.pressure=pressure;s.powerClash.rally=1;expect(clashPortraitFrames(s.powerClash).hexy).toBe(expected);expect(Math.floor(hexyPose(s).frame/3)).toBe(expected);expect(Math.floor(harlequinDrawing(s).frame/3)).toBe(clashPortraitFrames(s.powerClash).boss);}
 expect(opponentLight({pressure:.1},false)).toBeGreaterThan(.9);expect(opponentLight({pressure:.9},true)).toBeGreaterThan(.9);expect(opponentLight({pressure:.5},false)).toBe(0);
});
test('normal pressure has four recoverable waves; gentle has three weaker waves',()=>{
 for(const gentle of [false,true]){let rises=0,previous=0,total=0;for(let i=0;i<1800;i++){const t=i/120,w=clashPressureWave(t,gentle);if(previous<.1&&w>=.1)rises++;previous=w;total+=clashResistance(t,gentle)/120;}expect(rises).toBe(gentle?3:4);expect(total).toBeGreaterThan(gentle?1.2:2);expect(total).toBeLessThan(gentle?1.5:2.2);}
 const s=clash();const pressure=[];for(let i=0;i<600;i++){tick(s,{attack:i%15===0});if(i%60===0)pressure.push(s.powerClash.pressure);}expect(pressure[7]).toBeLessThan(pressure[4]);expect(pressure[9]).toBeGreaterThan(pressure[7]);
});
test('adaptive portraits preserve fighters and ray origins on either side at multiple jump heights',()=>{
 for(const reverse of [false,true])for(const y of [480,350,230,120]){const s=clash(reverse,y);for(const boss of [false,true]){const r=clashPortraitLayout(s,boss),a=boss?s.boss:s.player,z=s.camera.zoom,feet=(a.y-s.camera.y)*z,head=feet-(boss?185:106)*z;
  expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.w).toBeLessThanOrEqual(960);expect(r.y).toBeGreaterThan(55);expect(r.y+r.h).toBeLessThanOrEqual(502);expect(r.w*r.h).toBeLessThan(60000);
  expect(r.y+r.h<=head-17||r.y>=feet+19).toBe(true);
 }}
});
test('fire volleys become denser in phase three and pyres wait for the casting gesture before causing damage',()=>{
 for(const stage of [2,3])for(const move of ['embers','pyre']){const s=scene(),b=s.boss;b.stage=stage;b.hp=b.maxHp*(stage===2?.5:.3);b.move=move;b.volley=0;b.dir=-1;castHarlequinFire(s,b,enemyShot);expect(s.hostile).toHaveLength(move==='embers'?(stage===3?4:3):(stage===3?5:3));
  if(move==='embers'){for(const q of s.hostile){expect(q.x).toBe(b.x-67);expect(q.y).toBe(b.y-145);expect(q.vy).toBeLessThan(0);expect(q.gravity).toBe(520);}}
  else{const center=s.hostile[Math.floor(s.hostile.length/2)];s.player.x=center.x;for(let i=0;i<80;i++)tick(s);expect(s.hearts).toBe(5);expect(center.damaging).toBe(false);for(let i=0;i<60;i++)tick(s);expect(s.hearts).toBeLessThan(5);}
 }
});
test('new fire moves animate anticipation and release, and the pyre gaps let Hexy escape',()=>{
 for(const stage of [2,3]){const s=scene();s.boss.stage=stage;s.boss.move='embers';s.boss.phase='warn';s.boss.warnDuration=1;expect(harlequinDrawing(s).key).toBe(stage===2?'harlequin-fire-actions-mid':'harlequin-fire-actions');}
 for(const move of ['embers','pyre']){const s=scene(),b=s.boss;b.move=move;b.phase='warn';b.timer=.01;b.warnDuration=1;s.damage=()=>{};const frames=[];for(let i=0;i<100;i++){updateHarlequin(s,1/120,{body:playerBody},enemyShot);frames.push(harlequinDrawing(s).frame);}expect(new Set(frames).size).toBeGreaterThanOrEqual(3);expect(s.hostile.length).toBeGreaterThan(0);expect(harlequinDrawing(s).key).toBe(move==='pyre'?'harlequin-inferno-final':'harlequin-fire-actions');}
 const s=scene();s.boss.move='pyre';s.boss.volley=0;castHarlequinFire(s,s.boss,enemyShot);s.player.x+=80;for(let i=0;i<210;i++)tick(s);expect(s.hearts).toBe(5);
});
test('new action and casting atlases contain complete separated transparent figures',async()=>{
 for(const [path,size,count]of [['bosses/harlequin/fire-actions',512,20],['bosses/harlequin/fire-actions-mid',512,20],['bosses/harlequin/super-cast',512,12],['hexy/super-cast',320,12]]){const image=sharp('public/arcade/sprites/'+path+'.webp');expect((await image.metadata()).hasAlpha).toBe(true);for(let i=0;i<count;i++){const raw=await image.clone().extract({left:i%4*size,top:Math.floor(i/4)*size,width:size,height:size}).raw().toBuffer();let solid=0;for(let k=3;k<raw.length;k+=4)if(raw[k]>180)solid++;expect(solid).toBeGreaterThan(size*size*.035);expect(solid).toBeLessThan(size*size*.7);for(const [x,y]of [[0,0],[size-1,0],[0,size-1],[size-1,size-1]])expect(raw[(y*size+x)*4+3]).toBe(0);}}
});

test('review ground and aerial duels, fast acting, reflected light and all fire gestures in the real renderer',async({page})=>{
 test.setTimeout(120000);const folder='tests/artifacts/arcade/fire-acting/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:810});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [engine,render,camera,boss]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureCamera.js'),import('/src/components/arcade/adventure/actors/bosses/harlequinUltimate.js')]);
  const art=await render.loadAdventureArt(),canvas=document.createElement('canvas');canvas.id='fire-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(canvas);
  window.fireReview={canvas,art,tick:input=>engine.stepAdventure(window.fireReview.s,input||{},1/120),paint:reduced=>render.renderAdventure(canvas,window.fireReview.s,art,{reduced}),charge:()=>boss.beginHarlequinUltimate(window.fireReview.s),fresh:reverse=>{const s=engine.createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:reverse?2460:1460,y:480,ground:2});Object.assign(s.boss,{x:reverse?1460:2460,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:240,turn:3});for(let i=0;i<600;i++)camera.followAdventureCamera(s,1/120);window.fireReview.s=s;return s;}};
 });
 const canvas=page.locator('#fire-review');
 for(const reverse of [false,true])for(const y of [480,230]){
  await page.evaluate(([reverse,y])=>{const w=window.fireReview,s=w.fresh(reverse);w.charge();while(s.boss.ultimate.state==='leap')w.tick();s.player.y=y;s.player.ground=y===480?2:null;w.tick({super:true});while(['windup','travel'].includes(s.powerClash.state))w.tick();for(let i=0;i<100;i++)w.tick({attack:i%15===0});},[reverse,y]);
  for(const [name,pressure]of [['even',.5],['strain',.3],['danger',.1],['winning',.78]]){await page.evaluate(pressure=>{const w=window.fireReview;w.s.powerClash.pressure=pressure;w.paint();},pressure);await canvas.screenshot({path:folder+(reverse?'right':'left')+'-'+y+'-'+name+'.jpg'});}
 }
 for(const move of ['embers','pyre']){await page.evaluate(move=>{const w=window.fireReview,s=w.fresh();Object.assign(s.boss,{phase:'warn',move,timer:.01,warnDuration:1});},move);for(const [name,frames]of [['windup',15],['release',36],['active',95],['eruption',36]]){await page.evaluate(frames=>{const w=window.fireReview;for(let i=0;i<frames;i++)w.tick();w.paint();},frames);await canvas.screenshot({path:folder+move+'-'+name+'.jpg'});}}
 for(const stage of [1,2,3]){await page.evaluate(stage=>{const w=window.fireReview,s=w.fresh();s.boss.stage=stage;s.boss.hp=s.boss.maxHp*(stage===1?1:stage===2?.5:.3);w.paint();},stage);await canvas.screenshot({path:folder+'phase-'+stage+'.jpg'});}
 await page.evaluate(()=>{const w=window.fireReview;w.fresh();w.tick({super:true});for(let i=0;i<190;i++)w.tick();w.paint();});await canvas.screenshot({path:folder+'default-ultimate.jpg'});
 expect(errors).toEqual([]);
});
