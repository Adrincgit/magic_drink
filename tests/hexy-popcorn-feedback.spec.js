import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {equipDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {firePopcorn,popcornBlastDuration} from '../src/components/arcade/adventure/engine/adventurePopcorn';
import {hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {drawPopcornScreenFlash} from '../src/components/arcade/adventure/render/popcornCanvas';
function scene(){const s=createAdventure(7),x=9000;s.enemies=[];s.villagers=[];s.carriages=[];s.supplies=[];s.cages=[];s.outposts=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.village.furthest=20000;Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0,dir:1,hurt:999});equipDrink(s,13);return s;}
for(const strong of [false,true])for(const [name,aim]of [['horizontal',{x:1,y:0}],['down',{x:0,y:1}],['up',{x:0,y:-1}],['diagonal',{x:Math.SQRT1_2,y:Math.SQRT1_2}]])test(`Popcorn ${strong?'charged':'normal'} ${name}: falling body returns after its burst expires`,()=>{
 const s=scene(),p=s.player;p.ground=null;p.y-=160;p.vy=500;p.jumps=1;p.aimX=aim.x;p.aimY=aim.y;const castY=p.y;
 firePopcorn(s,hexyMuzzle(s),aim,1,strong);const blast=s.effects.find(e=>e.popcornBlast);expect(p.vy).toBeLessThan(0);expect(p.jumps).toBe(1);
 let age=0;while(age<popcornBlastDuration(strong)+.025){stepAdventure(s,{},1/120);age+=1/120;expect(p.y).toBeLessThan(castY);}
 expect(blast.life).toBeLessThanOrEqual(0);expect(p.jumps).toBe(1);
});
test('releasing jump does not cancel the safety impulse; an ascending jump is preserved',()=>{
 const s=scene(),p=s.player;p.ground=null;p.y-=100;p.vy=-600;p.jumps=1;s.lastInput={jump:true};firePopcorn(s,hexyMuzzle(s),{x:0,y:1},1,true);expect(p.vy).toBe(-600);stepAdventure(s,{},1/120);expect(p.vy).toBeLessThan(-550);expect(p.jumps).toBe(1);
});
test('flash lasts 120/170ms in real effect time, honors reduced effects, and retry clears it',()=>{
 for(const strong of [false,true]){const s=scene(),p=s.player;firePopcorn(s,hexyMuzzle(s),{x:1,y:0},1,strong);expect(p.ground).not.toBeNull();expect(p.vy).toBe(0);
  const paints=[],ctx={globalAlpha:1,save(){},restore(){},fillRect(){paints.push(this.globalAlpha);}};drawPopcornScreenFlash(ctx,s,false);expect(paints[0]).toBeGreaterThan(.1);
  drawPopcornScreenFlash(ctx,s,true);expect(paints).toHaveLength(1);s.hitStop=.3;for(let i=0;i<24;i++)stepAdventure(s,{},1/120);drawPopcornScreenFlash(ctx,s,false);expect(paints).toHaveLength(1);expect(s.popcornFlash).toBeNull();
  firePopcorn(s,hexyMuzzle(s),{x:1,y:0},1,strong);retryAdventure(s);expect(s.popcornFlash).toBeNull();
 }
});
