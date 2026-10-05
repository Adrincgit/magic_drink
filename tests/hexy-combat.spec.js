import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventureModel';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/hexyAnimation';
import {makeEnemy,updateBoss,bossTargets,towerSockets} from '../src/components/arcade/adventureEnemies';
import {bossDrawing} from '../src/components/arcade/adventureSprites';
import {specialShots} from '../src/components/arcade/adventureMagic';
import {clearPowerProjectiles,buddyFrame,buddyPosition} from '../src/components/arcade/adventureDefense';
const tick=(s,keys={},n=1)=>{for(let i=0;i<n;i++)stepAdventure(s,keys,1/120);};
function quiet(index=0){const s=createAdventure(index);s.enemies=[];s.pickups=[];s.supplies=[];s.cages=[];s.stars=[];s.hazards=[];return s;}
const bullet=(x,y)=>({x,y,vx:-160,vy:0,r:8,life:2,age:0,kind:'streamer'});

test('HOLD fixes position while turning and aiming diagonally; releasing restores movement',()=>{
 const s=quiet(),x=s.player.x;tick(s,{hold:true,right:true,up:true,attack:true},80);
 expect(s.player.x).toBe(x);expect(s.player.holding).toBe(true);expect(s.shots.length).toBeGreaterThan(0);expect(s.shots.every(q=>q.vx>0&&q.vy<0)).toBe(true);
 tick(s,{hold:true,left:true,attack:true},35);expect(s.player.x).toBe(x);expect(s.player.dir).toBe(-1);expect(s.shots.some(q=>q.vx<0)).toBe(true);
 tick(s,{right:true},60);expect(s.player.x).toBeGreaterThan(x+90);expect(s.player.holding).toBe(false);
});

test('held shield spends magic, intercepts frontal bullets and leaves Hexy exposed from behind',()=>{
 const front=quiet();tick(front,{guard:true,attack:true},120);expect(front.magic).toBeCloseTo(76,5);expect(front.shots).toHaveLength(0);expect(hexyPose(front).sheet).toBe('guard-pose');
 front.hostile=[bullet(front.player.x+48,front.player.y-43)];tick(front,{guard:true});expect(front.hearts).toBe(5);expect(front.hostile).toHaveLength(0);expect(front.magic).toBeCloseTo(71.8,5);expect(front.events).toContain('guardBlock');
 front.hostile=[bullet(front.player.x-10,front.player.y-43)];tick(front,{guard:true});expect(front.hearts).toBe(4);
 const empty=quiet();empty.magic=1;tick(empty,{guard:true},30);expect(empty.magic).toBe(0);expect(empty.player.guarding).toBe(false);expect(empty.player.guardBreak).toBeGreaterThan(0);
 tick(empty,{guard:true},240);expect(empty.magic).toBeGreaterThan(0);expect(empty.player.guarding).toBe(false);
 tick(empty,{},1);tick(empty,{guard:true},1);expect(empty.player.guarding).toBe(true);
});

test('bunny charm degrades across three hits, breaks visibly and then life takes damage',()=>{
 const s=quiet();s.shield=3;
 for(let n=2;n>=0;n--){s.player.hurt=0;s.hostile=[bullet(s.player.x,s.player.y-35)];tick(s);expect(s.shield).toBe(n);expect(s.hearts).toBe(5);expect(s.shieldHit).toBeGreaterThan(0);}
 expect(s.shieldBreak).toBeGreaterThan(0);s.player.hurt=0;s.hostile=[bullet(s.player.x,s.player.y-35)];tick(s);expect(s.hearts).toBe(4);
});

test('all charged spells cancel hostile bullets and bombs; ordinary shots do not',()=>{
 for(let kind=0;kind<5;kind++){
  const s=quiet();s.shots=specialShots(kind,{x:110,y:444},{x:1,y:0});s.hostile=[{...bullet(115,450),kind:'bomb',floor:480,vy:600}];
  tick(s,{},15);expect(s.hostile).toHaveLength(0);expect(s.hearts).toBe(5);
 }
 const fast=quiet();fast.shots=[{...specialShots(0,{x:300,y:420},{x:1,y:0})[0],previousX:100,previousY:420}];fast.hostile=[bullet(190,420)];clearPowerProjectiles(fast);expect(fast.hostile[0].life).toBe(0);
 const normal=quiet();normal.shots=[{x:130,y:440,r:10,heavy:false,life:1}];normal.hostile=[bullet(130,440)];clearPowerProjectiles(normal);expect(normal.hostile[0].life).toBe(2);
});

