import {test,expect} from '@playwright/test';
import {openAdventureMenu} from './arcade-input.helpers';
const dir='tests/artifacts/arcade/workshop-evolution/';

test('category purchases charge once across duplicate requests and respect progression and family caps',async({page})=>{
 await page.goto('/arcade');
 const result=await page.evaluate(async()=>{
  const {buyAdventureCategorySlot,SAVE_KEY}=await import('/src/components/arcade/shared/arcadeStore.js');
  localStorage.setItem('magic-drink-arcade:owner-reset:2026-10-06-stage-polish','done');
  const seed={version:1,campaign:2,economy:2,stars:500,modCategorySlots:{drinks:1,boots:1,hat:1,skills:1},adventureUnlocked:0};localStorage.setItem(SAVE_KEY,JSON.stringify(seed));
  const duplicate=await Promise.all([buyAdventureCategorySlot('drinks',1),buyAdventureCategorySlot('drinks',1)]),gated=await buyAdventureCategorySlot('drinks',2),invalid=await buyAdventureCategorySlot('missing',1);
  const after=JSON.parse(localStorage.getItem(SAVE_KEY));localStorage.setItem(SAVE_KEY,JSON.stringify({...after,adventureUnlocked:2}));
  const third=await buyAdventureCategorySlot('drinks',2),fourth=await buyAdventureCategorySlot('drinks',3);
  return{duplicate,gated,invalid,after,third,fourth,final:JSON.parse(localStorage.getItem(SAVE_KEY))};
 });
 expect(result.duplicate.filter(Boolean)).toHaveLength(1);expect(result.after.stars).toBe(440);expect(result.after.modCategorySlots).toEqual({drinks:2,boots:1,hat:1,skills:1});expect(result.gated).toBe(false);expect(result.invalid).toBe(false);expect(result.third).toBe(true);expect(result.fourth).toBe(false);expect(result.final.stars).toBe(300);
});
async function enter(page){
 await page.addInitScript(()=>{localStorage.setItem('magic-drink-arcade:owner-reset:2026-10-06-stage-polish','done');localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,campaign:2,economy:2,stars:3000,modCategorySlots:{drinks:1,boots:1,hat:1,skills:1},modsOwned:['starter-7','starter-8','starter-10','ribbon-duration','starter-9','comet-dive','spring-boots','double-dash','sky-guard','reply-bell','quick-cast','reserve-sleeve'],modsEquipped:['starter-7','spring-boots','sky-guard','quick-cast'],modLevels:{'starter-7':3},adventureUnlocked:4}));localStorage.setItem('magic-drink:arcade:illustrated-finish:v1',JSON.stringify({enabled:true,grain:0,chromatic:0,vignette:0}));});
 await page.route('**/engine/adventureTrial.js*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text()).replace('return s;','window.labState=s;return s;')});});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-practice]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>+document.querySelector('[data-adventure-canvas]').dataset.playerX>315);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyE');await expect(page.locator('[data-adventure-shop]')).toBeVisible();
}
test('equipment families expand independently, two cans persist, and desktop panels remain within bounds',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1920,height:1080});await enter(page);
 await page.getByRole('tab',{name:/Equipamiento/}).click();await page.locator('[data-equipment-category=boots]').click();await page.locator('[data-equipment-mod=double-dash]').click();await expect(page.locator('[data-equip-mod=double-dash]')).toBeDisabled();await page.locator('[data-buy-category-slot=boots]').click();await page.locator('[data-equip-mod=double-dash]').click();
 await expect(page.locator('[data-equipped-slot=double-dash]')).toBeVisible();await page.locator('[data-adventure-shop]').screenshot({path:dir+'equipment-1920.png'});
 await page.locator('[data-equipment-category=drinks]').click();await page.locator('[data-buy-category-slot=drinks]').click();await page.locator('[data-equipment-mod=starter-8]').click();await page.locator('[data-equip-mod=starter-8]').click();await expect(page.locator('[data-equipped-slot=starter-7]')).toBeVisible();await expect(page.locator('[data-equipped-slot=starter-8]')).toBeVisible();
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')));expect(save.modsEquipped).toHaveLength(6);expect(save.stars).toBe(2880);expect(save.modCategorySlots).toEqual({drinks:2,boots:2,hat:1,skills:1});
 await page.setViewportSize({width:2560,height:1440});await page.locator('[data-adventure-shop]').screenshot({path:dir+'equipment-2560.png'});for(const key of ['boots','hat','skills']){await page.locator('[data-equipment-category='+key+']').click();expect(await page.locator('[data-equipment-panel]').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(2);}
 await page.getByRole('tab',{name:/Tienda y patio/}).click();await page.getByRole('searchbox').fill('Volt');await page.locator('[data-mod=starter-9]').click();await page.waitForTimeout(1500);await page.locator('[data-adventure-shop]').screenshot({path:dir+'shop-2560.png'});expect(await page.locator('[data-trial-playing]').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(2);
 await page.setViewportSize({width:1920,height:1080});await page.locator('[data-adventure-shop]').screenshot({path:dir+'shop-1920.png'});expect(await page.locator('[data-trial-playing]').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(2);expect(errors).toEqual([]);
});
test('animated real-engine previews show cartoon beams, ribbon swings, three prisms and training respawns',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1920,height:1080});await enter(page);
 await page.evaluate(()=>{const chunks=[],canvas=document.querySelector('[data-shop-trial]');window.rec=new MediaRecorder(canvas.captureStream(30),{mimeType:'video/webm;codecs=vp9'});window.rec.ondataavailable=e=>chunks.push(e.data);window.rec.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='previews.webm';a.click();};window.rec.start();});
 for(const [name,id]of [['Volt','starter-9'],['Ribbon','ribbon-duration'],['Echo','starter-8'],['Prism','starter-7'],['Honey','starter-10'],['Picado','comet-dive'],['Ala protectora','sky-guard']]){
  await page.getByRole('searchbox').fill(name);await page.locator('[data-mod='+id+']').click();if(['ribbon-duration','starter-8','starter-7','starter-10'].includes(id))await page.getByLabel('Nivel de prueba',{exact:true}).selectOption('3');
  await page.waitForTimeout(900);await page.locator('[data-shop-trial]').screenshot({path:dir+id+'-1.png'});await page.waitForTimeout(1300);await page.locator('[data-shop-trial]').screenshot({path:dir+id+'-2.png'});
 }
 await page.getByRole('searchbox').fill('Prism');await page.locator('[data-mod=starter-7]').click();await page.locator('[data-trial-play]').click();await page.getByLabel('Bebida de prueba',{exact:true}).selectOption('10');await expect(page.locator('[data-shop-trial]')).toHaveAttribute('data-trial-weapon','7');await page.keyboard.press('KeyQ');await expect(page.locator('[data-shop-trial]')).toHaveAttribute('data-trial-weapon','10');await page.waitForTimeout(300);await page.keyboard.press('KeyQ');await expect(page.locator('[data-shop-trial]')).toHaveAttribute('data-trial-weapon','7');
 const wallet=await page.evaluate(()=>localStorage.getItem('magic-drink-arcade-v1'));await page.evaluate(()=>{const s=window.labState;s.player.x=s.enemies[0].x;s.hostile.push({x:s.player.x,y:s.player.y-30,vx:0,vy:0,r:15,life:1,age:0,kind:'streamer'});});await page.waitForTimeout(300);expect(await page.evaluate(()=>window.labState.hearts)).toBe(5);
 await page.evaluate(()=>{for(const e of window.labState.enemies){e.hp=0;e.deadTime=.1;}});await page.waitForTimeout(3400);expect(await page.evaluate(()=>window.labState.enemies.filter(e=>e.hp>0).length)).toBe(3);expect(await page.evaluate(()=>localStorage.getItem('magic-drink-arcade-v1'))).toBe(wallet);
 const download=page.waitForEvent('download');await page.evaluate(()=>window.rec.stop());await(await download).saveAs(dir+'previews.webm');expect(errors).toEqual([]);
});
