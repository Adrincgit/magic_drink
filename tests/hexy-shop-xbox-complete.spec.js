import {test,expect} from '@playwright/test';
import {openAdventureMenu} from './arcade-input.helpers';
import {LOCAL_RESET_KEY} from '../src/components/arcade/shared/arcadeLocalReset';
const dir='tests/artifacts/arcade/global-feedback/';
async function tap(page,id){await page.evaluate(i=>{window.pad.buttons[i]={pressed:true,value:1};},id);await page.waitForTimeout(100);await page.evaluate(()=>window.pad.buttons.forEach(b=>{b.pressed=false;b.value=0;}));await page.waitForTimeout(120);}
test('Xbox alone buys, equips, upgrades, tests, changes sections and unequips without losing focus',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(key=>{
  localStorage.setItem(key,'done');localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,economy:2,campaign:5,stars:8000,modSlots:4,modsOwned:[],modsEquipped:[],adventureUnlocked:10,adventureCleared:[0,1,2,5,3,6,7,8,9,10]}));
  window.pad={id:'Xbox controller fixture',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.pad]});
 },LOCAL_RESET_KEY);
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-insert-coin]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 await page.evaluate(()=>{window.pad.buttons[15]={pressed:true,value:1};});await page.waitForFunction(()=>+document.querySelector('[data-adventure-canvas]').dataset.playerX>315);await page.evaluate(()=>{window.pad.buttons[15]={pressed:false,value:0};});await tap(page,8);
 const root=page.locator('[data-adventure-shop]');await expect(root).toBeVisible();await page.waitForTimeout(250);
 await tap(page,13);await expect(page.locator('[data-mod=starter-5]')).toBeFocused();await tap(page,15);await expect(page.locator('[data-buy-mod=starter-5]')).toBeFocused();
 await tap(page,0);await expect(page.locator('[data-equip-mod=starter-5]')).toBeFocused();await tap(page,0);await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).modsEquipped)).toContain('starter-5');
 await tap(page,13);await expect(page.locator('[data-upgrade-mod=starter-5]')).toBeFocused();await tap(page,0);await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).modLevels['starter-5'])).toBe(2);
 await tap(page,15);await expect(page.locator('[data-trial-play]')).toBeFocused();await tap(page,0);await expect(page.locator('[data-trial-playing]')).toHaveAttribute('data-trial-playing','true');
 await tap(page,7);await tap(page,9);await expect(page.locator('[data-trial-playing]')).toHaveAttribute('data-trial-playing','false');await expect(page.locator('[data-trial-play]')).toBeFocused();
 await tap(page,4);await expect(page.locator('#equipment-tab')).toBeFocused();await expect(page.locator('[data-equipment-panel]')).toBeVisible();await tap(page,13);await expect(page.locator('[data-collection-filter] button')).toBeFocused();await tap(page,13);await expect(page.locator('[data-equipment-mod=starter-5]')).toBeFocused();
 await tap(page,15);await expect(page.locator('[data-equipped-slot=starter-5]')).toBeFocused();await tap(page,0);await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).modsEquipped)).not.toContain('starter-5');
 await tap(page,5);await expect(page.locator('#shop-tab')).toBeFocused();await tap(page,13);await tap(page,13);await expect(page.locator('[data-mod=starter-5]')).toBeFocused();
 await root.screenshot({path:dir+'xbox-workshop.png'});await tap(page,1);await expect(root).toHaveCount(0);expect(errors).toEqual([]);
});
