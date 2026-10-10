import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,buddyHasTarget} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {collectAdventureStar} from '../src/components/arcade/adventure/engine/adventureRewards';
import {stepBargeProjectile} from '../src/components/arcade/adventure/actors/bosses/adventureBarge';
const folder='tests/artifacts/arcade/harbor-detail/';
const tick=(s,n)=>{for(let i=0;i<n;i++)stepAdventure(s,{},1/120);};
function quiet(){const s=createAdventure(2);for(const key of ['enemies','outposts','supplies','hazards','stars','cages'])s[key]=[];s.player.hurt=100;return s;}

test('swimming divers face their actual travel even when Hexy stays on the opposite side',()=>{
 const s=quiet(),e=makeEnemy(3200,465,8,0);s.enemies=[e];s.player.x=1000;let left=0,right=0,turns=0;
 for(let i=0;i<1500;i++){const oldX=e.x,oldDir=e.dir;tick(s,1);expect(e.phase).toBe('swim');const dx=e.x-oldX;if(Math.abs(dx)>.001){expect(e.dir).toBe(Math.sign(dx));if(dx<0)left++;else right++;}if(e.dir!==oldDir)turns++;}
 expect(left).toBeGreaterThan(200);expect(right).toBeGreaterThan(200);expect(turns).toBeGreaterThan(3);
});

test('bunnies rest without targets, shoot a nearby threat and cancel if it disappears during windup',()=>{
 const s=quiet();s.rescued=3;s.buddyWait=0;tick(s,400);expect(s.shots).toHaveLength(0);expect(s.buddyCast).toEqual([0,0,0]);
 const e=makeEnemy(s.player.x+260,s.player.y,0,0);e.timer=100;e.hp=1000;s.enemies=[e];
 expect(buddyHasTarget(s)).toBe(true);tick(s,1);expect(s.buddyCast.some(n=>n>0)).toBe(true);e.hp=0;tick(s,30);expect(s.shots).toHaveLength(0);
 e.hp=1000;e.defeated=false;s.enemies=[e];s.buddyWait=0;tick(s,32);expect(s.shots.length).toBeGreaterThan(0);
 s.enemies=[];s.shots=[];tick(s,400);expect(s.shots).toHaveLength(0);expect(s.buddyCast).toEqual([0,0,0]);
 const far=makeEnemy(s.player.x+850,s.player.y,0,0);s.enemies=[far];expect(buddyHasTarget(s)).toBe(false);
 far.x=s.player.x+250;far.y=s.player.y-300;expect(buddyHasTarget(s)).toBe(false);
 far.y=s.player.y;far.x=s.player.x-350;expect(buddyHasTarget(s)).toBe(false);
});

test('special coins keep their reward and emit a different pickup sound only once',()=>{
 const s=quiet(),ordinary={value:1},treasure={value:10};
 collectAdventureStar(s,ordinary);expect(s.events).toEqual(['coin']);s.events=[];const money=s.starMoney;
 expect(collectAdventureStar(s,treasure)).toBe(true);expect(s.events).toEqual(['treasureCoin']);expect(s.starMoney-money).toBe(10);
 expect(collectAdventureStar(s,treasure)).toBe(false);expect(s.events).toHaveLength(1);
});

test('balloon impact registers foam and the wet patch on top of the deck',()=>{
 const s=quiet(),floor=s.level.arena.y,q={kind:'barge-balloon',barge:true,x:s.level.arena.left+400,y:floor-23,vx:0,vy:180,r:24,floor,life:2};
 const waves=[];stepBargeProjectile(s,q,1/120,waves);expect(q.life).toBe(0);
 const splash=s.effects.find(q=>q.bargeSplash),wet=s.effects.find(q=>q.waterDetail===2);
 expect(splash.surfaceY).toBe(floor);expect(wet.y).toBe(floor);expect(waves).toHaveLength(2);
});

