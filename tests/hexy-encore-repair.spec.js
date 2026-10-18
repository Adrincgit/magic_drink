import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {hexyPose,HEXY_SHEETS} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {beginSuper} from '../src/components/arcade/adventure/engine/adventureSuper';
import {beginCandyCapture} from '../src/components/arcade/adventure/engine/villageRescue';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {superCutinPortrait,superCutinPortraitRect} from '../src/components/arcade/adventure/render/adventureSuperCutin';
import {hexyChargeParticle,hexyChargeTrail} from '../src/components/arcade/adventure/render/adventureSuperCanvas';
import {groundAt,groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {SUPER_WINDUP,SUPER_DURATION,SUPER_MANGA_DURATION,MANGA_IMPACT_DURATION} from '../src/components/arcade/adventure/engine/adventureSuperTiming';
import {superMangaTiming,clashImpactTiming} from '../src/components/arcade/adventure/render/clashImpactCanvas';

const tick=(s,input,n)=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
test('the classic grounded ultimate keeps its original four drawings and overhead heroic anticipation',()=>{
 const s=createAdventure();s.enemies=[];s.player.ground=0;beginSuper(s,{super:true});
 const frames=new Set();for(let i=0;i<Math.floor((SUPER_WINDUP-.05)*120);i++){const pose=hexyPose(s);expect(pose.sheet).toBe('super-charge');frames.add(pose.frame);tick(s,{},1);}
 expect([...frames]).toEqual([0,1,2,3]);expect(hexyPose(s)).toEqual({sheet:'super-charge',frame:3});expect(superCutinPortrait(s)).toEqual({classic:true});
 expect(HEXY_SHEETS.some(k=>k.startsWith('tired-'))).toBe(false);
});

test('the illustrated cut-in follows ground/air, aim and facing, preserving the classic illustration',()=>{
 const frames=new Set();
 for(const airborne of [false,true])for(const [x,y]of [[1,0],[1,-1],[0,-1],[1,1],[0,1]]){
  const s=createAdventure();s.superCinematic={age:.4,airborne,aim:{x,y},dir:1};const p=superCutinPortrait(s);
  if(!airborne&&!y){expect(p.classic).toBe(true);continue;}
  expect(p.width).toBeGreaterThanOrEqual(1024);expect(p.height).toBeGreaterThanOrEqual(1536);frames.add(p.key);
  const rect=superCutinPortraitRect(p);expect(rect.x+rect.w/2).toBeCloseTo(195);expect(rect.y+rect.h/2).toBeCloseTo(289);
  expect(rect.x).toBeGreaterThanOrEqual(24);expect(rect.y).toBeGreaterThanOrEqual(76);expect(rect.x+rect.w).toBeLessThanOrEqual(366.001);expect(rect.y+rect.h).toBeLessThanOrEqual(502.001);
  s.superCinematic.aim.x=-1;expect(superCutinPortrait(s).flip).toBe(true);
 }
 expect(frames.size).toBe(9);
 const vertical=createAdventure();vertical.superCinematic={age:.4,airborne:true,aim:{x:0,y:-1},dir:-1};expect(superCutinPortrait(vertical).flip).toBe(true);
});

test('a pumpkin clown keeps patrolling while Hexy is candy, then resumes targeting after release',()=>{
 const s=createAdventure(7);for(const k of ['villagers','supplies','outposts','hazards','villageObstacles','villageRubble','hostile'])s[k]=[];
 const p=s.player,x=3500,y=groundY(s.level.route,x);Object.assign(p,{x,y,ground:s.platforms.indexOf(groundAt(s.platforms,x))});
 const e=makeEnemy(x+200,y,25);Object.assign(e,{active:true,phase:'patrol',phaseAge:0,timer:0});s.enemies=[e];
 beginCandyCapture(s,{kind:'lantern-soul',owner:'lantern:'+e.spawnSeed+':'+e.home});const positions=new Set(),frames=new Set();
 for(let i=0;i<600;i++){tick(s,{},1);positions.add(Math.round(e.x));frames.add(Math.floor(e.gait*12)%12);}
 expect(p.candy).toBeTruthy();expect(positions.size).toBeGreaterThan(50);expect(frames.size).toBe(12);
 // Fresh presses free Hexy; a held button still cannot count as repeated presses.
 for(let i=0;i<23;i++){tick(s,{attack:true},1);tick(s,{},1);}expect(p.candy).toBeUndefined();
 const phases=new Set();for(let i=0;i<300;i++){tick(s,{},1);phases.add(e.phase);}expect(phases.has('windup')).toBe(true);
});

test('every charge star makes one continuous journey and arrives before the beam',()=>{
 const s=createAdventure();s.superCinematic={age:.5,aim:{x:1,y:0},airborne:false};s.player.charge=.5;
 for(let i=0;i<48;i++)for(const fraction of [.01,.1,.22,.35,.46,.63,.79,.89,.99]){
  const age=fraction*SUPER_WINDUP;
  const head=hexyChargeParticle(s,i,age),trail=hexyChargeTrail(s,i,age);
  expect(trail.length).toBeGreaterThan(0);expect(trail.length).toBeLessThanOrEqual(9);expect(trail.at(-1)).toEqual(head);
  for(let j=1;j<trail.length;j++){expect(trail[j].phase).toBeGreaterThanOrEqual(trail[j-1].phase);expect(Math.hypot(trail[j].x-trail[j-1].x,trail[j].y-trail[j-1].y)).toBeLessThan(80);}
 }
 for(let i=0;i<48;i++)for(const age of [SUPER_WINDUP-.18,SUPER_WINDUP-.01]){
  const p=hexyChargeParticle(s,i,age);expect(p.phase).toBe(1);expect(Math.hypot(p.x-p.tip.x,p.y-p.tip.y)).toBeLessThan(.001);
 }
 expect(SUPER_WINDUP).toBe(1.7);expect(SUPER_DURATION-SUPER_WINDUP).toBeCloseTo(2.25);
 // The real simulation releases at the shortened time, after every arrival.
 expect(beginSuper(s,{super:true})).toBe(true);tick(s,{},181);
 expect(s.superCinematic.released).toBeFalsy();
 expect(Array.from({length:48},(_,i)=>hexyChargeParticle(s,i,s.superCinematic.age)).every(p=>p.phase===1)).toBe(true);
 tick(s,{},22);expect(s.superCinematic.released).toBeFalsy();
 tick(s,{},2);expect(s.superCinematic.released).toBe(true);
 expect(s.superCinematic.age).toBeLessThan(1.72);
});

test('ultimate pressure lifts the actual surface material, ages while the world is frozen and stays absent in air',()=>{
 for(const material of ['soil','sand','wood','stone'])for(const air of [false,true]){
  const s=createAdventure();s.enemies=[];const p=s.player,floor=s.platforms[0];Object.assign(floor,{material,x:0,w:2000,y:480});Object.assign(p,{x:500,y:air?300:480,ground:air?null:0});
  beginSuper(s,{super:true});const worldTime=s.time;tick(s,{},Math.ceil((SUPER_WINDUP-.1)*120));
  const q=s.superCinematic,dust=q.surfaceDust;expect(s.time).toBe(worldTime);
  if(air){expect(dust).toEqual([]);continue;}
  expect(dust.length).toBeGreaterThan(0);expect(dust.every(d=>d.material===material)).toBe(true);expect(dust.some(d=>d.age>0)).toBe(true);
  expect(dust.some(d=>d.kind===(material==='soil'?'grass':material))).toBe(true);
  tick(s,{},18);expect(q.surfaceDust.some(d=>d.size>=57&&d.age<.2)).toBe(true);
 }
});

test('normal manga lasts exactly as long as the Arlequin contact while the duel waits until impact',()=>{
 const s=createAdventure();s.enemies=[];beginSuper(s,{super:true});
 tick(s,{},Math.floor((SUPER_WINDUP-.01)*120));expect(superMangaTiming(s)).toBe(0);
 tick(s,{},3);expect(s.superCinematic.released).toBe(true);expect(superMangaTiming(s)).toBe(1);expect(superMangaTiming(s,true)).toBe(0);
 expect(SUPER_MANGA_DURATION).toBe(MANGA_IMPACT_DURATION);
 for(const age of [.001,.04,.08,MANGA_IMPACT_DURATION-.001]){s.superCinematic.age=SUPER_WINDUP+age;expect(superMangaTiming(s)).toBe(1);expect(clashImpactTiming({state:'contest',age,pressure:.5}).manga).toBeGreaterThan(0);}
 for(const age of [MANGA_IMPACT_DURATION+.001,.4,.7]){s.superCinematic.age=SUPER_WINDUP+age;expect(superMangaTiming(s)).toBe(0);expect(clashImpactTiming({state:'contest',age,pressure:.5}).manga).toBe(0);}
 for(const state of ['windup','travel','contest']){s.superCinematic.age=SUPER_WINDUP+.02;s.powerClash={state,age:.01};expect(superMangaTiming(s)).toBe(0);expect(clashImpactTiming(s.powerClash).manga>0).toBe(state==='contest');}
});

test('manga covers every completed texture for the full impact and restores colour afterwards',async({page})=>{
 await page.route('**/__manga_check',r=>r.fulfill({contentType:'text/html',body:'<div data-game-screen><canvas style="width:960px;height:540px"></canvas></div>'}));await page.goto('/__manga_check');
 const result=await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{SUPER_WINDUP,SUPER_MANGA_DURATION},css]=await Promise.all([import(root+'engine/adventureModel.js'),import(root+'render/adventureCanvas.js'),import(root+'engine/adventureSuperTiming.js'),import(root+'hexyAdventure.module.css')]);
  const art=await loadAdventureArt(),canvas=document.querySelector('canvas'),screen=canvas.parentElement,reports=[];screen.className=css.default.screen;
  for(const index of [0,2,7]){
   const s=createAdventure(index);for(const k of ['enemies','outposts','supplies','hazards','stars','cages'])s[k]=[];Object.assign(s.player,{x:1100,y:480,ground:0});s.camera={x:860,y:170,zoom:1.5,backdropY:40};stepAdventure(s,{super:true},1/120);
   while(s.superCinematic.age<SUPER_WINDUP+.02)stepAdventure(s,{},1/120);
   for(const age of [.01,.04,.075,SUPER_MANGA_DURATION-.001,SUPER_MANGA_DURATION+.001]){
    s.superCinematic.age=SUPER_WINDUP+age;renderAdventure(canvas,s,art);const pixels=canvas.getContext('2d').getImageData(0,0,960,540).data;
    let chroma=0;const tiles=Array.from({length:9},()=>({black:0,white:0}));
    for(let y=0;y<540;y++)for(let x=0;x<960;x++){
     const k=(y*960+x)*4,r=pixels[k],g=pixels[k+1],b=pixels[k+2];if(r!==g||r!==b)chroma++;
     const tile=tiles[Math.floor(y/180)*3+Math.floor(x/320)];if(r===0&&g===0&&b===0)tile.black++;if(r===255&&g===255&&b===255)tile.white++;
    }
    reports.push({index,age,duration:SUPER_MANGA_DURATION,chroma,tiles,screen:screen.dataset.mangaImpact,filter:getComputedStyle(screen).filter});
   }
  }return reports;
 });
 for(const q of result){
  if(q.age<q.duration){expect(q.chroma).toBe(0);expect(q.screen).toBe('true');expect(q.filter).toBe('grayscale(1)');for(const tile of q.tiles){expect(tile.black).toBeGreaterThan(50);expect(tile.white).toBeGreaterThan(50);}}
  else{expect(q.chroma).toBeGreaterThan(100000);expect(q.screen).toBe('false');expect(q.filter).toBe('none');}
 }
});

