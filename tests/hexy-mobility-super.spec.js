import {openAdventureMenu} from './arcade-input.helpers';
import {test,expect} from '@playwright/test';
import sharp from 'sharp';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {hexyPose,hexyMuzzle,HEXY_SHEETS} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {SUPER_WINDUP,SUPER_DURATION,SUPER_COST,SUPER_EXHAUSTION,STRONG_COST} from '../src/components/arcade/adventure/engine/adventureMagic';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
const tick=(s,input={},n=1)=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function quiet(index=0){
 const s=createAdventure(index);s.enemies=[];s.pickups=[];s.supplies=[];s.stars=[];s.cages=[];s.hazards=[];
 // These isolated spell fixtures use the interior floor. Chapter 1-4 now
 // starts outside at a negative coordinate, beyond the fixture's beam range.
 if(index===3)Object.assign(s.player,{x:85,y:480,ground:1});return s;
}

test('chapter one starts with a real second jump, an eight-pose somersault and no third jump',()=>{
 const s=quiet();expect(s.doubleJump).toBe(true);expect(s.weapon).toBe(-1);
 tick(s,{jump:true},24);tick(s,{},1);const y=s.player.y;tick(s,{jump:true},1);
 expect(s.player.jumps).toBe(2);expect(s.player.vy).toBeLessThan(-580);expect(hexyPose(s).sheet).toBe('somersault');
 const frames=new Set();for(let n=0;n<48;n++){tick(s,{jump:true});frames.add(hexyPose(s).frame);}
 expect(frames.size).toBeGreaterThanOrEqual(6);expect(s.player.y).toBeLessThan(y);
 tick(s,{},1);tick(s,{jump:true});expect(s.player.jumps).toBe(2);expect(s.events).not.toContain('doubleJump');
});

test('holding jump while falling opens the hat, caps descent and releases immediately',()=>{
 const s=quiet();Object.assign(s.player,{y:180,ground:null,vy:140,jumps:1});
 s.lastInput.jump=true;tick(s,{jump:true},30);expect(s.player.gliding).toBe(true);expect(s.player.vy).toBe(95);expect(hexyPose(s).sheet).toBe('glide');
 const y=s.player.y;tick(s,{},20);expect(s.player.gliding).toBe(false);expect(s.player.vy).toBeGreaterThan(300);expect(s.player.y-y).toBeGreaterThan(35);
 tick(s,{},90);expect(s.player.ground).not.toBe(null);expect(s.player.gliding).toBe(false);
});

test('strong spells fire immediately in the air, downward diagonals and crouched, using the drawn wand',()=>{
 for(const [input,posture,sheet,signs] of [
  [{special:true},'air','air-aim',[1,0]],
  [{special:true,down:true},'air','aim-down',[0,1]],
  [{special:true,down:true,right:true},'air','aim-down-diagonal',[1,1]],
  [{special:true,down:true,left:true},'air','aim-down-diagonal',[-1,1]],
  [{special:true,down:true},'ground','ground-aim',[1,0]],
  [{special:true},'ground','stand-fire',[1,0]],
 ]){
  const s=quiet();s.weapon=0;if(posture==='air')Object.assign(s.player,{y:220,ground:null,vy:0,jumps:1});
  const x=s.player.x,y=s.player.y;tick(s,input);
  expect(s.magic).toBe(100-STRONG_COST);expect(s.shots).toHaveLength(1);expect(hexyPose(s).sheet).toBe(sheet);
  expect([s.shots[0].vx,s.shots[0].vy].map(v=>Math.abs(v)<1e-6?0:Math.sign(v))).toEqual(signs);
  const q=s.shots[0],m=hexyMuzzle(s);expect(q.x-q.vx/120).toBeCloseTo(m.x-(s.player.x-x),3);
  expect(q.y-q.vy/120).toBeCloseTo(m.y-(s.player.y-y),3);
 }
 const held=quiet();held.weapon=3;tick(held,{special:true},110);expect(held.shots).toHaveLength(2);expect(held.magic).toBeGreaterThanOrEqual(70);
});

