import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {readAdventureGamepad} from '../src/components/arcade/adventure/input/adventureGamepad';
import {surfaceMaterial} from '../src/components/arcade/adventure/engine/adventureSurfaceFeedback';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {reactToElement,stepElementHit} from '../src/components/arcade/adventure/actors/enemies/adventureElementHits';
import {electricBodyFilter,electricPulse} from '../src/components/arcade/adventure/render/electricEnemyCanvas';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import sharp from 'sharp';
const tick=(s,seconds,input={})=>{for(let i=0;i<seconds*120;i++)stepAdventure(s,input,1/120);};
function quiet(index=0,carry={}){
 const s=createAdventure(index,false,carry);
 s.platforms=[{x:0,y:480,w:30000,h:150,baseY:480,kind:'earth',dx:0,dy:0}];
 s.level={...s.level,route:s.platforms,checkpoints:[],shop:null,ambushes:[]};
 for(const k of ['enemies','cages','supplies','outposts','stars','hazards','campTents','villagers','carriages','actTwoAmbushes'])s[k]=[];
 s.player.x=1000;s.player.y=480;s.player.ground=0;s.boss.phase='sleep';return s;
}
const xbox=(...pressed)=>readAdventureGamepad({mapping:'standard',connected:true,axes:[0,0],buttons:Array.from({length:17},(_,i)=>({pressed:pressed.includes(i),value:pressed.includes(i)?1:0}))});

for(const weapon of [-1,0,9,13])for(const aim of ['right','up','down'])test(`held Xbox A retains the hat and registered wand while firing ${weapon} ${aim}`,()=>{
 const s=quiet(0,{weapon,ammo:120});Object.assign(s.player,{ground:null,y:160,vy:130,jumps:1,gliding:true});s.lastInput.jump=true;
 const input=xbox(0,2,...(aim==='up'?[12]:aim==='down'?[13]:[]));
 tick(s,1/120,input);expect(hexyPose(s).sheet).toBe('glide-fire-v1');
 const muzzle=hexyMuzzle(s);expect(Number.isFinite(muzzle.x+muzzle.y)).toBe(true);
 if(weapon===9)expect(Math.hypot(s.voltBeam.segments[0].from.x-muzzle.x,s.voltBeam.segments[0].from.y-muzzle.y)).toBeLessThan(2);
 else{expect(s.shots.length).toBeGreaterThan(0);const shot=s.shots[0];expect(Math.hypot(shot.previousX-muzzle.x,shot.previousY-muzzle.y)).toBeLessThan(4);}
 if(weapon===13){expect(s.player.vy).toBeLessThan(0);tick(s,.4,input);}else tick(s,.1,input);
 expect(s.player.gliding).toBe(true);expect(s.player.vy).toBe(95);expect(hexyPose(s).sheet).toBe('glide-fire-v1');
 tick(s,.1,{});expect(s.player.gliding).toBe(false);expect(hexyPose(s).sheet).not.toBe('glide-fire-v1');
});

for(const up of [false,true])test(`walking guard ${up?'overhead':'forward'} uses a complete travelling gait and returns to a still block`,()=>{
 const s=quiet(0,up?{mods:['sky-guard'],modLevels:{'sky-guard':2}}:{}),frames=new Set(),input={guard:true,right:true,...(up?{up:true}:{})};
 for(let i=0;i<220;i++){stepAdventure(s,input,1/120);const pose=hexyPose(s);if(pose.sheet==='guard-walk-v1')frames.add(pose.frame);}
 expect(frames.size).toBe(8);expect(s.player.x).toBeGreaterThan(1140);expect(s.player.guarding).toBe(true);expect(s.magic).toBeLessThan(100);
 tick(s,.2,{guard:true,...(up?{up:true}:{})});expect(hexyPose(s).sheet).toBe(up?'guard-up':'guard-pose');
});

test('foot contact respects materials, actual travel and landings; retry removes old dust',()=>{
 const s=quiet();s.level.world={...s.level.world,key:'harbor'};expect(surfaceMaterial(s)).toBe('sand');tick(s,.4,{right:true});expect(s.surfaceDust.some(q=>q.material==='sand'&&!q.landing)).toBe(true);
 tick(s,.6);expect(s.surfaceDust).toHaveLength(0);tick(s,.2);expect(s.surfaceDust).toHaveLength(0);
 Object.assign(s.player,{ground:null,y:400,vy:400});tick(s,.16);expect(s.surfaceDust.some(q=>q.landing&&q.material==='sand')).toBe(true);
 const q=s.platforms[0];q.kind='stone';expect(surfaceMaterial(s)).toBe('stone');q.kind='wood';expect(surfaceMaterial(s)).toBe('wood');
 Object.assign(s.player,{ground:null,y:140,vy:120});s.surfaceDust=[];tick(s,.3,{jump:true,right:true});expect(s.surfaceDust).toHaveLength(0);
 s.surfaceDust=[{age:0}];retryAdventure(s);expect(s.surfaceDust).toHaveLength(0);
});

