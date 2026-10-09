import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {harlequinDrawing,harlequinBody} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
import {HARLEQUIN_DEFEAT} from '../src/components/arcade/adventure/actors/bosses/harlequinDefeat';
import {beginHarlequinUltimate} from '../src/components/arcade/adventure/actors/bosses/harlequinUltimate';
import {openAdventureMenu} from './arcade-input.helpers';
const folder='tests/artifacts/arcade/finale';fs.mkdirSync(folder,{recursive:true});
function battle(air=false){
 const s=createAdventure(3);s.supplies=[];s.stars=[];s.arenaLocked=true;s.noticeTime=0;
 Object.assign(s.player,{x:1600,y:480,ground:2,hurt:30});
 Object.assign(s.boss,{x:2200,y:air?280:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:240,debrisClock:100});return s;
}
function tick(s,input={}){stepAdventure(s,input,1/120);}
function lastHit(s){const body=harlequinBody(s);s.boss.hp=2;s.shots=[{x:body.x+body.w/2,y:body.y+body.h/2,vx:0,vy:0,damage:2,age:0,life:1,kind:-1,hits:[]}];tick(s);expect(s.boss.hp).toBe(0);}

for(const air of [false,true])test(`ordinary final hit ${air?'in the air':'on the floor'} falls before victory and only awards once`,()=>{
 const s=battle(air);s.hearts=2;lastHit(s);const events=[...s.events],frames=new Set();
 expect(s.arenaLocked).toBe(true);expect(s.score).toBe(0);expect(s.hearts).toBe(2);expect(s.events).not.toContain('bossDown');
 for(let i=0;i<590;i++){
  tick(s,{right:true,attack:true});events.push(...s.events);frames.add(harlequinDrawing(s).frame);
  if(s.boss.defeat?.age< HARLEQUIN_DEFEAT.land)expect(s.boss.defeat.landed).toBe(false);
  if(s.boss.defeat?.age< HARLEQUIN_DEFEAT.finish){expect(s.clear).toBeUndefined();expect(s.score).toBe(0);}
 }
 expect([...frames]).toEqual(expect.arrayContaining([12,13,14,15,16]));expect(s.boss.y).toBe(480);expect(s.boss.x).toBeGreaterThan(2200);
 expect(events.filter(x=>x==='harlequinDefeatLand')).toHaveLength(1);expect(events.filter(x=>x==='harlequinVanish')).toHaveLength(1);expect(events.filter(x=>x==='win')).toHaveLength(1);expect(events).not.toContain('bossDown');
 expect(s.clear).toBeTruthy();expect(s.score).toBe(60);expect(s.hearts).toBe(4);
 for(let i=0;i<100;i++)tick(s);expect(s.score).toBe(60);retryAdventure(s);expect(s.boss.defeat).toBeUndefined();expect(s.boss.smokeTime).toBeUndefined();expect(s.boss.hp).toBe(720);
});

function clash(hp=240){
 const s=battle();s.boss.hp=hp;beginHarlequinUltimate(s);
 while(s.boss.ultimate.state==='leap')tick(s);tick(s,{super:true});
 while(s.powerClash.state!=='contest')tick(s);
 let n=0;while(s.powerClash.state==='contest'&&n<2500){tick(s,{attack:n++%10===0});}
 expect(s.powerClash.won).toBe(true);return s;
}
test('a lethal clash stays prone for the final extinction; no second flight or resurrection',()=>{
 const s=clash(180);while(s.powerClash)tick(s);
 expect(s.boss.hp).toBe(0);expect(harlequinDrawing(s).frame).toBe(16);tick(s);
 expect(s.boss.defeat.landed).toBe(true);expect(s.boss.defeat.age).toBeGreaterThanOrEqual(HARLEQUIN_DEFEAT.land);
 const events=[];for(let i=0;i<410;i++){tick(s);events.push(...s.events);expect(harlequinDrawing(s).frame).toBe(16);}
 expect(events).not.toContain('harlequinDefeatLand');expect(events.filter(x=>x==='win')).toHaveLength(1);expect(s.score).toBe(60);
});
test('a clash survivor is visibly scorched and keeps shedding rising soot after getting up',()=>{
 const s=clash();while(s.powerClash)tick(s);
 expect(s.boss.hp).toBe(48);expect(s.boss.scorched).toBeGreaterThanOrEqual(.28);expect(s.boss.smokeTime).toBeGreaterThan(4);
 expect(s.boss.exhausted).toBeGreaterThan(2.9);const x=s.boss.x;
 for(let i=0;i<90;i++)tick(s);const smoke=s.effects.filter(q=>q.soot);
 expect(smoke.length).toBeGreaterThan(6);expect(smoke.every(q=>q.vy<0)).toBe(true);expect(s.boss.x).toBe(x);
 s.boss.timer=100;for(let i=0;i<1400;i++)tick(s);expect(s.boss.smokeTime).toBe(0);expect(s.effects.some(q=>q.soot)).toBe(false);expect(s.boss.scorched).toBeGreaterThan(0);
 retryAdventure(s);expect(s.boss.scorched).toBeUndefined();expect(s.boss.smokeTime).toBeUndefined();
});

test('the real game keeps battle music through the final fall, then switches to victory',async({page})=>{
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{
  const response=await route.fetch(),source=await response.text(),target='bindCarriedBunnies(s);';
  const inject="if(index===3){s.player.x=2100;s.player.y=480;s.player.ground=2;s.arenaLocked=true;s.stars=[];s.supplies=[];Object.assign(s.boss,{x:2290,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:2,debrisClock:100});}";
  await route.fulfill({response,body:source.replace(target,inject+target)});
 });
 await page.goto('/arcade');await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir cap/}).click();await page.locator('[data-level-choice="3"]').click();await page.locator('[data-practice]').click();
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.keyboard.press('KeyZ');
 const canvas=page.locator('[data-adventure-canvas]'),music=page.locator('audio[data-music-track]');
 await expect(canvas).toHaveAttribute('data-boss-phase','dying');await expect(music).toHaveAttribute('data-music-track','arlequin_fuego');
 await page.waitForTimeout(2000);await expect(music).toHaveAttribute('data-music-track','arlequin_fuego');await page.locator('[data-game-screen]').screenshot({path:`${folder}/real-fall.jpg`});
 await expect(music).toHaveAttribute('data-music-track','victory',{timeout:7000});
});