test('basic downward shots and diagonals follow the head and wand while ground down remains crouch',()=>{
 for(const keys of [{down:true},{down:true,left:true},{down:true,right:true}]){
  const s=quiet();Object.assign(s.player,{ground:null,y:220,vy:0});tick(s,{...keys,attack:true});
  expect(s.shots[0].vy).toBeGreaterThan(0);expect(hexyPose(s).sheet).toContain('aim-down');
 }
 const ground=quiet();tick(ground,{down:true,attack:true});expect(ground.player.crouch).toBe(true);expect(ground.shots[0].vy).toBe(0);
});

test('one press commits a cinematic, freezes the world and protects airborne Hexy for its whole duration',()=>{
 const s=quiet(2);s.player.ground=null;s.player.y=260;s.player.vy=250;s.player.vx=240;
 const e=makeEnemy(900,400,0);s.enemies=[e];
 const shot={x:s.player.x-5,y:240,vx:80,vy:20,r:9,life:4,age:0,kind:'ball'};s.hostile=[shot];
 const before={x:s.player.x,y:s.player.y,clock:s.time,camera:{...s.camera},platforms:structuredClone(s.platforms),enemy:{...e},shot:{...shot},hearts:s.hearts};
 tick(s,{super:true});expect(s.magic).toBe(100-SUPER_COST);expect(s.events).toContain('superCharge');expect(hexyPose(s).sheet).toBe('air-super');expect(hexyPose(s).frame).toBeLessThan(4);
 tick(s,{},Math.ceil(SUPER_WINDUP*120));expect(hexyPose(s).sheet).toBe('super-cast');expect(hexyPose(s).frame).toBeGreaterThanOrEqual(0);expect(s.superCinematic.pulses).toBeGreaterThan(0);
 tick(s,{right:true,dash:true,jump:true,special:true,guard:true},200);
 expect(s.superCinematic).toBeTruthy();expect(s.player.x).toBeLessThan(before.x-35);expect(s.player.x).toBeGreaterThanOrEqual(before.x-40.001);expect(s.player.y).toBe(before.y);expect(s.time).toBe(before.clock);expect(s.camera).toEqual(before.camera);expect(s.platforms).toEqual(before.platforms);
 expect(e.x).toBe(before.enemy.x);expect(e.timer).toBe(before.enemy.timer);expect(shot.x).toBe(before.shot.x);expect(shot.age).toBe(0);expect(s.hearts).toBe(before.hearts);expect(s.magic).toBe(10);
 while(s.superCinematic)tick(s);expect(s.exhaustion).toBe(SUPER_EXHAUSTION);expect(s.player.hurt).toBeGreaterThan(0);
});

test('super recovery is slow, blocks strong spells, and permits them again when the eight seconds finish',()=>{
 const s=quiet();s.weapon=0;tick(s,{super:true});while(s.superCinematic)tick(s);
 expect(s.magic).toBe(10);expect(s.exhaustion).toBe(8);tick(s,{},70);const before=s.magic;tick(s,{},120);expect(s.magic-before).toBeCloseTo(3,5);
 s.magic=60;tick(s,{special:true});expect(s.notice).toBe('exhausted');expect(s.events).not.toContain('heavyCast');
 tick(s,{attack:true});expect(s.shots.length).toBeGreaterThan(0);tick(s,{},860);expect(s.exhaustion).toBe(0);tick(s,{special:true});expect(s.events).toContain('heavyCast');
});

test('held R never retriggers, release does not cancel, and insufficient energy cannot start the cinematic',()=>{
 const s=quiet();tick(s,{super:true});tick(s,{},50);expect(s.superCinematic).toBeTruthy();expect(s.magic).toBe(10);
 const held=quiet();tick(held,{super:true},Math.ceil(SUPER_DURATION*120)+2);held.magic=100;held.exhaustion=0;tick(held,{super:true},10);expect(held.superCinematic).toBe(null);expect(held.magic).toBe(100);
 held.superCooldown=0;tick(held);tick(held,{super:true});expect(held.superCinematic).toBeTruthy();
 const poor=quiet();poor.magic=89.99;tick(poor,{super:true});expect(poor.player.charge).toBe(0);expect(poor.superCinematic).toBeFalsy();expect(poor.notice).toBe('superLow');
});

