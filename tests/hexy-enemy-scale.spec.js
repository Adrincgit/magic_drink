import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventureModel';
import {makeEnemy} from '../src/components/arcade/adventureEnemies';
import {enemyBody} from '../src/components/arcade/adventureEnemyGeometry';
const tick=(s,input={},n=1)=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const clean=()=>{const s=createAdventure();s.enemies=[];s.pickups=[];s.cages=[];s.stars=[];s.hazards=[];return s;};

test('shots hit enlarged enemy heads instead of passing through the visible upper body',()=>{
 for(const type of [0,1,2,3,4,5]){
  const s=clean(),e=makeEnemy(260,480,type);e.timer=100;s.enemies=[e];
  s.shots=[{x:e.x,y:e.y-80,vx:0,vy:0,r:6,life:1,age:0,kind:-1,damage:2,hits:[]}];
  tick(s);expect(e.hp).toBe(e.maxHp-2);expect(e.flash).toBeGreaterThan(0);
 }
});

test('landing on the enlarged clown head bounces Hexy; touching its side still hurts',()=>{
 const s=clean(),e=makeEnemy(260,480,0);e.timer=100;s.enemies=[e];
 Object.assign(s.player,{x:260,y:enemyBody(e).y-1,vy:240,ground:null});tick(s);
 expect(e.hp).toBe(0);expect(s.player.vy).toBe(-390);expect(s.hearts).toBe(5);
 const side=clean(),clown=makeEnemy(260,480,0);clown.timer=100;side.enemies=[clown];
 Object.assign(side.player,{x:260,y:450,vy:0,ground:null});tick(side);expect(side.hearts).toBe(4);
});

test('crouching dodges a tall clown mouth shot while standing takes the hit',()=>{
 for(const crouch of [true,false]){
  const s=clean(),e=makeEnemy(215,480,0);e.timer=0;s.enemies=[e];
  tick(s,{down:crouch},85);expect(s.hearts).toBe(crouch?5:4);
 }
});
