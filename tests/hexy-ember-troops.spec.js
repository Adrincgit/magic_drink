import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {updateOutposts} from '../src/components/arcade/adventure/actors/enemies/adventureOutposts';
import {enemyMuzzle} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {groundAt,groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {guardBlocks} from '../src/components/arcade/adventure/engine/adventureDefense';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function encounter(type,dir=-1){
 const s=createAdventure(5),x=10900+dir*300;for(const k of ['enemies','stars','supplies','cages','outposts'])s[k]=[];
 Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),hurt:999});
 const e=makeEnemy(10900,groundY(s.level.route,10900),type);e.dir=dir;e.timer=0;s.enemies=[e];return{s,e};
}
test('the entire forest and its reinforcement posts use red or fire troops',()=>{
 const s=createAdventure(5);expect(new Set(s.enemies.map(e=>e.type))).toEqual(new Set([0,10,11,12,13]));
 const q=s.outposts[0];s.player.x=q.x-180;q.spawned=2;q.spawnIn=0;updateOutposts(s,1/120);
 expect(s.enemies.find(e=>e.outpost===q.id).type).toBe(11);
});
for(const type of [11,12])for(const dir of [-1,1])test(`fire troop ${type}, facing ${dir}: announces attack, launches from hand/barrel, ignites its landing`,()=>{
 const {s,e}=encounter(type,dir);s.damage=()=>{};const body=()=>({x:-999,y:-999,w:1,h:1});let elapsed=0;
 while(!s.hostile.length&&elapsed<3){updateEnemies(s,1/120,body,()=>{});elapsed+=1/120;}
 expect(elapsed).toBeGreaterThan(type===12?1.3:.95);expect(e.phase).toBe('attack');
 const q=s.hostile[0],m=enemyMuzzle(e);expect(q.x).toBeCloseTo(m.x);expect(q.y).toBeCloseTo(m.y);expect(q.vy).toBeLessThan(-100);expect(Math.sign(q.vx)).toBe(dir);
 const hp=e.hp;expect(hp).toBe(type===12?20.7:5.06);e.trap=20;
 const target=s.player.x;tick(s,260,{right:dir>0,left:dir<0});const fire=s.hostile.find(q=>q.source==='forest');expect(fire).toBeTruthy();expect(fire.y).toBe(groundY(s.level.route,fire.x));
 expect(Math.abs(fire.x-target)).toBeLessThan(100);
});
test('torches and mortar shots burst when guarded and machines take several ordinary hits',()=>{
 const {s,e}=encounter(12);const p=s.player;p.dir=1;p.guarding=true;s.magic=100;
 for(const kind of ['ember-torch','ember-mortar']){
  const q={x:p.x+30,y:p.y-40,r:18,life:3,ember:true,element:'fire',kind};expect(guardBlocks(s,q)).toBe(true);expect(q.life).toBe(0);
 }
 expect(s.effects.length).toBeGreaterThan(1);
 s.player.hurt=999;s.player.guarding=false;s.player.dir=1;e.timer=99;
 tick(s,1,{attack:true});tick(s,70);expect(e.hp).toBeLessThan(e.maxHp);expect(e.hp).toBeGreaterThan(0);
 tick(s,1000,{attack:true});expect(e.hp).toBeLessThanOrEqual(0);
});
test('fire troop art and combat animate in the browser with visible landings and brush ignition',async({page})=>{
 test.setTimeout(90000);const folder='tests/artifacts/arcade/ember-troops/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const [model,canvas,terrain,camera,enemies]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/render/adventureCamera.js'),import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js')]);
  const art=await canvas.loadAdventureArt(),c=document.createElement('canvas');c.id='troop-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const w=window.troops={...model,...canvas,art,c};w.fresh=(type,dir)=>{
   const s=model.createAdventure(5),x=10900+dir*300;for(const k of ['enemies','stars','supplies','outposts','cages'])s[k]=[];
   Object.assign(s.player,{x,y:terrain.groundY(s.level.route,x),ground:s.platforms.indexOf(terrain.groundAt(s.platforms,x)),hurt:999});
   const e=enemies.makeEnemy(10900,terrain.groundY(s.level.route,10900),type);e.dir=dir;e.timer=0;s.enemies=[e];s.noticeTime=0;
   s.emberEnvironment.bushes=[{x:x-dir*50,y:e.y,state:'green',age:0}];for(let i=0;i<800;i++)camera.followAdventureCamera(s,1/120);w.s=s;return s;
  };
 });
 for(const type of [10,11,12])for(const dir of [-1,1]){
  const frames=await page.evaluate(async({type,dir})=>{const w=window.troops;w.fresh(type,dir);let n=0;const frames=[];
   await new Promise(resolve=>{const f=()=>{for(let j=0;j<4;j++)w.stepAdventure(w.s,{},1/120);w.renderAdventure(w.c,w.s,w.art);if([20,38,47,61,78,95,115].includes(n))frames.push({n,png:w.c.toDataURL('image/png').split(',')[1]});if(++n<125)requestAnimationFrame(f);else resolve();};requestAnimationFrame(f);});return frames;},{type,dir});
  for(const q of frames)fs.writeFileSync(folder+type+'-'+dir+'-'+q.n+'.png',Buffer.from(q.png,'base64'));
 }
 expect(errors).toEqual([]);
});
