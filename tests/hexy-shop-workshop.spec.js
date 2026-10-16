import {test,expect} from '@playwright/test';
import {openAdventureMenu} from './arcade-input.helpers';
import {LOCAL_RESET_KEY} from '../src/components/arcade/shared/arcadeLocalReset';
const dir='tests/artifacts/arcade/shop-lab/';
async function shop(page,stars=0){
 await page.addInitScript(({stars,key})=>{localStorage.setItem(key,'done');localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,economy:2,campaign:2,stars,modSlots:3,modsOwned:[],modsEquipped:[],adventureUnlocked:4,adventureCleared:[0,1,2,3],found:['shore']}));localStorage.setItem('magic-drink:arcade:illustrated-finish:v1',JSON.stringify({enabled:true,grain:0,chromatic:0,vignette:0}));},{stars,key:LOCAL_RESET_KEY});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator(stars===0?'[data-practice]':'[data-insert-coin]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>+document.querySelector('[data-adventure-canvas]').dataset.playerX>315);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyE');await expect(page.locator('[data-adventure-shop]')).toBeVisible();
}
test('wide desktop shop offers every drink for free, isolates trial state, and preserves purchases',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1920,height:1080});await shop(page,0);
 await expect(page.locator('[data-shop-money]')).toHaveText('0');const search=page.getByRole('searchbox');await search.fill('Ribbon');await page.locator('[data-mod=ribbon-duration]').click();await expect(page.locator('[data-buy-mod=ribbon-duration]')).toBeDisabled();
 await expect(page.locator('[data-product-info]')).toContainText('no se compra');await expect(page.locator('[data-mod]')).toHaveCount(1);await expect(page.locator('[data-ribbon-cost]')).toContainText('Sin munición');await page.waitForTimeout(900);await page.locator('[data-adventure-shop]').screenshot({path:dir+'ribbon-dance-1920.png'});const box=await page.locator('[data-shop-trial]').boundingBox();expect(box.width/box.height).toBeCloseTo(16/9,1);await page.locator('[data-open-combos]').click();await expect(page.locator('[data-demo-combo]')).toHaveCount(10);await page.locator('[data-adventure-shop]').screenshot({path:dir+'ribbon-guide-1920.png'});await page.locator('[data-demo-combo=wand-toss]').click();await expect(page.locator('[data-ribbon-guide]')).toHaveCount(0);await page.locator('[data-trial-play]').click();
 const before=await page.evaluate(()=>localStorage.getItem('magic-drink-arcade-v1'));const frame=await page.locator('[data-adventure-canvas]').getAttribute('data-sim-frame');
 await page.keyboard.down('KeyZ');await page.waitForTimeout(1800);await page.keyboard.up('KeyZ');await expect(page.locator('[data-shop-trial]')).toHaveAttribute('data-trial-weapon','12');
 expect(await page.locator('[data-adventure-canvas]').getAttribute('data-sim-frame')).toBe(frame);expect(await page.evaluate(()=>localStorage.getItem('magic-drink-arcade-v1'))).toBe(before);
 await page.keyboard.press('Escape');await expect(page.locator('[data-trial-playing]')).toHaveAttribute('data-trial-playing','false');await expect(page.locator('[data-adventure-shop]')).toBeVisible();
 await search.fill('Volt');await page.locator('[data-mod=starter-9]').click();await page.waitForTimeout(1800);await page.locator('[data-adventure-shop]').screenshot({path:dir+'shop-1920.png'});
 expect(await page.locator('[data-trial-playing]').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(2);
 await page.setViewportSize({width:2560,height:1440});await search.fill('Prism');await page.locator('[data-mod=starter-7]').click();await page.getByLabel('Nivel de prueba',{exact:true}).selectOption('2');await page.waitForTimeout(2200);await page.locator('[data-adventure-shop]').screenshot({path:dir+'shop-2560.png'});
 expect(await page.locator('[data-trial-playing]').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(2);
 for(const node of ['[data-product-info]','[data-trial-play]','[data-buy-mod]']){const b=await page.locator(node).boundingBox();expect(b.width).toBeGreaterThan(20);}
 expect(errors).toEqual([]);
});
test('buy, equip and upgrade remain deliberate and persist independently from the preview level',async({page})=>{
 await shop(page,1500);const initialMoney=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).stars);const search=page.getByRole('searchbox');await search.fill('Prism');await page.locator('[data-mod=starter-7]').click();await page.getByLabel('Nivel de prueba',{exact:true}).selectOption('3');
 await page.locator('[data-buy-mod=starter-7]').click();await expect(page.locator('[data-equip-mod=starter-7]')).toBeVisible();await page.locator('[data-equip-mod=starter-7]').click();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).modsEquipped)).toContain('starter-7');await page.locator('[data-upgrade-mod=starter-7]').click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).modLevels['starter-7'])).toBe(2);
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')));expect(s.modsEquipped).toContain('starter-7');expect(s.stars).toBe(initialMoney-350);
 await search.fill('resorte');await page.locator('[data-mod=spring-boots]').click();await page.locator('[data-buy-mod=spring-boots]').click();await page.locator('[data-equip-mod=spring-boots]').click();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).modsEquipped)).toContain('spring-boots');await page.waitForTimeout(850);await page.locator('[data-adventure-shop]').screenshot({path:dir+'boots.png'});
 await page.getByRole('button',{name:/Volver al camino/}).click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
});
