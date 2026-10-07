import {test,expect} from '@playwright/test';
import {createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateBoss,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {balloonCrewDrawing,balloonSeats,balloonVolleySockets,CREW_SIZE} from '../src/components/arcade/adventure/actors/bosses/adventureBalloonCrew';
import {enemyGeometry} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
const dt=1/120,body=()=>({x:0,y:0,w:0,h:0}),helpers={body,say:()=>{},particles:()=>{}};
function arena(){const s=createAdventure(0),a=s.level.arena;s.enemies=[];s.hostile=[];s.player.x=a.left+200;s.player.y=a.y;s.damage=()=>{};Object.assign(s.boss,{x:a.left+700,y:a.y-75,phase:'warn',move:'drop',timer:1.05,dir:-1});return s;}

test('both facing directions release the visible held ball without changing its size',()=>{
 for(const dir of [-1,1])for(const move of ['balls','bombs','swoop']){
  const s=arena(),b=s.boss;s.player.x=b.x+dir*300;Object.assign(b,{phase:'attack',move,timer:2,dir,crewDir:dir,shotClock:.003,attackClock:1.398,originX:b.x,originY:b.y,targetX:b.x});
  const before=balloonCrewDrawing(s);expect(before.every(q=>q.frame===3&&q.held)).toBe(true);
  before.forEach((q,i)=>{const port=balloonVolleySockets(s)[i];expect(q.held.x).toBe(port.x);expect(q.held.y).toBe(port.y);});
  updateBoss(s,dt,helpers);expect(s.hostile).toHaveLength(3);
  const after=balloonCrewDrawing(s);expect(after.every(q=>q.frame===3&&!q.held)).toBe(true);
  after.forEach((q,i)=>{const port=balloonVolleySockets(s)[i],shot=s.hostile[i];expect(shot.x).toBe(port.x);expect(shot.y).toBe(port.y);expect(shot.drawSize).toBe(before[i].held.size);expect(Math.sign(port.x-q.x)).toBe(dir);});
 }
});

test('a balloon clown leaves its own seat and completes ascent, descent and landing before walking',()=>{
 const s=arena(),b=s.boss;
 expect(balloonCrewDrawing(s)[1]).toMatchObject({key:'red-clown-air',frame:0,size:CREW_SIZE});
 for(let i=0;i<200&&!s.enemies.length;i++)updateBoss(s,dt,helpers);
 expect(s.enemies).toHaveLength(1);const e=s.enemies[0],seat=balloonSeats(s)[1];
 expect(e.x).toBe(seat.x);expect(e.y).toBe(seat.y);expect(enemyGeometry(e).size).toBe(seat.size);expect(balloonCrewDrawing(s)).toHaveLength(2);
 const poses=new Set();let impactX=null,sawWalk=false;
 for(let i=0;i<430;i++){
  const drawing=enemyDrawing(e);if(drawing.key==='red-clown-air')poses.add(drawing.frame);
  if(e.landing>0){impactX??=e.x;expect(e.x).toBe(impactX);expect(e.y).toBe(e.baseY);expect(s.hostile).toHaveLength(0);}
  if(drawing.key==='red-clown-walk'&&e.x!==impactX)sawWalk=true;
  updateEnemies(s,dt,body,()=>{});
 }
 expect([...poses].sort()).toEqual([1,2,3,4,5,6,7]);expect(sawWalk).toBe(true);expect(e.type).toBe(0);expect(e.balloonCrew).toBe(true);
});

test('red clowns use eight travelled walk poses and preserve visible attacks, hurt and defeat',()=>{
 const s=arena(),e=makeEnemy(s.level.arena.left+500,s.level.arena.y);e.timer=8;s.enemies=[e];s.player.x=e.x-500;
 const poses=new Set();for(let i=0;i<200;i++){updateEnemies(s,dt,body,()=>{});const d=enemyDrawing(e);expect(d.key).toBe('red-clown-walk');poses.add(d.frame);}
 expect([...poses].sort()).toEqual([0,1,2,3,4,5,6,7]);
 e.trap=2;const x=e.x,gait=e.gait;for(let i=0;i<60;i++)updateEnemies(s,dt,body,()=>{});expect(e.x).toBe(x);expect(e.gait).toBe(gait);expect(enemyDrawing(e)).toEqual({key:'red-clown-throw',frame:6});
 e.trap=0;e.timer=.4;e.phase='windup';expect(enemyDrawing(e)).toEqual({key:'clown',frame:6});e.timer=.1;expect(enemyDrawing(e).frame).toBe(7);
 e.action=.3;expect(enemyDrawing(e)).toEqual({key:'clown',frame:8});e.action=0;e.recovery=.3;expect(enemyDrawing(e).frame).toBe(9);e.flash=.1;expect(enemyDrawing(e).frame).toBe(10);e.hp=0;expect(enemyDrawing(e).frame).toBe(11);
});

test('the throw has separate windup, release, follow-through and recovery poses',()=>{
 const s=arena(),b=s.boss;b.move='balls';const seen=new Set();let released=false;
 for(let i=0;i<210;i++){
  const crew=balloonCrewDrawing(s);crew.forEach(q=>{expect(q.key).toBe('red-clown-throw');seen.add(q.frame);});
  if(b.release>0){released=true;expect(crew.every(q=>!q.held)).toBe(true);}
  updateBoss(s,dt,helpers);
 }
 expect(released).toBe(true);for(const frame of [0,1,2,3,4,5,6])expect(seen.has(frame)).toBe(true);
});
