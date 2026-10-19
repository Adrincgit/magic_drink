import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {actTwoBossDrawing,damageActTwoBoss} from '../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses';
import {startNightmareGame,nightmareGameWarnings} from '../src/components/arcade/adventure/actors/bosses/nightmareGames';
import {HARLEQUIN_HEALTH} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
const tick=(s,time,input={})=>{for(let i=0;i<Math.round(time*120);i++)stepAdventure(s,input,1/120);};
function battle(stage=3){
 const s=createAdventure(10),b=s.boss,a=s.level.arena;s.enemies=[];s.supplies=[];s.player.x=a.left+650;s.player.y=a.y;s.player.hurt=999;tick(s,2.1);
 Object.assign(b,{stage,hp:b.maxHp*(4-stage)/3,phase:'patrol',timer:0,turn:0,nightmareCooldown:999,encoreAid:true});return s;
}
test('the three protected phases have distinct drawings and outlast the fire harlequin',()=>{
 const s=battle(1),b=s.boss;expect(b.maxHp).toBeGreaterThan(HARLEQUIN_HEALTH.normal);const drawings=[];
 for(let stage=1;stage<=3;stage++){
  b.phase='recover';b.stage=stage;b.vulnerable=true;drawings.push(actTwoBossDrawing(s).key);damageActTwoBoss(s,9999);
  expect(b.hp).toBe(stage===3?1:b.maxHp*(3-stage)/3);
  if(stage<3){tick(s,.1);expect(b.phase).toBe('transform');expect(b.stage).toBe(stage+1);expect(b.vulnerable).toBe(false);tick(s,2.1);}
 }
 expect(new Set(drawings).size).toBe(3);
});
test('each later phase cycles its own games and leaves punishable recovery windows',()=>{
 for(const stage of [2,3]){
  const s=battle(stage),b=s.boss,moves=new Set(),recovery=new Set();b.staffCooldown=999;
  for(let i=0;i<120*65;i++){
   stepAdventure(s,{},1/120);moves.add(b.move);if(b.phase==='recover'&&b.vulnerable)recovery.add(b.move);
   expect(Number.isFinite(b.x+b.y+b.timer+s.player.x)).toBe(true);expect(b.x).toBeGreaterThanOrEqual(s.level.arena.left+100);expect(b.x).toBeLessThanOrEqual(s.level.arena.right-100);
  }
  for(const move of stage===2?['spiral-volley','moon-hop','wind-blink','staff-vault','wind-tug','prism-mirage','staff-chain']:['spiral-volley','double-pounce','nightmare-rain','wind-blink','wind-shear','staff-chain','wind-push','wind-tug','prism-mirage','staff-vault']){expect(moves.has(move),move+JSON.stringify({moves:[...moves],history:b.attackHistory,turn:b.turn,phase:b.phase,game:b.game})).toBe(true);expect(recovery.has(move),move+' recovery').toBe(true);}
  expect(s.enemies.filter(e=>e.summoned&&e.hp>0)).toEqual([]);expect(s.dreamMirrors).toEqual([]);
 }
});
test('both pounces warn independently and lock their landing before the leap',()=>{
 const s=battle(),b=s.boss;startNightmareGame(s,'double-pounce');const first=b.targetX;
 expect(nightmareGameWarnings(s)[0].x).toBe(first);expect(b.timer).toBeGreaterThanOrEqual(1);tick(s,.6,{right:true});expect(b.targetX).toBe(first);expect(b.phase).toBe('game-windup');
 for(let i=0;i<240&&b.game?.step!==1;i++)stepAdventure(s,{},1/120);
 expect(b.game.step).toBe(1);expect(b.phase).toBe('game-windup');expect(b.timer).toBeGreaterThan(.8);const second=b.targetX;
 tick(s,.5,{left:true});expect(b.targetX).toBe(second);expect(b.phase).toBe('game-windup');tick(s,1.5);expect(b.phase).toBe('recover');expect(b.vulnerable).toBe(true);
});
test('nightmare rain leaves a real safe column and never fires during anticipation',()=>{
 const s=battle(),b=s.boss,a=s.level.arena;s.player.hurt=0;startNightmareGame(s,'nightmare-rain');
 const warnings=nightmareGameWarnings(s),safe=warnings.find(q=>q.safe);expect(warnings).toHaveLength(7);expect(warnings.filter(q=>q.safe)).toHaveLength(1);s.player.x=safe.x;
 tick(s,1.15);expect(s.hostile).toHaveLength(0);expect(b.phase).toBe('game-windup');const hearts=s.hearts,seen=new Set();
 for(let i=0;i<240;i++){stepAdventure(s,{},1/120);for(const q of s.hostile)if(q.kind==='nightmare-gust')seen.add(q.x);}
 expect(seen.size).toBe(6);for(const x of seen)expect(Math.abs(x-safe.x)).toBeGreaterThan(safe.w/2);expect(s.hearts).toBe(hearts);
});
test('entering the candy collection recalls the village and retry restores the mystery',()=>{
 const s=createAdventure(10);s.player.hurt=999;expect(s.level.candyWarehouse.right).toBeLessThan(s.level.arena.entry);
 s.player.x=1250;tick(s,.1);expect(s.episodeTwo.caption[0]).toContain('Villa Lumbre');s.player.x=1900;tick(s,.1);expect(s.episodeTwo.caption[0]).toContain('liberarlos');
 s.episodeTwo.released=true;retryAdventure(s);expect(s.episodeTwo.released).toBe(false);expect(s.episodeTwo.seen.size).toBe(0);expect(s.boss.stage).toBe(1);
});
test('the ascent camera keeps Hexy and the candy landing visible while running and jumping',()=>{
 const s=createAdventure(10);s.player.hurt=999;
 for(let i=0;i<120*11;i++){
  stepAdventure(s,{right:true,jump:i%200<70},1/120);const z=s.camera.zoom||1;
  expect((s.player.y-105-s.camera.y)*z).toBeGreaterThan(10);expect((s.player.y-s.camera.y)*z).toBeLessThan(510);
 }
 expect(s.player.x).toBeGreaterThan(s.level.arena.entry);expect(s.boss.engaged).toBe(true);
});
test('hits preserve readable spell anticipation and casting; stopped patrol uses idle gestures',()=>{
 const s=battle(),b=s.boss;startNightmareGame(s,'spiral-volley');b.flash=.2;expect(actTwoBossDrawing(s).key).toBe('nightmare-phase-3-cast');
 b.phase='game-attack';expect(actTwoBossDrawing(s).key).toBe('nightmare-phase-3-cast');
 b.phase='patrol';b.walking=false;b.flash=0;expect(actTwoBossDrawing(s).key).toBe('nightmare-phase-3-idle');b.walking=true;expect(actTwoBossDrawing(s).key).toBe('nightmare-phase-three-walk');
});

test('the illusion reappears at its warned destination before firing and never creates another combatant',()=>{
 const s=battle(2),b=s.boss;startNightmareGame(s,'wind-blink');const from=b.x,target=b.targetX;
 expect(nightmareGameWarnings(s)[0].x).toBe(target);tick(s,.85,{left:true});expect(b.x).toBe(from);expect(s.hostile).toHaveLength(0);
 tick(s,.45);expect(b.x).toBe(target);expect(s.hostile).toHaveLength(0);expect(b.vulnerable).toBe(true);
 tick(s,.6);expect(s.hostile.some(q=>q.kind==='nightmare-gust')).toBe(true);expect(s.enemies).toEqual([]);expect(s.dreamMirrors).toEqual([]);
});