test('the real fire renderer excludes the detached strip above all four clown reaction cels',async({page})=>{
 await page.route('**/__fire_cel_review',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"></body>'}));await page.goto('/__fire_cel_review');const result=await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const w=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','actors/enemies/adventureEnemyGeometry.js','actors/enemies/adventureElementHits.js','render/adventureCanvas.js'].map(p=>import(root+p))));
  const art=await w.loadAdventureArt(),s=w.createAdventure();for(const k of ['enemies','outposts','supplies','hazards','stars','cages'])s[k]=[];
  const x=1100,y=480,e=w.makeEnemy(x,y,0),size=w.enemyGeometry(e).size;s.camera={x:x-150,y:y-210,zoom:2,backdropY:40};s.player.x=100;s.noticeTime=0;
  const c=document.createElement('canvas');w.renderAdventure(c,s,art);const ctx=c.getContext('2d');
  const box=[Math.floor(300-size),Math.floor(420-size*2*232/256),Math.ceil(size*2),Math.ceil(size*2*9/256)];
  const baseline=ctx.getImageData(...box).data,counts=[];s.enemies=[e];w.reactToElement(e,{kind:0});
  for(let f=0;f<4;f++){e.elementHit.age=f*.13+.01;w.renderAdventure(c,s,art);const a=ctx.getImageData(...box).data;let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-baseline[i])+Math.abs(a[i+1]-baseline[i+1])+Math.abs(a[i+2]-baseline[i+2])>5)n++;counts.push(n);}
  return counts;
 });expect(result).toEqual([0,0,0,0]);
});
