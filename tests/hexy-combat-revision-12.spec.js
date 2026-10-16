import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {equipDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {firePopcorn} from '../src/components/arcade/adventure/engine/adventurePopcorn';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {makeEnemy,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {beginCandyCapture,stepCandyCapture,stepWitchAbsorption} from '../src/components/arcade/adventure/engine/villageRescue';
import {hitVillageObstacles} from '../src/components/arcade/adventure/engine/villageObstacles';
import {hitVillageRubble} from '../src/components/arcade/adventure/engine/villageResistance';
import {resolveVillageProjectile} from '../src/components/arcade/adventure/engine/adventureVillage';
import {villageChannelProfile} from '../src/components/arcade/shared/audio/worldCombatSound';
import {worldSound} from '../src/components/arcade/adventure/engine/adventureWorldAudio';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const kinds=s=>s.events.map(q=>typeof q==='string'?q:q.kind);
function scene(kind=13){
 const s=createAdventure(7);s.enemies=[];s.villagers=[];s.carriages=[];s.supplies=[];s.cages=[];s.outposts=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.village.furthest=20000;
 const x=9000;Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0,dir:1,hurt:0});s.camera={x:x-260,y:40,backdropY:40,zoom:1};equipDrink(s,kind);return s;
}
for(const dir of [-1,1])test(`charged Popcorn recoils opposite aim ${dir}, without a ground hop`,()=>{
 const s=scene(),p=s.player,x=p.x,y=p.y;p.dir=dir;tick(s,1,{special:true});expect(hexyPose(s).sheet).toBe('popcorn-recoil');tick(s,26);
 expect((p.x-x)*dir).toBeCloseTo(-15,0);expect(Math.abs(p.y-y)).toBeLessThan(3);expect(p.ground).not.toBeNull();expect(p.popcornKick).toBeUndefined();
});
test('airborne charged Popcorn clears its burst without restoring jumps and uses recoil cels',()=>{
 const s=scene(),p=s.player;p.y-=160;p.ground=null;p.vy=420;p.jumps=1;const y=p.y,x=p.x;tick(s,1,{special:true});
 expect(p.vy).toBeLessThan(0);expect(p.jumps).toBe(1);expect(hexyPose(s).sheet).toBe('popcorn-air');const m=hexyMuzzle(s);expect(Math.hypot(s.shots[0].previousX-(m.x+x-p.x),s.shots[0].previousY-(m.y+y-p.y))).toBeLessThan(2);
 tick(s,10);expect(p.y).toBeLessThan(y-6);expect(hexyPose(s).frame).toBeGreaterThan(0);
 p.vy=180;firePopcorn(s,hexyMuzzle(s),{x:1,y:0},1,true);expect(p.vy).toBeLessThan(-350);expect(p.jumps).toBe(1);
 tick(s,120);expect(p.ground).not.toBeNull();expect(p.popcornClearUntil).toBe(0);
});
test('normal Popcorn does not move Hexy; recoil remains constrained by solid village obstacles',()=>{
 const s=scene(),x=s.player.x;tick(s,26,{attack:true});expect(s.player.x).toBeCloseTo(x,2);
 const r={id:'test-wall',kind:'beam',x:x-100,w:100,h:120,y:s.player.y,hp:30};s.villageObstacles=[r];s.platforms.push({x:r.x-50,y:r.y-r.h,w:100,h:120,dx:0,dy:0,villageObstacle:r.id});
 s.player.x=r.x+50+14+5;s.shotWait=0;s.player.specialWait=0;s.player.specialCast=0;tick(s,1,{special:true});tick(s,30);expect(s.player.x).toBeGreaterThanOrEqual(r.x+50+14);
 retryAdventure(s);expect(s.player.popcornKick).toBeUndefined();expect(s.player.popcornAirLift).toBeFalsy();
});
test('Volt painted cels are selected on ground, in air and crouching, and beam remains registered to the star',()=>{
 const s=scene(9);tick(s,20,{attack:true});expect(hexyPose(s).sheet).toBe('volt-cast');expect(hexyPose(s).frame).toBeLessThan(4);
 const p=s.player;p.ground=null;p.y-=130;tick(s,1,{attack:true});expect(hexyPose(s).frame).toBeGreaterThanOrEqual(4);expect(hexyPose(s).frame).toBeLessThan(8);
 const m=hexyMuzzle(s);expect(Math.hypot(s.voltBeam.segments[0].from.x-m.x,s.voltBeam.segments[0].from.y-m.y)).toBeLessThan(.1);
 tick(s,1);expect(hexyPose(s).sheet).not.toBe('volt-cast');
 const crouch=scene(9);tick(crouch,2,{attack:true,down:true});expect(hexyPose(crouch).sheet).toBe('volt-cast');expect(hexyPose(crouch).frame).toBeGreaterThanOrEqual(12);
});
test('enemy ray and pumpkin fan emit spatial launch sounds once per launch',()=>{
 const s=scene(),x=s.player.x+200,y=s.player.y-60;s.events=[];
 for(let i=0;i<3;i++)enemyShot(s,x,y,.1*i,300,'lantern-soul',{village:true});expect(kinds(s)).toEqual(['soulCast']);expect(s.events[0].pan).toBeGreaterThan(0);
 enemyShot(s,x,y,0,400,'candy-ray',{village:true});expect(kinds(s)).toContain('witchRay');worldSound(s,'witchRay',s.player.x+2000,y);expect(s.events).toHaveLength(2);
});
test('Hexy and civilian transformations, absorption and release have dedicated events',()=>{
 const s=scene(),p=s.player;beginCandyCapture(s,{kind:'candy-ray'});expect(kinds(s)).toContain('candyTransform');s.events=[];beginCandyCapture(s,{kind:'candy-ray'});expect(s.events).toHaveLength(0);
 p.candy.age=30;stepCandyCapture(s,{},.01);expect(kinds(s)).toContain('candyRelease');
 const e=makeEnemy(p.x+150,p.y,26,0);Object.assign(e,{active:true,phase:'patrol',timer:0});s.enemies=[e];s.villagers=[{id:'victim',x:p.x+80,y:p.y,state:'candy'}];
 expect(stepWitchAbsorption(s,e,.01)).toBe(true);expect(kinds(s)).toContain('witchAbsorb');expect(villageChannelProfile(s)).not.toBeNull();e.phase='recover';expect(villageChannelProfile(s)).toBeNull();
 const npc={id:'civilian',style:0,x:p.x+250,y:p.y,state:'flee'};s.villagers=[npc];const ray={kind:'candy-ray',village:true,life:1,owner:'test',x:npc.x+30,previousX:npc.x-40,y:p.y-45,previousY:p.y-45,r:10};
 resolveVillageProjectile(s,ray,{x:p.x-10,y:p.y-90,w:20,h:90});expect(npc.state).toBe('turning');expect(kinds(s)).toContain('magicImpact');expect(kinds(s)).toContain('candyTransform');
 s.playerDefeat={};expect(villageChannelProfile(s)).toBeNull();
});
test('wooden cart destruction and freeing rubble trigger their material sound once',()=>{
 const s=scene(),p=s.player,r={id:'wagon-test',kind:'wagon',x:p.x+150,y:p.y,h:120,w:170,hp:2};s.villageObstacles=[r];s.platforms.push({x:r.x-r.w/2,y:r.y-r.h,w:r.w,h:r.h,villageObstacle:r.id});
 const shot={x:r.x,y:r.y-50,previousX:r.x-100,previousY:r.y-50,damage:3,life:1,heavy:true};hitVillageObstacles(s,shot);expect(r.broken).toBe(true);expect(kinds(s)).toContain('wagonBreak');s.events=[];hitVillageObstacles(s,shot);expect(s.events).toHaveLength(0);
 const n={id:'trapped-test',x:p.x,y:p.y,state:'trapped'};s.villagers=[n];s.villageRubble=[{id:'rubble-test',x:p.x,y:p.y,hp:1,villager:n.id}];hitVillageRubble(s,{x:p.x,y:p.y-20,damage:2,life:1,heavy:true},10);expect(n.state).toBe('recover');expect(kinds(s)).toContain('rubbleBreak');
});
