import {test,expect} from '@playwright/test';
import {openAdventureMenu} from './arcade-input.helpers';
async function enter(page){
 await page.addInitScript(()=>{localStorage.setItem('magic-drink-arcade:owner-reset:2026-10-06-stage-polish','done');localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,campaign:2,economy:2,stars:2000,modSlots:1,adventureUnlocked:4}));});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-practice]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>+document.querySelector('[data-adventure-canvas]').dataset.playerX>315);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyE');await expect(page.locator('[data-adventure-shop]')).toBeVisible();
}
test('shop stays inside the game on desktop, keeps the run paused and supports reduced motion and Escape',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await enter(page);const canvas=page.locator('[data-adventure-canvas]'),shop=page.locator('[data-adventure-shop]'),frame=await canvas.getAttribute('data-sim-frame');
 await page.keyboard.press('KeyR');await page.waitForTimeout(150);expect(await canvas.getAttribute('data-sim-frame')).toBe(frame);await expect(page.locator('audio')).toHaveAttribute('data-music-track','shop');
 for(const width of [1440,1920,2560]){await page.setViewportSize({width,height:Math.round(width*9/16)});const a=await canvas.boundingBox(),b=await shop.boundingBox();for(const k of ['x','y','width','height'])expect(Math.abs(a[k]-b[k])).toBeLessThan(1);await expect(page.locator('[data-trial-play]')).toBeVisible();}
 await shop.focus();await page.keyboard.press('Escape');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await expect(canvas).toBeFocused();expect(+await canvas.getAttribute('data-player-x')).toBeGreaterThan(395);
});
test('a full skills family requires its own purchased slot',async({page})=>{
 await enter(page);for(const id of ['quick-cast','bright-spark']){await page.locator('[data-mod='+id+']').click();await page.locator('[data-buy-mod='+id+']').click();if(id==='quick-cast')await page.locator('[data-equip-mod='+id+']').click();}
 await expect(page.locator('[data-equip-mod=bright-spark]')).toBeDisabled();await page.locator('[data-open-family=skills]').click();await expect(page.locator('[data-equipped-slot]:not([data-equipped-slot=""])')).toHaveCount(1);await page.locator('[data-buy-category-slot=skills]').click();await page.locator('[data-equip-mod=bright-spark]').click();await expect(page.locator('[data-equipped-slot]:not([data-equipped-slot=""])')).toHaveCount(2);
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')));expect(save.stars).toBe(2000-60-80-60);expect(save.modsEquipped).toEqual(['quick-cast','bright-spark']);
});