test('Dragon shots leave a bounded visual trail; zombie flames expire without applying extra damage',()=>{
 const s=quiet(0,{weapon:0,ammo:50});tick(s,.2,{attack:true});expect(s.shots[0].fireTrail.length).toBeGreaterThan(4);expect(s.shots[0].fireTrail.length).toBeLessThanOrEqual(18);
 const e=makeEnemy(1300,480,18),hp=e.hp;expect(reactToElement(e,{kind:0})).toBe(true);expect(e.burning.life).toBeGreaterThan(1);
 stepElementHit(e,.5);reactToElement(e,{kind:0});expect(e.burning.life).toBeGreaterThan(1);stepElementHit(e,1.1);expect(e.burning).toBeNull();expect(e.hp).toBe(hp);
});

test('electric acting slows the original enemy until its reaction expires',()=>{
 const a=quiet(),b=quiet(),e=makeEnemy(1400,480,0),other=makeEnemy(1400,480,0);e.timer=other.timer=99;a.enemies=[e];b.enemies=[other];
 reactToElement(e,{kind:9});for(let i=0;i<24;i++){updateEnemies(a,1/120,()=>({x:0,y:0,w:0,h:0}),()=>{});updateEnemies(b,1/120,()=>({x:0,y:0,w:0,h:0}),()=>{});}
 expect(Math.abs(e.x-1400)).toBeLessThan(Math.abs(other.x-1400)*.5);expect(e.type).toBe(0);expect(e.hp).toBe(e.maxHp);
 stepElementHit(e,.6);expect(e.elementHit).toBeNull();
});

test('low health idle acting yields immediately to running, attacks and injury',()=>{
 const s=quiet();s.hearts=2;expect(hexyPose(s)).toMatchObject({sheet:'health-idle-v1'});expect(hexyPose(s).frame).toBeLessThan(4);
 s.hearts=1;expect(hexyPose(s).frame).toBeGreaterThanOrEqual(4);s.player.vx=255;expect(hexyPose(s).sheet).toBe('run');s.player.vx=0;s.player.cast=.2;expect(hexyPose(s).sheet).toBe('stand-fire');s.player.hitReact=.2;expect(hexyPose(s).sheet).not.toBe('health-idle-v1');
});

test('electric feedback keeps the original body visible, holds its own Hit pose and blinks filled energy',async()=>{
 const e=makeEnemy(100,480,3);reactToElement(e,{kind:9});
 for(const [age,on] of [[.02,true],[.1,false],[.18,true]]){e.elementHit.age=age;const c={globalAlpha:.75,translate(){}};electricBodyFilter(c,e,false);expect(c.globalAlpha).toBe(.75);expect(electricPulse(e)).toBe(on);expect(electricPulse(e,true)).toBe(true);}
 e.flash=0;e.elementHit.age=.48;expect(enemyDrawing(e)).toEqual({key:'juggler-actions',frame:10});expect(e.phase).toBe('patrol');
 e.elementHit=null;e.recovery=0;expect(enemyDrawing(e).key).toBe('juggler-walk-v2');
 for(const [type,key,frame] of [[1,'acrobat-rings',10],[4,'acrobat-rings',10],[6,'clown',10],[14,'umbrella-clown',10],[29,'act-two-enemies',6]]){const q=makeEnemy(100,480,type);reactToElement(q,{kind:9});expect(enemyDrawing(q)).toEqual({key,frame});}
 const witch=makeEnemy(100,480,26);witch.phase='absorb';witch.phaseAge=1;reactToElement(witch,{kind:9});expect(enemyDrawing(witch).frame).toBeGreaterThanOrEqual(16);expect(witch.phase).toBe('absorb');
 const {data,info}=await sharp('public/arcade/sprites/feedback/electric-fill-v2.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<4;i++)expect(data[(128*info.width+i*256+128)*4+3]).toBe(255);
});
