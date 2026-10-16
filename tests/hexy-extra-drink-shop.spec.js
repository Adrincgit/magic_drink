import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';

test('new flavors load in the real shop, can be bought and one starter can be equipped',async({page})=>{
 test.setTimeout(90000);fs.mkdirSync('tests/artifacts/drink-wave2',{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('magic-drink-arcade:owner-reset:2026-10-06-stage-polish','done');localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,campaign:2,economy:2,coins:2,stars:2000,adventureUnlocked:3,modSlots:1}));});
 await page.goto('/arcade');await openAdventureMenu(page);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready');await page.locator('[data-insert-coin]').click();
 const canvas=page.locator('[data-adventure-canvas]'),shop=page.locator('[data-adventure-shop]');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 await canvas.focus();await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('[data-adventure-canvas]').dataset.playerX)>315);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyE');await expect(shop).toBeVisible();
 const money=Number(await page.locator('[data-shop-money]').textContent());
 for(const kind of [9,10,11]){
  const id='starter-'+kind,item=shop.locator('[data-mod="'+id+'"]');
  for(let i=0;i<10&&!(await item.count());i++)await shop.getByRole('button',{name:'Página siguiente',exact:true}).click();
  await expect(item).toBeVisible();await expect.poll(()=>item.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await item.focus();await item.click();await expect(page.locator('[data-item-popup="'+id+'"]')).toBeVisible();
  await page.locator('[data-buy-mod="'+id+'"]').click();await expect(page.locator('[data-equip-mod]')).toBeVisible();
  
 }
 await page.locator('[data-equip-mod="starter-11"]').click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).modsEquipped)).toContain('starter-11');await expect(page.locator('[data-shop-money]')).toHaveText(String(money-325));
 await shop.screenshot({path:'tests/artifacts/drink-wave2/13-shop.png'});
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')));expect(save.modsOwned).toEqual(expect.arrayContaining(['starter-9','starter-10','starter-11']));expect(save.modsEquipped).toContain('starter-11');expect(errors).toEqual([]);
});