test('the sustained super clears front bullets, hits active armored bosses eight times and respects entrance phases',()=>{
 for(const phase of ['recover','attack','intro','transform','sleep']){
  const s=quiet(3),b=s.boss;Object.assign(b,{x:350,y:500,phase,timer:10,vulnerable:phase==='recover'});
  s.hostile=[{x:190,y:437,vx:0,vy:0,r:12,life:3,age:0,kind:'bomb',floor:480}];const hp=b.hp;
  tick(s,{super:true});while(s.superCinematic)tick(s);
  expect(s.hostile).toHaveLength(0);expect(hp-b.hp).toBe(['recover','attack'].includes(phase)?64:0);
 }
});

test('a super boss defeat awards the encounter once and never kills off-screen sleepers',()=>{
 const s=quiet(3);Object.assign(s.boss,{x:350,y:500,phase:'attack',hp:16});s.arenaLocked=true;let wins=0;
 tick(s,{super:true});while(s.superCinematic){tick(s);wins+=s.events.filter(e=>e==='bossDown').length;}
 expect(s.boss.hp).toBe(0);expect(wins).toBe(1);expect(s.score).toBe(60);expect(s.arenaLocked).toBe(false);
});

test('diagonal run shooting has twelve dedicated drawings, a raised muzzle and preserves the stride phase',()=>{
 for(const dir of [-1,1]){
  const s=quiet();s.player.x=400;tick(s,{[dir<0?'left':'right']:true},22);const frames=new Set();
  for(let i=0;i<90;i++){tick(s,{[dir<0?'left':'right']:true,up:true,attack:true});const pose=hexyPose(s);expect(pose.sheet).toBe('run-diagonal-up');frames.add(pose.frame);const m=hexyMuzzle(s);expect(m.y).toBeLessThan(s.player.y-65);expect((m.x-s.player.x)*dir).toBeGreaterThan(20);}
  expect(frames.size).toBe(12);const frame=hexyPose(s).frame;s.player.aimY=0;expect(hexyPose(s)).toEqual({sheet:'run-fire',frame});s.player.firing=false;s.player.cast=0;expect(hexyPose(s)).toEqual({sheet:'run',frame});
 }
});

test('zero rescues allows every boss and the exit; rescuing more bunnies adds more projectiles',()=>{
 for(let i=0;i<5;i++){
  const s=createAdventure(i),a=s.level.arena;s.enemies=[];s.hazards=[];s.cages=[];s.player.x=a.entry+(i<=2?145:5);s.player.y=a.y;s.player.ground=s.platforms.findIndex(p=>s.player.x>=p.x&&s.player.x<=p.x+p.w&&p.y===a.y);
  tick(s);expect(s.boss.phase).toBe('intro');expect(s.rescued).toBe(0);
  s.boss.hp=0;s.boss.phase='defeated';s.arenaLocked=false;s.player.x=s.level.exit[0];s.player.y=s.level.exit[1];s.player.ground=null;tick(s);expect(s.clear||s.boss.defeat).toBeTruthy();tick(s,{},1800);expect(s.won).toBe(true);
 }
 const counts=[];for(const rescued of [1,2,3]){const s=quiet();s.rescued=rescued;s.buddyWait=0;let fired=0;for(let i=0;i<500;i++){tick(s);fired+=s.shots.length;s.shots=[];}counts.push(fired);}
 expect(counts[1]).toBeGreaterThan(counts[0]);expect(counts[2]).toBeGreaterThan(counts[1]);
});

test('stationary firing keeps the aimed pose between shots, recoils at release, and plants both feet',()=>{
 for(const crouch of [false,true])for(const weapon of [-1,1,3])for(const dir of [-1,1]){
  const s=quiet();s.weapon=weapon;s.player.x=400;s.player.dir=dir;const frames=new Set(),x=s.player.x,y=s.player.y;
  for(let i=0;i<150;i++){
   tick(s,{attack:true,down:crouch});const pose=hexyPose(s);expect(pose.sheet).toBe(crouch?'ground-aim':'stand-fire');frames.add(pose.frame);
   expect(s.player.x).toBe(x);expect(s.player.y).toBe(y);
   if(s.events.includes('cast')){const bullet=s.shots.at(-1),m=hexyMuzzle(s);expect(bullet.x-bullet.vx/120).toBeCloseTo(m.x,5);expect(bullet.y-bullet.vy/120).toBeCloseTo(m.y,5);expect(pose.frame).toBe(crouch?9:1);}
  }
  expect(frames.size).toBe(4);tick(s,{down:crouch},35);expect(hexyPose(s).sheet).toBe(crouch?'ground-aim':'reactions');
 }
});

