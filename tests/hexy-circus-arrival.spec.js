import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,retryAdventure,adventureCarry} from '../src/components/arcade/adventure/engine/adventureModel';
import {stepFortJourney} from '../src/components/arcade/adventure/engine/adventureFortJourney';
import {nextAdventureChapter} from '../src/components/arcade/shared/adventureProgression';
import {canEnterShop,shopForLevel} from '../src/components/arcade/adventure/engine/adventureShop';
import {adventureMusic} from '../src/components/arcade/adventure/world/adventureWorlds';
import {openAdventureMenu} from './arcade-input.helpers';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};

test('waterfront victory leads to the land chapter and never places a tent on the wharf',()=>{
 const s=createAdventure(2),a=s.level.arena;
 Object.assign(s.player,{x:a.left+50,y:a.y,ground:s.platforms.findIndex(p=>p.x===a.left)});
 Object.assign(s.boss,{hp:0,phase:'defeated',engaged:true,shattered:true,defeat:{age:4,ready:true}});
 s.camera={x:a.left,y:80,zoom:.7,backdropY:110};
 for(let i=0;i<2400&&!s.done;i++)tick(s,1);
 expect(s.won).toBe(true);expect(s.level.circusArrival).toBeUndefined();
 const next=createAdventure(nextAdventureChapter(s.index),false,adventureCarry(s));expect(next.index).toBe(5);expect(next.level.emberTrail).toBe(true);expect(next.hearts).toBe(s.hearts);
});

test('the land doorway waits for the fort, then fades into backstage before 1-5',()=>{
 const s=createAdventure(5);s.player.x=s.level.fortDoor.x;s.player.y=300;
 expect(stepFortJourney(s,1/120)).toBe(false);expect(s.fortInside).toBeFalsy();
 s.boss.hp=0;s.boss.defeat={age:3,ready:true};s.boss.engaged=true;
 for(let i=0;i<80;i++)stepFortJourney(s,1/120);
 expect(s.fortInside).toBe(true);expect(s.fortFade).toBeGreaterThan(.9);expect(s.player.x).toBe(s.level.fortDoor.insideX);expect(s.boss.phase).not.toBe('intro');
 for(let i=0;i<90;i++)stepFortJourney(s,1/120);expect(s.fortFade).toBe(0);
 s.player.x=s.level.exit[0];stepFortJourney(s,1/120);expect(s.fortExit).toBeFalsy();
 s.enemies=s.enemies.filter(e=>e.x<s.level.fortDoor.insideX-80);
 for(let i=0;i<130;i++)stepFortJourney(s,1/120);expect(s.won).toBe(true);expect(s.fortFade).toBe(1);
 const next=createAdventure(nextAdventureChapter(s.index),false,adventureCarry(s));expect(next.level.chapter).toBe('1-5');expect(next.player.x).toBe(660);expect(next.boss.phase).toBe('sleep');
});

test('the Arlequin arena has no shop and retry restarts the boss',()=>{
 const s=createAdventure(3);expect(shopForLevel(s.level)).toBeNull();s.player.x=370;expect(canEnterShop(s)).toBe(false);
 s.boss.hp=32;s.boss.stage=3;s.done=true;retryAdventure(s);
 expect(s.player.x).toBe(s.level.spawn[0]);expect(s.boss.hp).toBe(720);expect(s.boss.stage).toBe(1);expect(s.level.circusEntrance).toBeUndefined();
 for(let i=0;i<500&&s.boss.phase==='sleep';i++)tick(s,1,{right:true});expect(s.boss.phase).toBe('intro');expect(s.checkpointAt).toBeNull();
});

test('music retains the supplied harbor track and the fire Arlequin theme',()=>{
 for(const [index,boss,path]of [[2,false,'exploration/harbor.mp3'],[2,true,'exploration/harbor.mp3'],[5,false,'exploration/ember-march.wav'],[3,true,'bosses/arlequin_fuego.mp3']]){
  const track=adventureMusic(index,'playing',boss);expect(track.src).toBe('/arcade/music/'+path);expect(fs.statSync('public'+track.src).size).toBeGreaterThan(10000);
 }
});

test('the actual menu presents 1-4 before 1-5 and starts the new land chapter',async({page})=>{
 const folder='tests/artifacts/arcade/ember-revision/';fs.mkdirSync(folder,{recursive:true});
 await page.goto('/arcade');await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir cap/}).click();
 expect(await page.locator('[data-level-choice]').evaluateAll(cards=>cards.map(c=>Number(c.dataset.levelChoice)))).toEqual([0,1,2,5,3,4]);
 await page.locator('[data-level-choice="5"]').scrollIntoViewIfNeeded();await page.locator('[data-chapter-picker]').screenshot({path:folder+'chapter-menu.jpg'});
 await page.locator('[data-level-choice="5"]').click();await page.locator('[data-practice]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 const c=page.locator('[data-adventure-canvas]');await expect(c).toHaveAttribute('data-level','5');const x=Number(await c.getAttribute('data-player-x'));
 await page.keyboard.down('ArrowRight');await expect.poll(async()=>Number(await c.getAttribute('data-player-x'))).toBeGreaterThan(x+160);await page.keyboard.up('ArrowRight');await c.screenshot({path:folder+'actual-start.jpg'});
});
