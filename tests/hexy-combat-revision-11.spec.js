import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {equipDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {beamPath} from '../src/components/arcade/adventure/engine/adventureVolt';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {beginCandyCapture,witchId} from '../src/components/arcade/adventure/engine/villageRescue';
import {hexyChannelProfile} from '../src/components/arcade/shared/audio/hexyAttackSound';
const tick=(s,time,input={})=>{for(let i=0;i<Math.ceil(time*120);i++)stepAdventure(s,input,1/120);};
function scene(){const s=createAdventure(7);s.enemies=[];s.villagers=[];s.carriages=[];s.supplies=[];s.cages=[];s.outposts=[];s.villageObstacles=[];s.villageRubble=[];s.platforms=s.platforms.filter(p=>!p.villageObstacle);place(s,9000);s.player.hurt=999;return s;}
function place(s,x){Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0,dir:1,aimX:1,aimY:0});s.camera={x:x-260,y:40,backdropY:40,zoom:1};}
test('Volt III doubles normal reach, extends strong reach and branches to every connected nearby troop once',()=>{
 const s=scene(),o={x:9000,y:400},dir={x:1,y:0};equipDrink(s,9);expect(beamPath(s,o,dir,false).segments[0].to.x).toBe(9315);
 s.modLevels['starter-9']=3;expect(beamPath(s,o,dir,false).segments[0].to.x).toBe(9650);expect(beamPath(s,o,dir,true).segments[0].to.x).toBe(10150);
 s.platforms=[{x:0,y:600,w:24000,h:100}];s.enemies=[[9450,440],[9560,360],[9560,540],[9680,400],[9720,520],[9780,350],[9840,450]].map(([x,y],i)=>makeEnemy(x,y,25,i));
 const path=beamPath(s,o,dir,false);expect(path.hits).toHaveLength(7);expect(new Set(path.hits.map(q=>q.target)).size).toBe(7);expect(Math.min(...path.hits.map(q=>q.damageScale))).toBeGreaterThanOrEqual(.65);
});
test('Volt III obeys solid occlusion and cannot reach a disconnected or distant crowd',()=>{
 const s=scene();s.modLevels['starter-9']=3;s.enemies=[makeEnemy(9200,480,25),makeEnemy(9360,480,25),makeEnemy(10000,480,25)];
 s.platforms.push({x:9280,y:250,w:30,h:300});const path=beamPath(s,{x:9000,y:400},{x:1,y:0},false);expect(path.hits).toHaveLength(1);
});
for(const type of [0,1,3,10,11,18,21,25])test(`electric impact and charred defeat retain troop identity ${type}`,()=>{
 const s=scene(),e=makeEnemy(9230,s.player.y,type);e.timer=99;e.hp=60;s.enemies=[e];equipDrink(s,9);s.modLevels['starter-9']=3;
 tick(s,.6,{attack:true});expect(e.hp).toBeLessThan(60);expect(e.elementHit?.element).toBe('electric');expect(e.type).toBe(type);
 e.hp=.05;tick(s,.3,{attack:true});expect(e.charred).toBe(true);expect(e.deadTime).toBeGreaterThan(1);expect(e.hp).toBe(0);
});
test('channel audio stops on release, defeat and candy; Popcorn strong has its own registered recoil',()=>{
 const s=scene();equipDrink(s,9);tick(s,.2,{attack:true});expect(hexyChannelProfile(s)?.kind).toBe('electric');tick(s,.02);expect(hexyChannelProfile(s)).toBeNull();
 equipDrink(s,13);tick(s,1/120,{special:true});expect(hexyPose(s).sheet).toBe('popcorn-recoil');const m=hexyMuzzle(s);expect(Math.hypot(s.shots[0].previousX-m.x,s.shots[0].previousY-m.y)).toBeLessThan(2);tick(s,.7);expect(hexyPose(s).sheet).not.toBe('popcorn-recoil');
 s.voltBeam={segments:[{}]};s.player.candy={};expect(hexyChannelProfile(s)).toBeNull();delete s.player.candy;s.playerDefeat={};expect(hexyChannelProfile(s)).toBeNull();
});
function fight(){const s=scene(),original=createAdventure(7).enemies.find(e=>e.type===28);s.enemies=[original];place(s,original.x-400);return{s,e:original};}
test('the village miniboss announces arrival, fires candy magic and calls a broom at half health',()=>{
 const {s,e}=fight();tick(s,.1);expect(e.phase).toBe('intro');expect(s.arenaLocked).toBe(true);expect(s.village.complete).toBe(false);
 let fired=false;for(let i=0;i<840;i++){stepAdventure(s,{},1/120);fired||=s.hostile.some(q=>q.owner===witchId(e));}expect(fired).toBe(true);
 e.hp=e.maxHp*.49;tick(s,.03);expect(e.harvestStage).toBe(2);expect(e.phase).toBe('broom-call');
});
test('the Harvester keeps absorbing candy Hexy when hit without defeat',()=>{
 const {s,e}=fight();tick(s,2);beginCandyCapture(s,{kind:'candy-ray'});tick(s,2);expect(s.player.candy.absorber).toBe( witchId(e));expect(s.player.candy.tether.x).toBeGreaterThan(s.player.candy.from.x);
 const progress=s.player.candy.absorbProgress;e.flash=.2;tick(s,.02);expect(s.player.candy.absorber).toBe(witchId(e));expect(s.player.candy.absorbProgress).toBeGreaterThan(progress);expect(s.player.candy.terminal).toBeFalsy();
});
test('defeating the Harvester rescues victims and waits for the defeat animation before unlocking completion',()=>{
 const {s,e}=fight();tick(s,2);const n={...s.level.villagers[0],state:'absorbed',age:0,curseAge:5,curseOwner:witchId(e),x:e.x-80,y:e.y};s.villagers=[n];
 e.hp=.1;s.shots.push({kind:9,chainTarget:e,voltProbe:true,x:e.x,y:e.y-60,r:12,damage:1,vx:0,vy:0,life:.1,age:0,heavy:true,hidden:true,hits:[]});tick(s,.02);
 expect(e.hp).toBe(0);expect(e.deadTime).toBeGreaterThan(2);expect(n.state).toBe('rescue');expect(s.arenaLocked).toBe(false);place(s,s.level.arena.entry+30);tick(s,.1);expect(s.village.complete).toBe(false);tick(s,2.7);expect(s.village.complete).toBe(true);
});
test('retry reconstructs a living Harvester, its full health, intro and locked exit',()=>{
 const {s,e}=fight();tick(s,3);e.hp=30;retryAdventure(s);const fresh=s.enemies.find(q=>q.type===28);expect(fresh.hp).toBe(fresh.maxHp);expect(fresh.phase).toBe('sleep');expect(s.village.complete).toBe(false);
});