test('green harlequins withstand multiple normal hits and show a damage reaction',()=>{
 for(const type of [1,4]){
  const s=quiet(),e=makeEnemy(240,480,type);s.enemies=[e];e.timer=10;
  for(let n=0;n<5;n++){
   s.shots=[{x:e.x,y:e.y-30,vx:0,vy:0,r:10,life:1,age:0,kind:-1,damage:2,hits:[]}];tick(s);
   expect(e.hp).toBeGreaterThan(0);expect(e.flash).toBeGreaterThan(0);
  }
  s.shots=[{x:e.x,y:e.y-30,vx:0,vy:0,r:10,life:1,age:0,kind:-1,damage:2,hits:[]}];tick(s);expect(e.hp).toBe(0);expect(e.deadTime).toBeGreaterThan(0);
 }
});

test('the two Bubble Tape spheres travel apart and float above the floor',()=>{
 const s=quiet();s.shots=specialShots(3,{x:180,y:430},{x:1,y:0});const initial=s.shots.map(q=>q.y);
 expect(initial[0]).not.toBe(initial[1]);tick(s,{},85);expect(s.shots).toHaveLength(2);
 expect(s.shots.every(q=>q.x>300&&q.y+q.r<=480)).toBe(true);expect(Math.abs(s.shots[0].y-s.shots[1].y)).toBeGreaterThan(30);
});

test('running casts have twelve drawings; air dash stays horizontal and ground dash rolls',()=>{
 const s=quiet(),seen=new Set();for(let n=0;n<100;n++){tick(s,{right:true,attack:true});if(n>5){expect(hexyPose(s).sheet).toBe('run-fire');seen.add(hexyPose(s).frame);expect(hexyMuzzle(s).x).toBeGreaterThan(s.player.x);}}
 expect(seen.size).toBe(12);
 const air=quiet();tick(air,{jump:true},20);const y=air.player.y;tick(air,{dash:true},1);const poses=new Set();for(let n=0;n<36;n++){tick(air,{dash:true});expect(hexyPose(air).sheet).toBe('air-dash');poses.add(hexyPose(air).frame);expect(air.player.y).toBeCloseTo(y,5);}
 expect(poses.size).toBeGreaterThanOrEqual(7);expect(playerBody(air.player).h).toBe(58);
 const ground=quiet();tick(ground,{dash:true});expect(hexyPose(ground).sheet).toBe('roll');expect(playerBody(ground.player).h).toBe(38);
});

test('a rescued bunny anticipates the star shot before releasing it from its own position',()=>{
 const s=quiet();s.rescued=1;s.buddyWait=0;tick(s);expect(buddyFrame(s,0)).toBe(0);expect(s.shots).toHaveLength(0);tick(s,{},20);expect(s.shots).toHaveLength(0);
 tick(s,{},4);expect(buddyFrame(s,0)).toBeGreaterThanOrEqual(4);expect(s.shots).toHaveLength(1);expect(s.shots[0].x).toBeLessThan(s.player.x);expect(s.shots[0].y).toBe(buddyPosition(s,0).y-20);
 tick(s,{},60);expect(buddyFrame(s,0)).toBe(null);
});