test('stationary fire returns to running, crouch walking and aerial art when the physical posture changes',()=>{
 const s=quiet();tick(s,{attack:true},20);expect(hexyPose(s).sheet).toBe('stand-fire');
 tick(s,{right:true,attack:true},20);expect(hexyPose(s).sheet).toBe('run-fire');
 tick(s,{down:true,right:true,attack:true},20);expect(hexyPose(s).sheet).toBe('crouch-walk');
 tick(s,{down:true,attack:true},30);expect(hexyPose(s).sheet).toBe('ground-aim');
 tick(s,{jump:true,attack:true},10);expect(hexyPose(s).sheet).toBe('air-aim');
});

test('canonical sheets fit their grid and the new shield leaves the character center transparent',async()=>{
 for(const sheet of HEXY_SHEETS){const m=await sharp('public/arcade/sprites/hexy/'+sheet+'.webp').metadata();expect(m.width).toBe(1280);expect(m.height%320).toBe(0);expect(m.hasAlpha).toBe(true);}
 const {data}=await sharp('public/arcade/sprites/effects/bunny-shield.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let sum=0,count=0;for(let y=85;y<170;y++)for(let x=85;x<170;x++){sum+=data[(y*1024+x)*4+3];count++;}expect(sum/count).toBeLessThan(8);
});

test.describe('touch controls',()=>{
 test.use({hasTouch:true});
for(const width of [360,844])test(`${width}: super controls, mana indicators, keyboard double jump and no overflow`,async({page})=>{
 await page.setViewportSize({width,height:width===360?800:480});await page.goto('/arcade');await openAdventureMenu(page);const root=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]');await expect(root).toHaveAttribute('data-phase','ready',{timeout:30000});await page.locator('[data-practice]').click();await expect(root).toHaveAttribute('data-phase','playing');
 await page.keyboard.down('Space');await page.waitForTimeout(100);await page.keyboard.up('Space');await page.keyboard.down('Space');await expect(canvas).toHaveAttribute('data-jumps','2');await expect(canvas).toHaveAttribute('data-pose',/somersault:/);await page.keyboard.up('Space');
 await page.keyboard.press('KeyR');await expect(page.locator('[data-super-control]')).toHaveAttribute('data-charged','true');await expect(canvas).toHaveAttribute('data-pose',/super-cast:(9|10|11)/);await expect(page.locator('[data-super-status]')).toContainText('Recargando el súper');
 const meter=page.getByRole('meter',{name:'Energía de magia',exact:true});expect(Number(await meter.getAttribute('value'))).toBeLessThan(20);
 for(const name of ['Súper ataque','Magia fuerte','Saltar']){const r=await page.getByRole('button',{name,exact:true}).boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(width);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

});

test('two rapid jump taps and a single super tap survive arriving between rendered frames',async({page})=>{
 await page.goto('/arcade');await openAdventureMenu(page);const root=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]');await expect(root).toHaveAttribute('data-phase','ready',{timeout:30000});await page.locator('[data-practice]').click();await expect(root).toHaveAttribute('data-phase','playing');
 await page.evaluate(()=>{for(let i=0;i<2;i++)for(const type of ['keydown','keyup'])window.dispatchEvent(new KeyboardEvent(type,{code:'Space',bubbles:true}));});
 await expect(canvas).toHaveAttribute('data-jumps','2');await expect(canvas).toHaveAttribute('data-pose',/somersault:/);
 await page.evaluate(()=>{for(const type of ['keydown','keyup'])window.dispatchEvent(new KeyboardEvent(type,{code:'KeyR',bubbles:true}));});
 await expect(canvas).toHaveAttribute('data-super-active','true');await expect(page.getByRole('meter',{name:'Energía de magia',exact:true})).toHaveAttribute('value','10');
});
