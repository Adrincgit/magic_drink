import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {LEVELS} from '../src/components/arcade/adventure/world/adventureLevels';
import {adventureMusic} from '../src/components/arcade/adventure/world/adventureWorlds';
import {CHAPTER_ORDER,nextAdventureChapter} from '../src/components/arcade/shared/adventureProgression';
import {sanitizeSave} from '../src/components/arcade/shared/arcadeStore';
import {openAdventureMenu} from './arcade-input.helpers';
const folder='tests/artifacts/arcade/halloween-5-1/';

test('5-1 is a new stable chapter; the former 2-1 retains its identity as 6-1',()=>{
 expect(LEVELS[6].chapter).toBe('5-1');expect(LEVELS[4].chapter).toBe('6-1');expect(LEVELS[4].id).toBe(4);
 expect(CHAPTER_ORDER).toEqual([0,1,2,5,3,6,7,4]);expect(nextAdventureChapter(3)).toBe(6);expect(nextAdventureChapter(6)).toBe(7);
 const old=sanitizeSave({version:1,campaign:2,economy:2,coins:2,stars:85,adventureUnlocked:5,adventureCleared:[3,4],run:{id:'old-ticket',practice:false,chapter:4,earned:12,banked:4}});
 expect(old.campaign).toBe(4);expect(old.adventureUnlocked).toBe(7);expect(old.adventureCleared).toEqual([3,4]);expect(old.run.chapter).toBe(4);expect(old.stars).toBe(85);
 expect(sanitizeSave({...old,run:{...old.run,chapter:6}}).run.chapter).toBe(6);
});
test('the new chapter uses the supplied Witchy-Witchy Town recording',()=>{
 expect(adventureMusic(6,'playing').src).toBe('/arcade/music/exploration/witchy-witchy-town.mp3');
 expect(fs.readFileSync('public/arcade/music/exploration/witchy-witchy-town.mp3').equals(fs.readFileSync('public/arcade/music/for replace/Witchy-Witchy Town.mp3'))).toBe(true);
});
test('the real chapter picker opens 5-1, preserves 6-1 and plays the supplied song',async({page})=>{
 test.setTimeout(90000);fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,campaign:3,economy:2,coins:1,stars:0,adventureUnlocked:6,adventureCleared:[],owned:['plain']})));
 await page.goto('/arcade');await openAdventureMenu(page);const root=page.locator('[data-hexy-adventure]');await expect(root).toHaveAttribute('data-phase','ready',{timeout:30000});
 await page.getByRole('button',{name:/Elegir capítulo/}).click();await expect(page.locator('[data-level-choice="6"]')).toContainText('5-1');await expect(page.locator('[data-level-choice="4"]')).toContainText('6-1');
 await page.locator('[data-chapter-picker]').screenshot({path:folder+'chapter-picker.png'});await page.locator('[data-level-choice="6"]').click();await page.locator('[data-practice]').click();
 await page.locator('[data-chapter-intro]').click();await expect(root).toHaveAttribute('data-phase','playing');await expect(root.locator('audio')).toHaveAttribute('src',/witchy-witchy-town\.mp3/);
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')));expect(save.run.chapter).toBe(6);
 // The opening must keep simulating while no movement key is pressed.
 await expect.poll(async()=>Number(await root.locator('canvas').first().getAttribute('data-sim-frame'))).toBeGreaterThan(180);
 await root.screenshot({path:folder+'real-idle-start.png'});
 await page.keyboard.down('ArrowRight');await page.keyboard.down('z');await page.waitForTimeout(2500);await page.keyboard.up('ArrowRight');await page.keyboard.up('z');await expect(root).toHaveAttribute('data-phase','playing');
 await root.screenshot({path:folder+'real-game.png'});expect(errors).toEqual([]);
});
