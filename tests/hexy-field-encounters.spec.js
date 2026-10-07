import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,adventureCarry,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {DRINK_SHOTS,equipDrink,STRONG_SHOTS} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {updateOutposts,damageOutpost,outpostFrame} from '../src/components/arcade/adventure/actors/enemies/adventureOutposts';
import {updateBoss} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {bossDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {cameraView} from '../src/components/arcade/adventure/render/adventureCamera';
const tick=(s,n=1,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const quiet=()=>{const s=createAdventure();s.enemies=[];s.outposts=[];s.pickups=[];s.supplies=[];s.hazards=[];s.stars=[];return s;};
test('every can has finite volleys; the final powered shot survives while later shots return to base',()=>{
 for(let kind=0;kind<5;kind++){
  const s=quiet();equipDrink(s,kind,2);tick(s,1,{attack:true});expect(s.ammo).toBe(1);expect(s.shots.every(q=>q.kind===kind)).toBe(true);
  s.shotWait=0;s.shots=[];tick(s,1,{attack:true});expect(s.weapon).toBe(-1);expect(s.ammo).toBe(0);expect(s.shots.every(q=>q.kind===kind)).toBe(true);
  s.shotWait=0;s.shots=[];tick(s,1,{attack:true});expect(s.shots).toHaveLength(1);expect(s.shots[0].kind).toBe(-1);
 }
});
test('pickups refill finite ammunition, strong spells spend five, bunnies and general super do not',()=>{
 const s=quiet();s.pickups=[{x:s.player.x,y:s.player.y-28,kind:0}];tick(s);expect(s.ammo).toBe(DRINK_SHOTS[0]);
  tick(s,30);tick(s,1,{special:true});expect(s.ammo).toBe(DRINK_SHOTS[0]-STRONG_SHOTS);expect(s.magic).toBe(65.5);
 tick(s,60);s.magic=100;const ammo=s.ammo;tick(s,1,{super:true});while(s.superCinematic)tick(s);expect(s.ammo).toBe(ammo);
 s.rescued=3;tick(s,300);expect(s.ammo).toBe(ammo);
 const carry=adventureCarry(s),next=createAdventure(1,false,carry);expect(next.ammo).toBe(ammo);expect(next.weapon).toBe(0);
 equipDrink(s,3,4);s.exhaustion=0;tick(s,1,{special:true});expect(s.notice).toBe('lowAmmo');expect(s.ammo).toBe(4);
});
test('three outposts spawn capped clown waves, break in stages and never spawn after destruction',()=>{
 const s=createAdventure(),q=s.outposts[0];s.player.x=q.x-180;s.enemies=[];
 for(let i=0;i<2600;i++)updateOutposts(s,1/120);
 expect(s.outposts).toHaveLength(3);expect(s.enemies).toHaveLength(3);expect(s.enemies.every(e=>[0,3].includes(e.type)&&e.outpost===q.id)).toBe(true);
 damageOutpost(s,q,13);expect([3,4]).toContain(outpostFrame(q));damageOutpost(s,q,13);expect(q.hp).toBe(0);expect(outpostFrame(q)).toBe(5);
 s.enemies=[];for(let i=0;i<1600;i++)updateOutposts(s,1/120);expect(s.enemies).toHaveLength(0);expect(outpostFrame(q)).toBe(7);expect(s.pickups.some(p=>p.x===q.x+36)).toBe(true);
});
test('both normal shots and the super destroy a tent and preserve the ruined structure',()=>{
 for(const superAttack of [false,true]){
  const s=createAdventure(),q=s.outposts[0];s.enemies=[];s.player.x=q.x-180;s.player.y=q.y;s.player.ground=s.platforms.findIndex(p=>s.player.x>=p.x&&s.player.x<p.x+p.w);s.player.hurt=100;
  if(superAttack){tick(s,1,{super:true});while(s.superCinematic)tick(s);}else tick(s,650,{attack:true});
  expect(q.hp).toBe(0);expect(s.outposts).toContain(q);expect(s.score).toBeGreaterThanOrEqual(12);
 }
});
test('the balloon visibly changes at half health and adds a swoop during its second phase',()=>{
 const s=quiet(),b=s.boss,a=s.level.arena;s.player.x=a.left+260;s.player.y=a.y;s.damage=()=>{};Object.assign(b,{phase:'recover',timer:0,hp:b.maxHp*.5});
 const helpers={say:()=>{},particles:()=>{},body:playerBody};updateBoss(s,1/120,helpers);expect(b.phase).toBe('transform');expect(b.transformed).toBe(true);expect(bossDrawing(s)).toEqual({key:'balloon-shell',frame:2});
 const moves=new Set();for(let i=0;i<3000;i++){updateBoss(s,1/120,helpers);if(b.phase==='attack')moves.add(b.move);}
 expect(b.stage).toBe(2);expect(moves.has('swoop')).toBe(true);expect(moves.has('balls')).toBe(true);
});
test('balloon defeat reaches ground, persists as wreckage and expires every airborne impact',()=>{
 const s=quiet(),a=s.level.arena,b=s.boss;s.player.x=a.left+250;s.player.y=a.y;s.player.ground=s.platforms.length-1;Object.assign(b,{hp:0,phase:'defeated',y:a.y-150});s.camera={x:a.left,y:a.y-580,zoom:.82};
 s.effects=[{x:b.x,y:b.y-50,row:0,age:0,life:.32,size:150}];s.particles=[{x:b.x,y:b.y,vx:30,vy:-10,life:.55}];
 tick(s,1);expect(b.defeat).toBeTruthy();expect(s.clear).toBeFalsy();const frames=new Set();for(let i=0;i<390;i++){tick(s);frames.add(bossDrawing(s).frame);}
 expect(b.y).toBe(a.y);expect(b.defeat.ready).toBe(true);expect(s.effects).toHaveLength(0);expect(s.particles).toHaveLength(0);expect(bossDrawing(s).key).toBe('balloon-shell');expect(frames.size).toBeGreaterThan(4);expect(s.clear).toBeTruthy();
});
test('the balloon arena pans in both directions and its walking limits coincide with screen edges',()=>{
 const s=quiet(),a=s.level.arena;s.player.x=a.left+300;s.player.y=a.y;s.player.ground=s.platforms.length-1;s.player.hurt=100;s.arenaLocked=true;s.camera={x:a.left,y:a.y-580,zoom:.82};Object.assign(s.boss,{phase:'recover',timer:100});
 tick(s,900,{right:true});const rightCam=s.camera.x,view=cameraView(s);expect(rightCam-a.left).toBeGreaterThan(300);expect(s.player.x-s.camera.x).toBeCloseTo(view.width-16,0);
 tick(s,900,{left:true});expect(s.camera.x).toBeCloseTo(a.left,0);expect(s.player.x-s.camera.x).toBeCloseTo(16,0);expect(s.camera.x).toBeLessThan(rightCam);
});

test('defeating an engaged balloon at the left boundary still lands, plants and advances',()=>{
 const s=quiet(),a=s.level.arena;s.player.x=a.entry+145;s.player.y=a.y;s.player.ground=s.platforms.length-1;s.camera={x:a.left,y:a.y-580,zoom:.82};tick(s);
 expect(s.boss.engaged).toBe(true);s.player.x=a.left+16;s.boss.hp=0;tick(s,1300);expect(s.won).toBe(true);expect(s.boss.defeat.ready).toBe(true);
});
