import {test,expect} from '@playwright/test';
import {createTrial,trialDemoInput,stepTrial,changeTrialDrink} from '../src/components/arcade/adventure/engine/adventureTrial';
import {stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {MODS} from '../src/components/arcade/adventure/engine/adventureMods';
import {sanitizeSave} from '../src/components/arcade/shared/arcadeStore';
import {RIBBON_CHAINS} from '../src/components/arcade/adventure/engine/adventureRibbonCombos';
import {ribbonReflect,ribbonJumpSpin} from '../src/components/arcade/adventure/engine/adventureRibbonState';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
const mod=MODS.find(m=>m.id==='ribbon-duration');
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const scene=(level=1)=>{const s=createTrial(mod,level);s.enemies=[];tick(s,86);return s;};
test('one Ribbon upgrade replaces both old purchases and keeps their highest level',()=>{
 expect(MODS.filter(m=>m.drink===12||m.timed).map(m=>m.id)).toEqual(['ribbon-duration']);expect(mod.maxLevel).toBe(4);
 const save=sanitizeSave({version:1,campaign:2,economy:2,stars:165,modCategorySlots:{skills:3,drinks:2},modsOwned:['starter-12','ribbon-duration','starter-5'],modsEquipped:['starter-12','ribbon-duration','starter-5'],modLevels:{'starter-12':3,'ribbon-duration':1,'starter-5':2}});
 expect(save.modsOwned).toEqual(['ribbon-duration','starter-5']);expect(save.modsEquipped).toEqual(save.modsOwned);expect(save.modLevels['ribbon-duration']).toBe(3);expect(save.modLevels['starter-12']).toBeUndefined();expect(save.stars).toBe(165);
});
test('holding X gives one light strike, no repeated swings, then one pull on release',()=>{
 const s=scene(),starts=new Set(),ammo=s.ammo;
 for(let i=0;i<180;i++){tick(s,1,{attack:true});for(const q of s.shots)if(q.ribbon)starts.add(q);}
 expect(starts.size).toBe(1);expect(s.player.ribbonCharge.age).toBeGreaterThan(.5);tick(s,1);expect(s.player.ribbonMove).toBe('pull');const q=s.shots.find(q=>q.ribbonStrong);expect(q.ribbonFinisher).toBe('pull');tick(s,180);expect(s.shots.filter(q=>q.ribbon)).toHaveLength(0);expect(s.ammo).toBe(ammo);
});
test('guard, dash and damage cancel a charge and releasing cannot fire it later',()=>{
 for(const cancel of ['guard','dash','damage']){const s=scene();tick(s,100,{special:true});if(cancel==='damage')s.player.hitReact=.32;tick(s,1,cancel==='damage'?{}:{[cancel]:true});tick(s,150);expect(s.player.ribbonCharge).toBeNull();expect(s.player.ribbonMove).not.toBe('burst');expect(s.shots.some(q=>q.ribbonStrong)).toBe(false);}
});
for(const [keys,id]of Object.entries(RIBBON_CHAINS))test(`${keys.toUpperCase()} demo executes its actual finisher at levels I and IV`,()=>{
 for(const level of [1,4]){const s=createTrial(mod,level);s.trial.ribbonDemo=id;for(const e of s.enemies){e.hp=100;e.recovery=99;e.practice=false;}const seen=new Set(),poses=new Set();
  for(let i=0;i<650;i++){stepTrial(s,trialDemoInput(s),1/120);seen.add(s.player.ribbonMove);if(s.player.ribbonMove===id)poses.add(hexyPose(s).sheet);expect(Number.isFinite(s.player.x)).toBe(true);}
  expect([...seen]).toContain(id);if(level===4&&['wand-toss','reel-slam'].includes(id))expect([...poses]).toContain('ribbon-mastery');expect(s.ammo).toBe(44);
 }
});
test('jump turns from takeoff, hits once per target and only reflects during the visible turn',()=>{
 const s=scene(),p=s.player,e=makeEnemy(p.x+30,480,0);e.hp=30;e.recovery=99;s.enemies=[e];tick(s,1,{jump:true});expect(ribbonJumpSpin(s)).toBe(true);expect(hexyPose(s)).toEqual({sheet:'ribbon-mastery',frame:8});
 const shot={kind:'streamer',x:p.x+30,y:p.y-40,vx:-200,vy:0,r:8,life:2};expect(ribbonReflect(s,shot)).toBe(true);s.shots=s.shots.filter(q=>!q.ribbonReflected);tick(s,20,{jump:true});expect(e.hp).toBeCloseTo(29.8);tick(s,50,{jump:true});expect(ribbonJumpSpin(s)).toBe(false);expect(ribbonReflect(s,{...shot,life:2,x:p.x,y:p.y-40})).toBe(false);
});
test('expired practice stays expired; changing the next drink cannot silently reactivate Ribbon',()=>{
 const s=scene();tick(s,1800);expect(s.ribbonDance).toBeNull();changeTrialDrink(s,5);expect(s.ribbonDance).toBeNull();expect(s.weapon).toBe(5);for(let i=0;i<180;i++)stepTrial(s,{},1/120);expect(s.ribbonDance).toBeNull();
});
test('level IV reel binds a contacted target, drags it toward Hexy and lands on the floor',()=>{
 const s=createTrial(mod,4);s.trial.ribbonDemo='reel-slam';const e=s.enemies[0];e.x=e.home=500;e.hp=100;e.recovery=99;e.practice=false;s.enemies=[e];let start,dragged=false,landed=false;
 for(let i=0;i<700;i++){stepTrial(s,trialDemoInput(s),1/120);if(e.ribbonControl?.reel){start??=e.x;dragged||=e.x<start-8;}landed||=s.events.includes('ribbonGroundImpact');}
 expect(dragged).toBe(true);expect(landed).toBe(true);expect(e.y).toBe(e.baseY);
});