test('painted clouds, unified reflections, buried dock feet and grounded splashes render correctly',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 const report=await page.evaluate(async()=>{
  const [{createAdventure},{loadAdventureArt,renderAdventure},{drawHarborBackdrop},{drawBargeSplash},{groundY}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureHarborCanvas.js'),import('/src/components/arcade/adventure/render/bargeCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js')]);
  const s=createAdventure(2),art=await loadAdventureArt();for(const key of ['enemies','outposts','supplies','hazards','stars','cages'])s[key]=[];s.noticeTime=0;
  const probe=document.createElement('canvas');probe.width=960;probe.height=540;const c=probe.getContext('2d',{willReadFrequently:true});
  const draw=(x,time)=>{s.camera={x,y:80,backdropY:80,zoom:1};s.time=time;c.clearRect(0,0,960,540);drawHarborBackdrop(c,s,art);return c.getImageData(0,0,960,540).data;};
  const before=draw(3000,0),after=draw(3200,0);let reflectionError=0,samples=0;
  for(let y=410;y<520;y++)for(let x=100;x<880;x++){const i=(y*960+x)*4,j=i-36*4;for(let ch=0;ch<3;ch++)reflectionError+=Math.abs(before[i+ch]-after[j+ch]);samples+=3;}
  const sky0=draw(0,0),skyLater=draw(0,12);
  let skyMotion=0;for(let y=5;y<160;y++)for(let x=20;x<940;x++){const i=(y*960+x)*4;if(Math.abs(sky0[i]-skyLater[i])+Math.abs(sky0[i+1]-skyLater[i+1])+Math.abs(sky0[i+2]-skyLater[i+2])>12)skyMotion++;}
  const splashFloors=[];for(let frame=0;frame<4;frame++){c.clearRect(0,0,960,540);drawBargeSplash(c,art,{x:400,y:300,surfaceY:300,size:180,age:frame*.12});const data=c.getImageData(0,0,960,540).data;let bottom=0;for(let y=0;y<540;y++)for(let x=280;x<520;x++)if(data[(y*960+x)*4+3]>100)bottom=Math.max(bottom,y);splashFloors.push(bottom);}
  const canvas=document.createElement('canvas');canvas.id='detail-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(canvas);
  const paint=(x,time=0)=>{const y=groundY(s.platforms,x);Object.assign(s.player,{x,y,ground:s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w)});s.camera={x:x-300,y:y-385,backdropY:y-385,zoom:1};s.time=time;renderAdventure(canvas,s,art);};
  window.harborDetails={s,art,canvas,paint,renderAdventure};paint(5680);
  // At the same camera, remove only the docks: buried timber must not alter
  // the opaque earth beneath its real floor height.
  const live=canvas.getContext('2d').getImageData(0,0,1440,810).data,docks=s.platforms.filter(q=>q.kind==='dock'),platforms=s.platforms;
  s.platforms=s.platforms.filter(q=>q.kind!=='dock');renderAdventure(canvas,s,art);const bare=canvas.getContext('2d').getImageData(0,0,1440,810).data;s.platforms=platforms;let buriedError=0;
  for(const dock of docks)for(const cx of [.284,.713]){const x=Math.round((dock.x+cx*dock.w-s.camera.x)*1.5),y=Math.round((dock.footY+25-s.camera.y)*1.5);if(x<5||x>1435||y>800)continue;for(let yy=y;yy<y+8;yy++)for(let xx=x-4;xx<x+4;xx++){const k=(yy*1440+xx)*4;for(let ch=0;ch<3;ch++)buriedError+=Math.abs(live[k+ch]-bare[k+ch]);}}
  paint(5680);return{reflectionError:reflectionError/samples,skyMotion,splashFloors,buriedError};
 });
 fs.writeFileSync(folder+'render-check.json',JSON.stringify(report,null,2));expect(report.reflectionError).toBeLessThan(1);expect(report.skyMotion).toBe(0);expect(report.buriedError).toBe(0);
 for(const bottom of report.splashFloors){expect(bottom).toBeGreaterThanOrEqual(298);expect(bottom).toBeLessThanOrEqual(301);}
 await page.locator('#detail-review').screenshot({path:folder+'planted-docks.jpg'});
 for(const [label,x,time]of [['sky-reflections-a',1200,0],['sky-reflections-b',1450,3],['original-sky-restored',1200,12],['bridge-no-moored-boat',3350,2]]){await page.evaluate(({x,time})=>window.harborDetails.paint(x,time),{x,time});await page.locator('#detail-review').screenshot({path:folder+label+'.jpg'});}
 await page.evaluate(()=>{const w=window.harborDetails;w.s.rescued=3;w.s.stars=[{x:5780,y:325,value:10}];w.paint(5680);});await page.locator('#detail-review').screenshot({path:folder+'quiet-bunnies-and-treasure.jpg'});
 for(const frame of [0,1,2,3]){await page.evaluate(frame=>{const w=window.harborDetails,a=w.s.level.arena;w.s.rescued=0;w.s.stars=[];w.s.effects=[{x:a.left+480,y:a.y,surfaceY:a.y,bargeSplash:true,size:180,age:frame*.12,life:.5}];w.paint(a.left+500);},frame);await page.locator('#detail-review').screenshot({path:folder+`deck-splash-${frame}.jpg`});}
 expect(errors).toEqual([]);
});
