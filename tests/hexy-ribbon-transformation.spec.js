import {test,expect} from '@playwright/test';
import {createTrial} from '../src/components/arcade/adventure/engine/adventureTrial';
import {createAdventure,stepAdventure,adventureCarry,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {MODS,modCategory,equippedMods,updateMods} from '../src/components/arcade/adventure/engine/adventureMods';
import {equipDrink,collectDrink,grantStartingDrink,validSpare} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {beginRibbonDance,endRibbonDance,ribbonReflect,ribbonActive} from '../src/components/arcade/adventure/engine/adventureRibbonState';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {takeLoot} from '../src/components/arcade/adventure/engine/adventureLoot';
import {beginRibbonSlam} from '../src/components/arcade/adventure/engine/adventureRibbon';
const tap=(s,input)=>{tick(s,1,input);tick(s,1,{...input,special:false});};
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function scene(level=1,sip=true){const s=createTrial(MODS.find(m=>m.id==='ribbon-duration'),level);s.enemies=[];if(sip)tick(s,86);return s;}
function enemy(s,dx,type=0,hp=30){const e=makeEnemy(s.player.x+dx,480,type);e.hp=hp;e.timer=e.recovery=99;return e;}

test('a found Ribbon is drunk before ten seconds begin, preserves both cans and returns exact ammo',()=>{
 const s=scene(1,false);endRibbonDance(s);s.mods=[];equipDrink(s,5,17,2,110);s.spareDrink={kind:0,ammo:19,capacity:54,tier:1};beginRibbonDance(s);
 expect(hexyPose(s)).toEqual({sheet:'ribbon-dance',frame:16});tick(s,60,{special:true,attack:true,dash:true});expect(s.shots).toHaveLength(0);expect(s.ribbonDance.remaining).toBe(10);
 tick(s,25);expect(ribbonActive(s)).toBe(true);const start=s.time;tick(s,600,{attack:true});expect(s.ribbonDance.remaining).toBeCloseTo(5,1);expect(s.magic).toBe(100);expect(s.ammo).toBe(44);
 tick(s,602);expect(s.time-start).toBeGreaterThan(10);expect(s.ribbonDance).toBeNull();expect(s.weapon).toBe(5);expect(s.ammo).toBe(17);expect(s.drinkTier).toBe(2);expect(s.ammoCapacity).toBe(110);expect(s.spareDrink.ammo).toBe(19);
});

test('Ribbon upgrades do not grant a starting can or occupy the normal drink pocket',()=>{
 const mods=['ribbon-duration','starter-0','starter-5'];const s=createAdventure(0,false,{mods,modCategorySlots:{drinks:2,skills:2},modLevels:{'ribbon-duration':3}});grantStartingDrink(s);
 expect(s.weapon).toBe(0);expect(s.spareDrink.kind).toBe(5);expect(s.ribbonDance).toBeFalsy();expect(validSpare({kind:12,ammo:44})).toBeNull();expect(modCategory(MODS.find(m=>m.id==='ribbon-duration'))).toBe('skills');expect(equippedMods(mods,mods,{drinks:2,skills:2})).toEqual(mods);
});

test('duration mods extend time, loot updates the saved can and retry/carry cannot perpetuate Ribbon',()=>{
 for(const [level,duration]of [[1,13],[2,16],[3,18]]){const s=scene();s.mods.push('ribbon-duration');s.modLevels['ribbon-duration']=level;beginRibbonDance(s);expect(s.ribbonDance.duration).toBe(duration);}
 const s=scene();collectDrink(s,9);expect(s.weapon).toBe(12);expect(s.ribbonDance.stored.kind).toBe(9);expect(adventureCarry(s).weapon).toBe(9);retryAdventure(s);expect(s.ribbonDance).toBeNull();expect(s.weapon).not.toBe(12);
 const q=scene();takeLoot(q,{type:'original'});expect(q.ribbonDance).toBeNull();expect(q.overdrive).toBeGreaterThan(0);expect(q.player.sipKind).toBe('original');
});

test('XY launches, jump and Y bind in the air and slam; the landing pushes nearby basics, not machines',()=>{
 const s=scene(),e=enemy(s,170),near=enemy(s,265),machine=enemy(s,270,12);s.enemies=[e,near,machine];const nearX=near.x;
 tick(s,1,{attack:true});tick(s,15);tap(s,{special:true});expect(s.player.ribbonFinisher).toBe('launch');
 for(let i=0;i<80&&!e.ribbonLift;i++)tick(s,1);expect(e.ribbonLift).toBe(true);expect(enemyDrawing(e).key).toBe('clown-ribbon');
 tick(s,1,{jump:true});tick(s,25,{jump:true,right:true});
 for(let i=0;i<60&&!s.player.ribbonCanChain;i++)tick(s,1,{jump:true});
 tap(s,{special:true});expect(s.player.ribbonFinisher).toBe('airbind');
 let bound=false,landed=false;for(let i=0;i<150;i++){tick(s,1);bound||=e.ribbonControl?.kind==='airbind';landed||=s.events.includes('ribbonGroundImpact');}
 expect(bound).toBe(true);expect(landed).toBe(true);expect(e.y).toBe(e.baseY);expect(near.x).toBeGreaterThan(nearX);expect(machine.x).toBe(machine.home);
});

test('spinning dash animates a full turn, damages each crossed target once and reflects a projectile',()=>{
 const s=scene(),e=enemy(s,80),e2=enemy(s,145);s.enemies=[e,e2];const p=s.player,frames=new Set();s.hostile=[{kind:'streamer',x:p.x+180,y:p.y-38,vx:-250,vy:0,life:4,age:0,r:8}];let reflected=false;
 tick(s,1,{dash:true});for(let i=0;i<45;i++){tick(s,1);const pose=hexyPose(s);if(pose.sheet==='ribbon-spin')frames.add(pose.frame);reflected||=s.shots.some(q=>q.ribbonReflected);}
 expect([...frames].sort()).toEqual([0,1,2,3,4,5,6,7]);expect(e.hp).toBe(28);expect(e2.hp).toBeLessThanOrEqual(28);expect(s.player.ribbonDashHits.filter(q=>q===e)).toHaveLength(1);expect(reflected).toBe(true);expect(s.ribbonPetals.length).toBeGreaterThan(0);
});

test('guard reflects moving pellets from all sides, but does not reflect continuous fire or blasts',()=>{
 const s=scene();tick(s,1,{guard:true});expect(hexyPose(s).sheet).toBe('ribbon-dance');
 for(const dx of [-45,45]){const q={kind:'streamer',x:s.player.x+dx,y:s.player.y-45,vx:-Math.sign(dx)*300,vy:0,life:1,r:8};expect(ribbonReflect(s,q)).toBe(true);expect(s.shots.at(-1).vx).toBe(-q.vx*1.2);expect(q.life).toBe(0);}
 for(const kind of ['harlequin-groundfire','breath','blast'])expect(ribbonReflect(s,{kind,x:s.player.x,y:s.player.y-40,vx:100,vy:0,life:1})).toBe(false);
 tick(s,5);expect(s.player.guarding).toBe(false);expect(ribbonReflect(s,{kind:'streamer',x:s.player.x,y:s.player.y-40,vx:100,vy:0,life:1})).toBe(false);
});

test('dash protection ends with the dash and the transformation never gives standing invulnerability',()=>{
 const s=scene();s.trial=null;tick(s,1,{dash:true});const hp=s.hearts;s.damage({kind:'fire'});expect(s.hearts).toBe(hp);tick(s,60);s.damage({kind:'fire'});expect(s.hearts).toBeLessThan(hp);expect(s.ribbonDance).toBeTruthy();
});

test('higher choreography adds a real hop and level three grants a second airborne dash',()=>{
 for(const level of [1,2,3]){const s=scene(level);tick(s,1,{attack:true});tick(s,Math.ceil(50/[1,1.28,1.48][level-1]));tick(s,1,{attack:true});expect(s.player.ground===null).toBe(level>=2);if(level>=2)expect(hexyPose(s).sheet).toBe('ribbon-dance');}
 const s=scene(3);tick(s,1,{jump:true});tick(s,3,{jump:true});tick(s,1,{dash:true});tick(s,42);tick(s,1,{dash:true});expect(s.player.dash).toBeGreaterThan(0);
 const base=scene(1);tick(base,1,{jump:true});tick(base,20,{jump:true});tick(base,1,{dash:true});tick(base,68);tick(base,1,{dash:true});expect(base.player.dash).toBe(0);
});

test('level three aerial XXY keeps a normal clown alive for the bind and cannot juggle without limit',()=>{
 const s=scene(3),e=enemy(s,125,0,4.6);s.enemies=[e];
 tick(s,1,{attack:true});tick(s,12);tap(s,{special:true});for(let i=0;i<65&&!e.ribbonLift;i++)tick(s,1);
 expect(e.hp).toBeGreaterThan(0);tick(s,1,{jump:true});tick(s,9,{jump:true,right:true});tick(s,1,{attack:true,jump:true});
 tick(s,32,{jump:true});tick(s,1,{attack:true,jump:true});tick(s,13,{jump:true});
 expect(e.hp).toBeGreaterThan(0);expect(s.player.ribbonAirCount).toBe(2);tap(s,{special:true});tick(s,Math.ceil(s.hitStop*120)+1);const q=s.shots.find(q=>q.ribbonStrong);expect(q,JSON.stringify({p:s.player,events:s.events,shots:s.shots.map(q=>({ribbon:q.ribbon,strong:q.ribbonStrong,life:q.life}))})).toBeTruthy();expect(q.ribbonFinisher).toBe('airbind');expect(q.ribbonChainCount).toBe(2);
 let bound=false;for(let i=0;i<120;i++){tick(s,1);bound||=e.ribbonControl?.kind==='airbind';}expect(bound).toBe(true);expect(e.ribbonAirLinks||0).toBeLessThanOrEqual(2);
});

test('changing reserve equipment during Ribbon adjusts the saved can without filling it or prolonging the timer',()=>{
 const s=scene();endRibbonDance(s);equipDrink(s,0,17);beginRibbonDance(s);tick(s,100);const left=s.ribbonDance.remaining;
 updateMods(s,['ribbon-duration','reserve-sleeve'],{'ribbon-duration':2,'reserve-sleeve':3},{skills:1,drinks:2});expect(s.ribbonDance.remaining).toBe(left);expect(s.ribbonDance.stored.ammo).toBe(17);expect(s.ribbonDance.stored.capacity).toBe(Math.floor(54*1.35));endRibbonDance(s);expect(s.ammo).toBe(17);
});

test('the aerial finisher binds one contacted basic at base level and at most three after level-three XX',()=>{
 for(const [level,count]of [[1,1],[3,3]]){
  const s=scene(level);s.player.y=300;s.player.ground=null;s.player.ribbonAirCount=2;s.player.ribbonChain=.3;s.enemies=[150,158,166,174].map(dx=>{const e=enemy(s,dx);e.y=310;e.vy=0;e.jellyLift=1;e.ribbonLift=true;return e;});
  beginRibbonSlam(s,1);const q=s.shots.at(-1);tick(s,100);expect(q.boundTargets).toHaveLength(count);expect(new Set(q.boundTargets).size).toBe(count);
 }
});

test('XXYY finishes the binding chain with a ground impact',()=>{
 const s=scene(),e=enemy(s,180);s.enemies=[e];tick(s,1,{attack:true});tick(s,44);tick(s,1,{attack:true});tick(s,34);tap(s,{special:true});
 for(let i=0;i<180&&!s.player.ribbonCanChain;i++)tick(s,1);expect(e.ribbonBound).toBeGreaterThan(0);const x=e.x;
 tap(s,{special:true});tick(s,Math.ceil(s.hitStop*120)+1);expect(s.player.ribbonMove).toBe('reel-slam');expect(s.player.ribbonFinisher).toBe('airbind');tick(s,110);expect(e.y).toBe(e.baseY);
});