test('Serio conducts a destructible cannon tower, transforms at half life and launches landing clowns',()=>{
 const s=quiet(1),b=s.boss,a=s.level.arena;s.damage=()=>{};s.player.x=a.left+160;s.player.y=a.y;s.rescued=3;s.arenaLocked=true;
 Object.assign(b,{phase:'recover',timer:4,vulnerable:true});const body=bossTargets(s)[0],core=bossTargets(s)[1];expect(body.y+body.h).toBeLessThan(core.y);
 const x=b.x,ports=towerSockets(s);b.hp=b.maxHp/2;updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:playerBody});expect(b.phase).toBe('transform');expect(b.vulnerable).toBe(false);expect(towerSockets(s)[1].x).toBeLessThan(ports[1].x);expect(bossDrawing(s).key).toBe('serio-actions');
 for(let n=0;n<300;n++)updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:playerBody});expect(b.phase).toBe('recover');expect(b.vulnerable).toBe(true);expect(b.x).toBe(x);
 s.hostile=[{...bullet(a.left+440,a.y-5),kind:'clown',floor:a.y,vy:180}];tick(s);expect(s.hostile).toHaveLength(0);expect(s.enemies.some(e=>e.type===6)).toBe(true);
 s.player.x=a.right-371;s.player.y=a.y;s.player.ground=s.platforms.findIndex(p=>s.player.x>=p.x&&s.player.x<=p.x+p.w&&p.y===a.y);tick(s,{right:true},15);expect(s.player.x).toBeLessThanOrEqual(a.right-370);
 b.hp=10;b.phase='recover';b.timer=3;b.vulnerable=true;s.shots=specialShots(0,{x:core.x+core.w/2,y:core.y+core.h/2},{x:1,y:0});tick(s);expect(b.hp).toBe(0);
 tick(s,{},120);expect(s.arenaLocked).toBe(false);expect(b.deadTime).toBeGreaterThan(.8);expect(b.phase).toBe('defeated');
});

test('every long route has distributed encounters, late rescues and several usable checkpoints',()=>{
 for(let index=0;index<5;index++){
  const s=quiet(index),l=s.level;expect(l.width).toBeGreaterThan(11000);expect(l.enemies.length).toBeGreaterThan(20);expect(l.checkpoints).toHaveLength(4);expect(l.cages[2][0]).toBeGreaterThan(8500);
  const cp=l.checkpoints[2];s.player.x=cp[0]+5;s.player.y=cp[1];s.player.ground=s.platforms.findIndex(p=>s.player.x>=p.x&&s.player.x<=p.x+p.w&&p.y===s.player.y);s.hearts=2;tick(s);expect(s.checkpointAt).toEqual(cp);
  s.player.y=900;s.player.ground=null;tick(s);expect(s.player.x).toBe(cp[0]);expect(s.player.y).toBe(cp[1]-10);
 }
});

for(const width of [390,844])test(`${width}: HUD stays inside the game and HOLD / shield inputs work`,async({page})=>{
 await page.setViewportSize({width,height:width===390?844:390});await page.goto('/arcade');const root=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]');await expect(root).toHaveAttribute('data-phase','ready',{timeout:30000});await page.locator('[data-practice]').click();await expect(root).toHaveAttribute('data-phase','playing');
 const hud=await page.locator('[data-game-hud]').boundingBox(),screen=await canvas.boundingBox();expect(hud.x).toBeGreaterThanOrEqual(screen.x);expect(hud.y).toBeGreaterThanOrEqual(screen.y);expect(hud.y+hud.height).toBeLessThanOrEqual(screen.y+screen.height+1);
 const x=Number(await canvas.getAttribute('data-player-x'));await page.keyboard.down('KeyF');await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowUp');await page.keyboard.down('KeyZ');await expect(canvas).toHaveAttribute('data-hold','true');await page.waitForTimeout(300);expect(Number(await canvas.getAttribute('data-player-x'))).toBeCloseTo(x,0);
 for(const key of ['KeyF','ArrowRight','ArrowUp','KeyZ'])await page.keyboard.up(key);
 await page.keyboard.down('KeyV');await expect(canvas).toHaveAttribute('data-guard','true');await expect.poll(async()=>Number(await page.getByRole('meter',{name:'Energía de magia',exact:true}).getAttribute('value'))).toBeLessThan(94);await page.keyboard.up('KeyV');await expect(canvas).toHaveAttribute('data-guard','false');
 for(const name of ['Mantener posición','Escudo musical']){const box=await page.getByRole('button',{name,exact:true}).boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
